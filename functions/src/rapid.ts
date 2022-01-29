import { ObjectMetadata } from "firebase-functions/v1/storage";
import { auditInstantTransactionCreated, auditInstantTransactionFailed, storePlaceAPIUsage, auditVisionAPIUsage, auditInstantTransactionActionNeeded } from "./audit";
import { firestore } from 'firebase-admin';
import { FeatureType } from "./models/vision.model";
import { extractGrabReceiptDate, extractTngReceiptDate, getCurrentTime, storeCloudVisionResult } from "./utils";
import { FInstantAddType, FInstantEntryModel, FInstantEntryStatus, FRapidConfigModel, FRapidConfigType, FTransactionModel, FTransactionReviewModel } from "./models/firestore.model";
import { InstantExceptionConstant, INSTANT_NPC_CONSTANT, INSTANT_NPC_GRAB_CONSTANT } from "./constant/instant.constant";
import { AddressType, Client, FindPlaceFromTextRequest, FindPlaceFromTextResponse, Place, PlaceInputType } from "@googlemaps/google-maps-services-js";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";

const vision = require('@google-cloud/vision');
const path = require('path');

// https://cloud.google.com/vision/docs/ocr#vision_text_detection-nodejs
// https://googleapis.dev/nodejs/vision/latest/index.html
export const performOcr = async (object: ObjectMetadata, tempLocalPathFile: string, uid: string, firestore: firestore.Firestore) => {
  console.log(`Performing OCR to extract information from uploaded image by ${uid} at ${tempLocalPathFile}`);
  let result: any;
  const visionClient = new vision.ImageAnnotatorClient();

  if (process.env.FUNCTIONS_EMULATOR) {
    [result] = await visionClient.documentTextDetection(tempLocalPathFile);
  }
  else {
    [result] = await visionClient.documentTextDetection(`gs://${object.bucket}/${object.name}`);
  }

  if (result) {
    auditVisionAPIUsage(firestore, object.name as string, uid, FeatureType.DOCUMENT_TEXT_DETECTION);
  }

  const detections: any[] = result.textAnnotations;

  if (detections?.length > 0) {
    const extractedText: any = {
      result: true
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
      console.log('No Data Present!');
      return;
    }

    const rawResultString: string = textDetection[0];
    const rawResult: string[] = rawResultString.split('\n');

    switch(instantMetaData.type) {
      case FInstantAddType.TNG_RFID_RECEIPT:
        processRfidReceipt(instantMetaData, instantId, rawResult, firestore);
        break;
      case FInstantAddType.TNG_TRX_RECEIPT:
        processTngReceipt(instantMetaData, instantId, rawResult, firestore);
        break;
      case FInstantAddType.GRAB_FOOD_RECEIPT:
        processGrabFoodReceipt(instantMetaData, instantId, rawResult, firestore);
        break;
      default:
        failedPostProcessing(firestore, instantId, instantMetaData, InstantExceptionConstant.INVALID_INSTANT_TYPE);
        break;
    }
  }
  else {
    console.log('Text Detection returns NO RESULT!', textDetection);
    const fileName: string = path.basename(object.name);
    await failedBeforeOcr(firestore, fileName, InstantExceptionConstant.NO_TEXT_FOUND);
  }
}

