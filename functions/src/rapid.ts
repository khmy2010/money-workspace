import { ObjectMetadata } from "firebase-functions/v1/storage";
import { auditVisionAPIUsage } from "./audit";
import { firestore } from 'firebase-admin';
import { FeatureType } from "./models/vision.model";
import { extractTngReceiptDate, getCurrentTime, storeCloudVisionResult } from "./utils";
import { FInstantAddType, FInstantEntryModel, FTransactionModel } from "./models/firestore.model";

const vision = require('@google-cloud/vision');
const path = require('path');

// https://cloud.google.com/vision/docs/ocr#vision_text_detection-nodejs
// https://googleapis.dev/nodejs/vision/latest/index.html
export const performOcr = async (object: ObjectMetadata, tempLocalPathFile: string, uid: string, firestore: firestore.Firestore) => {
  let result: any;
  const visionClient = new vision.ImageAnnotatorClient();

  if (process.env.FUNCTIONS_EMULATOR) {
    [result] = await visionClient.documentTextDetection(tempLocalPathFile);
  }
  else {
    [result] = await visionClient.documentTextDetection(
      `gs://${object.bucket}/${object.name}`
    );
  }

  if (result) {
    auditVisionAPIUsage(firestore, object.name as string, uid, FeatureType.DOCUMENT_TEXT_DETECTION);
  }

  const detections: any[] = result.textAnnotations;

  if (detections?.length > 0) {
    const extractedText: any = {
      result: detections.map(({ description }) => description)
    };

    await storeCloudVisionResult(firestore, extractedText, FeatureType.DOCUMENT_TEXT_DETECTION, object, uid);
  }

  const textDetection: string[] = detections.map(({ description }) => description);

  if (textDetection?.length > 0) {
    const fileName: string = path.basename(object.name);
    const collectionRef = firestore.collection('instant-entry');
    const query = collectionRef.where('fileName', '==', fileName).limit(1);
    const documentSnapshot: firestore.QuerySnapshot = await query.get();

    if (documentSnapshot.empty) {
      console.log('No Data Present!');
      return;
    }

    const instantMetaData: FInstantEntryModel = documentSnapshot.docs.map(doc => doc.data())[0] as FInstantEntryModel;
    const instantId: string = documentSnapshot.docs.map(doc => doc.id)[0] as string;

    if (!instantMetaData) {
      return;
    }

    const rawResultString: string = textDetection[0];
    const rawResult: string[] = rawResultString.split('\n');

    switch(instantMetaData.type) {
      case FInstantAddType.TNG_RFID_RECEIPT:
        processRfidReceipt(instantMetaData, instantId, rawResult, firestore);
        break;
    }
  }
}

const processRfidReceipt = async (meta: FInstantEntryModel, instantId: string, textResult: string[], firestore: firestore.Firestore) => {
  const { paymentMethod, category, uid } = meta;

  if (!paymentMethod || !category || !uid) {
    return;
  }

  const amountIndex = textResult.findIndex((result: string) => {
    return result.startsWith('-RM');
  });

  if (amountIndex === -1) {
    return;
  }

  const amountRawResult: string = textResult[amountIndex].replace('-RM', '');
  const amount: number = +amountRawResult;
  
  if (amount === undefined || amount === null || amount <= 0) {
    return;
  }

  const actualEntryIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Actual-Entry');
  });

  if (actualEntryIndex === -1) {
    return;
  }

  const actualEntry: string = textResult[actualEntryIndex + 1];

  const actualExitIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Actual-Entry');
  });

  if (actualExitIndex === -1) {
    return;
  }

  const actualExit: string = textResult[actualExitIndex + 1];
  
  let remark!: string;

  if (actualEntry === actualExit) {
    remark = `Toll payment at ${actualEntry} using RFID.`;
  }
  else {
    remark = `For payment of using the toll from ${actualEntry} to ${actualExit} using RFID.`;
  }

  const dateTimeIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Date/Time');
  });

  if (dateTimeIndex === -1) {
    return;
  }

  const rawDateTime = textResult[dateTimeIndex + 1];
  const transactionDate: Date = extractTngReceiptDate(rawDateTime) as Date;

  if (!transactionDate) {
    return;
  }

  const payload: FTransactionModel = {
    transactionDate,
    category,
    amount,
    remark,
    paymentMethod,
    transactionType: 'normal',
    createdDate: getCurrentTime(),
    uid,
    instantEntryRecord: instantId,
  };

  successPostProcessing(firestore, payload, instantId, meta);
}

const successPostProcessing = async (firestore: firestore.Firestore, payload: FTransactionModel, instantId: string, meta: FInstantEntryModel) => {
  const instantEntryCollectionRef = firestore.collection('instant-entry');
  const transactionCollectionRef = firestore.collection('transactions');

  const transactionDocRef: firestore.DocumentReference = await transactionCollectionRef.add(payload);

  if (transactionDocRef) {
    const newlyAddedId = transactionDocRef.id;
    
    if (newlyAddedId) {
      const postPayload: FInstantEntryModel = {
        ...meta,
        postProcessSuccess: true,
        transactionCreated: newlyAddedId,
        postProcessSuccessDate: getCurrentTime()
      };

      await instantEntryCollectionRef.doc(instantId).update(postPayload);
      return true;
    }

    return false;
  }

  return false;
};