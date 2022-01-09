import * as admin from 'firebase-admin';
import { Change } from 'firebase-functions/v1';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { ChangeTypeEnum } from './constant/change.constant';
import { FeatureType, Likelihood, SafeSearchAnnotation } from './models/vision.model';
import { firestore } from 'firebase-admin';
import * as fs from 'fs';
import * as os from 'os';
import { FFileModel } from './models/firestore.model';
import { auditTransactFileTagging } from './audit';

const spawn = require('child-process-promise').spawn;
const path = require('path');

export const getCurrentTime = () => admin.firestore.Timestamp.now();

export const getChangeType = (change: Change<DocumentSnapshot>): ChangeTypeEnum | any => {
  const before: boolean = change.before.exists;
  const after: boolean = change.after.exists;

  if (!before && after) {
    return ChangeTypeEnum.CREATE;
  }
  else if (before && after) {
    return ChangeTypeEnum.UPDATE;
  }
  else if (before && !after) {
    return ChangeTypeEnum.DELETE;
  }
  else {
    console.warn(`Unknown Firestore Event: before: ${before}, after: ${after}.`);
    return null;
  }
}

export const getDoc = (change: Change<DocumentSnapshot>) : any => {
  return change.before.data() || change.after.data();
}

export const getId = (change: Change<DocumentSnapshot>) : any => {
  return change.before.id || change.after.id;
}

export const isExplicitImage = (safeSearchAnnotation: SafeSearchAnnotation): boolean => {
  // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#safesearchannotation
  const EXPLICIT_CRITERIA: Likelihood[] = [
    Likelihood.POSSIBLE,
    Likelihood.LIKELY,
    Likelihood.VERY_LIKELY,
  ];
  
  const EXPLICIT_CRITERIA_LOOSEN: Likelihood[] = [
    Likelihood.LIKELY,
    Likelihood.VERY_LIKELY,
  ];

  if (!safeSearchAnnotation || (safeSearchAnnotation && Object.keys(safeSearchAnnotation).length === 0)) {
    return true;
  }

  /**
   * adult: 
   * Represents the adult content likelihood for the image. 
   * Adult content may contain elements such as nudity, pornographic images or cartoons, or sexual activities.
   * 
   * spoof:
   * Spoof likelihood. 
   * The likelihood that an modification was made to the image's canonical version to make it appear funny or offensive.
   * 
   * medical:
   * Likelihood that this is a medical image.
   * 
   * violence:
   * Likelihood that this image contains violent content.
   * 
   * racy:
   * Likelihood that the request image contains racy content. 
   * Racy content may include (but is not limited to) skimpy or sheer clothing, strategically covered nudity, lewd or provocative poses, or close-ups of sensitive body areas.
   */
  const { adult, spoof, medical, violence, racy } = safeSearchAnnotation;

  return EXPLICIT_CRITERIA.includes(adult) || 
    EXPLICIT_CRITERIA_LOOSEN.includes(spoof) ||
    EXPLICIT_CRITERIA.includes(medical) ||
    EXPLICIT_CRITERIA.includes(violence) || 
    EXPLICIT_CRITERIA.includes(racy);
}

export const storeCloudVisionResult = async <T>(firestore: firestore.Firestore, result: T, type: FeatureType, object: ObjectMetadata, uid: string) => {
  try {
    const payload: any = {
      ...result,
      featureType: type,
      queryDate: getCurrentTime(),
      contentType: object.contentType,
      fileName: object.name,
      fileCreatedDate: object.timeCreated,
      fileSize: object.size,
      bucket: object.bucket,
      uid
    };
  
    const docRef: firestore.DocumentReference = await firestore.collection('cloud-vision-api-result').add(payload);

    if (docRef) {
      return docRef.id;
    }
  }
  catch(_) {
    console.log('Failed to store cloud vision result');
    return null;
  }

  return null;
}

export const processSafeImage = async (bucket: any, fileName: string, filePath: string, tempFilePath: string, object: ObjectMetadata) => {
  console.log(`Processing safe image(${object.contentType}) at ${tempFilePath}.`);
  try {
    const files = fs.readdirSync(os.tmpdir());
    let filePresent: boolean = false;
    const metadata: any = {
      contentType: object.contentType,
    };

    files.forEach((file) => {
      if (file === fileName) {
        filePresent = true;
      }
    });

    if (filePresent) {
      const fileDescriptor = fs.openSync(tempFilePath, 'r');

      if (fileDescriptor !== undefined) {
        fs.closeSync(fileDescriptor);
      }
    }
    else {
      return null;
    }

    await spawn('convert', [tempFilePath, '-quality', 70, tempFilePath]);

    const resizeFileName: string = `resized_${fileName}`;
    const resizeFilePath: string = path.join(path.dirname(filePath), resizeFileName);
  
    await bucket.upload(tempFilePath, {
      destination: resizeFilePath,
      metadata,
    });
  
    console.log(`Compressed image ${resizeFilePath} has been uploaded.`);
  
    await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
    const thumbFileName: string = `thumb_${fileName}`;
    const thumbnailFilePath: string = path.join(path.dirname(filePath), thumbFileName);
  
    await bucket.upload(tempFilePath, {
      destination: thumbnailFilePath,
      metadata,
    });
  
    console.log(`Thumbnail image ${thumbnailFilePath} has been uploaded.`);
  
    return {
      resizeFileName,
      resizeFilePath,
      thumbFileName,
      thumbnailFilePath
    };
  }
  catch(error) {
    console.log(error);
    return null;
  }
}

export const addFileUploadEntry = async (firestore: firestore.Firestore, fileName: string, object: ObjectMetadata, uid: string, processedResult?: Partial<FFileModel>, ...screenResult: any[]) =>{
  let payload: FFileModel = {
    fileName,
    type: object.contentType || '',
    uid,
    fullPath: object.name || '',
    bucket: object.bucket || '',
    fileCreatedDate: object.timeCreated,
    ...(processedResult || {})
  };

  if (Array.isArray(screenResult)) {
    payload.screenResult = screenResult;
  }

  firestore.collection('file-upload-meta').add(payload);
}

export const updateTrxAfterFileUpload = async (firestore: firestore.Firestore, fileName: string, uid: string, fileResult: Partial<FFileModel>) => {
  const collectionRef: firestore.CollectionReference = firestore.collection('transactions');

  const querySnapshot: firestore.QuerySnapshot = await collectionRef.where('receipt', '==', fileName).where('uid', '==', uid).get();

  querySnapshot.forEach(async (snapshot: QueryDocumentSnapshot) => {
    if (snapshot.exists) {
      const data = snapshot.data();
      const id: string = snapshot.id;

      const { resizeFileName, thumbFileName } = fileResult;

      let payload: any = {
        ...data,
        receiptReviewed: true,
        receiptReviewedDate: getCurrentTime(),
      };

      if (resizeFileName) {
        payload = {
          ...payload,
          receipt: resizeFileName,
        };
      }

      if (thumbFileName) {
        payload = {
          ...payload,
          receiptThumbnail: thumbFileName,
        };
      }

      await collectionRef.doc(id).update(payload);
      
      auditTransactFileTagging(firestore, id, fileName, uid);
    }
  });

}