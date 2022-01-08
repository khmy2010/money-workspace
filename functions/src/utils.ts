import * as admin from 'firebase-admin';
import { Change } from 'firebase-functions/v1';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { ChangeTypeEnum } from './constant/change.constant';
import { FeatureType, Likelihood, SafeSearchAnnotation } from './models/vision.model';
import { firestore } from 'firebase-admin';

const spawn = require('child-process-promise').spawn;
const path = require('path');
const fs = require('fs');

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
  const EXPLICIT_CRITERIA: Likelihood[] = [
    Likelihood.POSSIBLE,
    Likelihood.LIKELY,
    Likelihood.VERY_LIKELY,
  ];

  if (!safeSearchAnnotation || (safeSearchAnnotation && Object.keys(safeSearchAnnotation).length === 0)) {
    return true;
  }

  const { adult, spoof, violence, racy } = safeSearchAnnotation;

  return EXPLICIT_CRITERIA.includes(adult) || 
    EXPLICIT_CRITERIA.includes(spoof) ||
    EXPLICIT_CRITERIA.includes(violence) || 
    EXPLICIT_CRITERIA.includes(racy);
}

export const storeCloudVisionResult = <T>(firestore: firestore.Firestore, result: T, type: FeatureType, object: ObjectMetadata, uid: string) => {
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
  
    firestore.collection('cloud-vision-api-result').add(payload);
  }
  catch(_) {
    console.log('Failed to store cloud vision result');
  }
}

export const processSafeImage = async (bucket: any, fileName: string, filePath: string, tempFilePath: string, object: ObjectMetadata) => {
  console.log(`Processing safe image at ${tempFilePath} for ${fileName}.`);
  try {
    await spawn('ls');
    await spawn('convert', [tempFilePath, '-quality', 75, tempFilePath]);

    const resizeFileName: string = `resized_${fileName}`;
    const resizeFilePath: string = path.join(path.dirname(filePath), resizeFileName);
  
    await bucket.upload(tempFilePath, {
      destination: resizeFilePath,
      metadata: object.metadata
    });
  
    console.log(`Compressed image ${resizeFilePath} has been uploaded.`);
  
    await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
    const thumbFileName: string = `thumb_${fileName}`;
    const thumbnailFilePath: string = path.join(path.dirname(filePath), thumbFileName);
  
    await bucket.upload(tempFilePath, {
      destination: thumbnailFilePath,
      metadata: object.metadata
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
    fs.unlinkSync(tempFilePath);
    return null;
  }
}