const processRfidReceipt = async (meta: FInstantEntryModel, instantId: string, textResult: string[], firestore: firestore.Firestore) => {
  const { paymentMethod, category, uid } = meta;

  if (!paymentMethod || !category || !uid) {
    return;
  }

  preProcess(firestore, instantId);

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

const processTngReceipt = async (meta: FInstantEntryModel, instantId: string, textResult: string[], firestore: firestore.Firestore) => {
  const { paymentMethod, uid } = meta;

  if (!paymentMethod || !uid) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_INSTANT_ENTRY);
    return;
  }

  preProcess(firestore, instantId);

  // Regex for Amount: https://regex101.com/r/LZmlk6/1;
  const amountIndex = textResult.findIndex((result: string) => {
    const amountRegex = /.?RM\s?\d+.\d{2}/mi;

    return amountRegex.test(result);
  });
  
  if (amountIndex === -1) {
    console.log(`Unable to extract amount from uploaded receipt: ${amountIndex}`);
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.NO_AMOUNT_FOUND);
    return;
  }

  const amountRawString: string = textResult[amountIndex].trim();
  const amount: number = +(amountRawString.replace(/.?RM\s?/mi, ''));

  if (Number.isNaN(amount)) {
    console.log('Extracted amount is not a number: ', amountRawString); 
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_AMOUNT);
    return;
  }

  const dateTimeIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Date/Time');
  });

  if (dateTimeIndex === -1) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.NO_DATE_FOUND);
    return;
  }

  const rawDateTime = textResult[dateTimeIndex + 1];
  const transactionDate: Date = extractTngReceiptDate(rawDateTime) as Date;

  if (!transactionDate) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_DATE);
    return;
  }

  const merchantIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Merchant') || result.startsWith('Receiver');
  });

  if (merchantIndex === -1) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_MERCHANT);
    return;
  }

  let merchant = textResult[merchantIndex + 1].trim();
  let remark: string = `Payment to ${merchant}`;
  let merchantBackup!: string;

  const paymentDetailIndex = textResult.findIndex((result: string) => {
    return result.startsWith('Payment Detail');
  });

  if (paymentDetailIndex > -1) {
    const paymentDetail = textResult[paymentDetailIndex + 1].trim();
    remark = paymentDetail ? paymentDetail : remark;
    const isNextIndexReservedWord = INSTANT_NPC_CONSTANT.includes(textResult[merchantIndex + 2]);

    if (!isNextIndexReservedWord && merchantIndex + 2 < paymentDetailIndex) {
      // Merchant name might be too long and break into two line, use this for backup.
      const distanceBetweenData = paymentDetailIndex - (merchantIndex + 1);
      
      let merchantBackupName: string = '';
      if (distanceBetweenData > 0) {
        for (let i = merchantIndex + 1; i < paymentDetailIndex; i++) {
          merchantBackupName = merchantBackupName + ' ' + textResult[i];
        }

        merchantBackup = merchantBackupName.trim();
      }
    }
  }
  else {
    // Attempt to find backup merchant name.
    let nextReservedKeywordIndex: number = -1;

    for (let i = (merchantIndex + 1); i < textResult.length; i++) {
      const currentWord = textResult[i];

      if (currentWord && INSTANT_NPC_CONSTANT.includes(currentWord)) {
        nextReservedKeywordIndex = i;
        break;
      }
    }

    if ((merchantIndex + 1) !== nextReservedKeywordIndex) {
      // Possible Match
      let backupString = '';
      for (let i = (merchantIndex + 1); i < nextReservedKeywordIndex; i++) {
        backupString =  backupString + ' ' + textResult[i]; 
      }

      merchantBackup = backupString.trim();
    }
  }

  const collectionRef = firestore.collection('rapid-config');
  let query = collectionRef.where('configType', '==', FRapidConfigType.MERCHANT_CONFIG).where('uid', '==', uid).where('merchantName', '==', merchant).limit(1);
  let documentSnapshot: firestore.QuerySnapshot = await query.get();

  if (documentSnapshot.empty) {
    let shouldUseGooglePlaceAPI: boolean = true;

    if (merchantBackup) {
      // Query again with backup merchant name
      query = collectionRef.where('configType', '==', FRapidConfigType.MERCHANT_CONFIG).where('uid', '==', uid).where('merchantName', '==', merchantBackup).limit(1);
      documentSnapshot = await query.get();

      if (!documentSnapshot.empty) {
        shouldUseGooglePlaceAPI = false;
        merchant = merchantBackup;
      }
    }

    if (shouldUseGooglePlaceAPI) {
      let searchString: string = merchantBackup ? merchantBackup : merchant;

      if (searchString.search(/malaysia/i) === -1) {
        searchString = `${searchString} Malaysia`.trim();
      }

      const client = new Client({});
      console.log(`Requesting Place Information for ${searchString} from Google Place API...`);
      // https://developers.google.com/maps/documentation/places/web-service/search-find-place#optional-parameters
      const placeRequest: FindPlaceFromTextRequest = {
        params: {
          fields: ['place_id', 'type', 'name', 'formatted_address', 'business_status'],
          input: searchString,
          inputtype: PlaceInputType.textQuery,
          key: process.env.GOOGLE_MAPS_API_KEY as string,
        }
      };

      const placeResult: FindPlaceFromTextResponse = await client.findPlaceFromText(placeRequest);
      const bestMatch: Place = placeResult.data.candidates[0];

      const transactionPayload: Partial<FTransactionModel> = {
        amount,
        paymentMethod,
        remark,
        transactionType: 'normal',
        transactionDate,
        instantEntryRecord: instantId,
        createdDate: getCurrentTime(),
        uid
      };

      if (placeResult && bestMatch) {
        storePlaceAPIUsage(firestore, placeRequest, bestMatch, uid);
        requestManualMode(firestore, instantId, meta, transactionPayload, merchantBackup || merchant, bestMatch);
      }
      else {
        requestManualMode(firestore, instantId, meta, transactionPayload, merchantBackup || merchant);
      }

      return;
    }
  }

  const merchantConfig: FRapidConfigModel = documentSnapshot.docs.map(doc => doc.data())[0] as FRapidConfigModel;

  if (!merchantConfig) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.MISSING_MERCHANT_CONFIG);
    return;
  }

  const merchantCategory: string = merchantConfig.value;

  const transactionPayload: FTransactionModel = {
    amount,
    category: merchantCategory,
    paymentMethod,
    remark,
    transactionType: 'normal',
    transactionDate,
    instantEntryRecord: instantId,
    createdDate: getCurrentTime(),
  };

  successPostProcessing(firestore, transactionPayload, instantId, meta);
};

const processGrabFoodReceipt = async (meta: FInstantEntryModel, instantId: string, textResult: string[], firestore: firestore.Firestore) => {
  preProcess(firestore, instantId);

  const { paymentMethod, category, uid } = meta;

  if (!paymentMethod || !category || !uid) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_INSTANT_ENTRY);
    return;
  }

  const receiptDateIndex = textResult.findIndex((result: string) => {
    // https://regex101.com/r/HZ8fAx/1
    const regex = /^.*\d{2}\s[a-zA-Z]+\s\d{2,4}\s\d{2}:\d{2}.*$/m;
    return regex.test(result);
  });

  if (receiptDateIndex === -1) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.NO_DATE_FOUND);
    return;
  }

  const rawDateTime = textResult[receiptDateIndex];
  const transactionDate: Date = extractGrabReceiptDate(rawDateTime) as Date;

  if (!transactionDate) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_DATE);
    return;
  }

  const merchantIndex = textResult.findIndex((result: string) => {
    const regex = /^Order location.*$/gmi;
    return regex.test(result);
  });

  if (merchantIndex === -1) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_MERCHANT);
    return;
  }

  let merchant = textResult[merchantIndex + 1];

  if (textResult[merchantIndex + 2] && !INSTANT_NPC_GRAB_CONSTANT.includes(textResult[merchantIndex + 2])) {
    merchant = merchant + textResult[merchantIndex + 2];
  }

  let remark: string = `GrabFood from ${merchant}`;

  const deliveryIndex = textResult.findIndex((result: string) => {
    const regex = /^Delivery location.*$/gmi;
    return regex.test(result);
  });

  if (deliveryIndex > -1) {
    remark = remark + ` to ${textResult[deliveryIndex + 1]}`;
  }

  remark = remark + '.';

  const transactionAmountIndex = textResult.findIndex((result: string) => {
    return result.includes('TOTAL (INCL. TAX)');
  });

  if (transactionAmountIndex === -1) {
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.NO_AMOUNT_FOUND);
    return;
  }

  const transactionAmountRawString = textResult[transactionAmountIndex + 1];
  const amount: number = +(transactionAmountRawString.replace(/.?RM\s?/mi, ''));

  if (Number.isNaN(amount)) {
    console.log('Extracted amount is not a number: ', transactionAmountRawString); 
    failedPostProcessing(firestore, instantId, meta, InstantExceptionConstant.INVALID_AMOUNT);
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
        postProcessStatus: FInstantEntryStatus.SUCCESS,
        transactionCreated: newlyAddedId,
        postProcessSuccessDate: getCurrentTime()
      };

      await instantEntryCollectionRef.doc(instantId).update(postPayload);
      auditInstantTransactionCreated(firestore, newlyAddedId, instantId, meta.uid as string);
      return true;
    }

    return false;
  }

  return false;
};

const failedPostProcessing = async (firestore: firestore.Firestore, instantId: string, meta: FInstantEntryModel, error: string) => {
  const instantEntryCollectionRef = firestore.collection('instant-entry');

  const postPayload: FInstantEntryModel = {
    ...meta,
    postProcessSuccess: false,
    postProcessStatus: FInstantEntryStatus.FAILED,
    postProcessFailedDate: getCurrentTime(),
    postProcessFailedReason: error,
  };

  await instantEntryCollectionRef.doc(instantId).update(postPayload);
  auditInstantTransactionFailed(firestore, instantId, meta?.uid as string, error);
}

const requestManualMode = async (firestore: firestore.Firestore, instantId: string, meta: FInstantEntryModel, partialPayload: Partial<FTransactionModel>, merchantName: string, placeResult?: Place) => {
  const transactionReviewModel: Partial<FTransactionReviewModel> = {
    ...partialPayload,
    instantEntryRecord: instantId,
    merchantName
  };

  let suggestionAppliedFromGoogle: boolean = false;
  
  if (placeResult && Array.isArray(placeResult?.types) && placeResult?.types.length > 0) {
    const placeTypes: AddressType[] = placeResult.types.slice(0, 9);
    const rapidConfigCollectionRef = firestore.collection('rapid-config');

    let query = rapidConfigCollectionRef
      .where('configType', '==', FRapidConfigType.PLACE_CONFIG)
      .where('uid', '==', meta.uid)
      .where('placeType', 'in', placeTypes as string[]);
    ;

    const documentSnapshot: firestore.QuerySnapshot = await query.get();

    if (!documentSnapshot.empty) {
      const placeConfigModels: FRapidConfigModel[] = [];
      documentSnapshot.forEach((snapshot: QueryDocumentSnapshot) => {
        placeConfigModels.push(snapshot.data() as FRapidConfigModel);
      });

      if (placeConfigModels.length > 0) {
        const placeCategorySet: string[] = Array.from(new Set<string>(placeConfigModels.map(({ value }) => value)));

        if (placeCategorySet.length === 1) {
          suggestionAppliedFromGoogle = true;
        }

        const firstSuggestion: string = placeCategorySet[0];
        transactionReviewModel.category = firstSuggestion;
      }
      else {
        suggestionAppliedFromGoogle = false;
      }
    }
  }

  const transactionReviewCollectionRef = firestore.collection('transaction-review');
  const instantEntryCollectionRef = firestore.collection('instant-entry');

  const reviewDocRef = await transactionReviewCollectionRef.add(transactionReviewModel);

  if (reviewDocRef) {
    const reviewId: string = reviewDocRef.id;

    const instantEntryProcessing: FInstantEntryModel = {
      ...meta,
      postProcessStatus: suggestionAppliedFromGoogle ? FInstantEntryStatus.REVIEW_NEEDED : FInstantEntryStatus.MANUAL_NEEDED,
      transactionPendingReview: reviewId as string,
    };

    await instantEntryCollectionRef.doc(instantId).update(instantEntryProcessing);
    auditInstantTransactionActionNeeded(firestore, instantId, reviewId, meta.uid as string);
  }
}

const preProcess = async (firestore: firestore.Firestore, instantId: string) => {
  const instantEntryCollectionRef = firestore.collection('instant-entry');
  const partialPayload: Partial<FInstantEntryModel> = {
    postProcessStatus: FInstantEntryStatus.PROCESSING
  };

  await instantEntryCollectionRef.doc(instantId).set(partialPayload, { merge: true });
}

export const failedBeforeOcr = async (firestore: firestore.Firestore, fileName: string, reason: string) => {
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

  await failedPostProcessing(firestore, instantId, instantMetaData, reason);
}