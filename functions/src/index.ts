import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { Change, EventContext } from 'firebase-functions';
import { AuditTrailConstant, ModuleConstant } from './constant';
import { UserRecord } from 'firebase-functions/v1/auth';
import { AuditTrailRequestModel, FAuditTrailModel, FCategoryModel, FPaymentMethodModel, FTransactionModel } from './models/firestore.model';
import { CallableContext } from 'firebase-functions/v1/https';
import { audit, auditCategory, auditFileFailedCheck, auditFileUploaded, auditLogin, auditLogout, auditTransaction, auditVisionAPIUsage } from './audit';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { FeatureType, SafeSearchAnnotation } from './models/vision.model';
import { addFileUploadEntry, isExplicitImage, processSafeImage, storeCloudVisionResult, updateTrxAfterFileUpload } from './utils';

// Node.js core modules
// const fs = require('fs');
// const {promisify} = require('util');
// const exec = promisify(require('child_process').exec);
// const path = require('path');
// const os = require('os');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Vision API
const vision = require('@google-cloud/vision');

admin.initializeApp();

const firestore = admin.firestore();

export const createUserStore = functions.auth.user().onCreate(async (user: UserRecord) => {
  const { uid, displayName, email, photoURL } = user;

  console.log(`Attemping to create user ${uid}`);
  const now = admin.firestore.Timestamp.now();

  await firestore.collection(`users`).doc(uid).set({
    uid,
    displayName,
    email,
    photoURL,
    createdDate: now,
    lastLoginDate: now,
  });

  console.log(`Attempting to create a default payment method for user ${uid}`);
  const defaultPaymentMethod: any = {
    name: 'Cash',
    type: 'cash',
    uid,
    createdDate: now,
    status: 'active',
  };

  await firestore.collection('payment-methods').add(defaultPaymentMethod);

  const payload: FAuditTrailModel = {
    entryPoint: AuditTrailConstant.USER_CREATION,
    module: ModuleConstant.AUTH,
    action: `${uid} created an account.`,
    uid: uid,
    auditDate: now
  };

  await firestore.collection('user-logs').add(payload);

  console.log(user.uid + ' has been created in Firestore.');
});

export const userLogin = functions.https.onCall(async (data, context: CallableContext) => {
  const uid: any = context.auth?.uid;
  const now = admin.firestore.Timestamp.now();
  console.log(`Receiving login request from ${context.rawRequest.ip}`);

  if (uid && (await firestore.collection('users').doc(uid).get()).exists) {
    await firestore.collection('users').doc(uid).set({
      lastLogin: now
    }, { merge: true });

    auditLogin(firestore, context, uid);

    return now.toDate();
  }

  return 'Unable to find a valid user.';
});

export const userLogout = functions.https.onCall(async (data, context: CallableContext) => {
  const uid: any = context.auth?.uid;
  console.log(`Receiving logout request from ${context.rawRequest.ip}`);
  auditLogout(firestore, context, uid);
});

export const transactionWriteHandler = functions.firestore
  .document('transactions/{transaction}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    // https://firebase.google.com/docs/firestore/solutions/aggregation
    const transactionDoc: FTransactionModel = (change.after.data() || change.before.data()) as FTransactionModel;
    const isDelete: boolean = !change.after.data() && !!change.before.data();
    const isUpdate: boolean = !!change.before.data() && !!change.after.data();
    const isCreation: boolean = !change.before.data() && !!change.after.data();

    auditTransaction(firestore, change, context);

    await firestore.runTransaction((async (transaction) => {
      const transactionCategoryId: string = transactionDoc?.category;

      // Update Categories
      if (transactionCategoryId) {
        const categoryDocRef = await firestore.collection('categories').doc(transactionCategoryId);
        const categoryDoc: DocumentSnapshot = await transaction.get(categoryDocRef);

        if (categoryDoc) {
          const categoryDetail: FCategoryModel = categoryDoc.data() as FCategoryModel;

          if (categoryDetail) {
            let newAggregatedCount: number = (categoryDetail?.aggregatedCount || 0);
            let newAggregatedSpending: number = (categoryDetail?.aggregatedSpending || 0);

            if (isDelete) {
              newAggregatedCount = newAggregatedCount - 1;
              newAggregatedSpending = newAggregatedSpending - (transactionDoc?.amount || 0);
            }
            else if (isUpdate) {
              const oriTransactionDoc: FTransactionModel = change.before.data() as FTransactionModel;
              const newTransactionDoc: FTransactionModel = change.after.data() as FTransactionModel;

              if (oriTransactionDoc && newTransactionDoc) {
                newAggregatedSpending = newAggregatedSpending - (oriTransactionDoc.amount || 0) + (newTransactionDoc.amount || 0);
              }
            }
            else if (isCreation) {
              newAggregatedCount = newAggregatedCount + 1;
              newAggregatedSpending = newAggregatedSpending + (transactionDoc?.amount || 0);
            }

            transaction.set(categoryDocRef, {
              aggregatedCount: newAggregatedCount,
              aggregatedSpending: newAggregatedSpending
            }, { merge: true });

            console.log(`${categoryDetail.name} has been aggregated with count ${newAggregatedCount} and spending ${newAggregatedSpending}.`);
          }
        }
      }
      else {
        console.warn('NO TRANSACTION CATEGORY ID FOUND FROM THIS TRANSACTION!');
      }

      // Update Today Figure
      // const today: Date = new Date();
      // const todayString: string = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
      // const todayRef = firestore.collection('dayend').doc(todayString);

      // const uid = context.
    }));

    return true;
  });

export const categoryWriteHandler = functions.firestore
  .document('categories/{category}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    auditCategory(firestore, change, context);
  });

export const paymentMethodWriteHandler = functions.firestore
  .document('payment-methods/{pmethod}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    const requestModel: AuditTrailRequestModel = {
      entryPoint: AuditTrailConstant.PAYMENT_METHOD,
      module: ModuleConstant.PM,
      itemName: 'payment method',
      metaName: 'name',
      metaKey: 'name'
    };

    audit<FPaymentMethodModel>(firestore, change, context, requestModel);
  });

export const processUpload = functions.storage.object().onFinalize(async (object: ObjectMetadata) => {
  const filePath: string = object.name as string;
  const user = filePath.split('/')[0];
  const fileBucket: string = object.bucket;
  const bucket = admin.storage().bucket(fileBucket);
  const fileName: string = path.basename(filePath);
  const tempLocalPathFile = path.join(os.tmpdir(), fileName);
  let fileDownloadedFlag: boolean = false;

  if (fileName.startsWith('resized_') || fileName.startsWith('thumb_') ) {
    // CF Generated File
    return console.log('CF Generated File, no processing needed.');
  }

  if (filePath && user) {
    let safeSearchResultId!: string | null;

    if (object.contentType?.startsWith('image')) {
      console.log(`Uploaded file ${filePath} is an image, invoking Google Cloud Vision API...`);
      await bucket.file(filePath).download({ destination: tempLocalPathFile, validation: false });
      fileDownloadedFlag = true;
      console.log(`Image downloaded locally to ${tempLocalPathFile} for processing.`);
      const visionClient = new vision.ImageAnnotatorClient();
      let explicitResult: boolean = true;

      try {
        if (process.env.FUNCTIONS_EMULATOR) {
          console.log('Running in a simulator environment');
          const [result] = await visionClient.safeSearchDetection(tempLocalPathFile);

          auditVisionAPIUsage(firestore, filePath, user);
  
          if (result) {
            const detections: SafeSearchAnnotation = result.safeSearchAnnotation;
            explicitResult = isExplicitImage(detections);
            safeSearchResultId = await storeCloudVisionResult(firestore, detections, FeatureType.SAFE_SEARCH_DETECTION, object, user);
          }
          else {
            console.log('There is no result from Google Cloud Vision API.');
          }
        }
        else {
          const [result] = await visionClient.safeSearchDetection(
            `gs://${object.bucket}/${filePath}`
          );

          auditVisionAPIUsage(firestore, filePath, user);
  
          if (result) {
            const detections: SafeSearchAnnotation = result.safeSearchAnnotation;
            explicitResult = isExplicitImage(detections);
            safeSearchResultId = await storeCloudVisionResult(firestore, detections, FeatureType.SAFE_SEARCH_DETECTION, object, user);
          }
          else {
            console.log('There is no result from Google Cloud Vision API.');
          }
        }

      }
      catch(error) {
        console.log('An Error has occured when calling Google Cloud Vision API: ', error);
      }

      if (explicitResult) {
        await bucket.file(filePath).delete();
        auditFileFailedCheck(firestore, fileName, user);
      }
      else {
        const result = await processSafeImage(bucket, fileName, filePath, tempLocalPathFile, object);

        if (result) {
          auditFileUploaded(firestore, fileName, user, result);
          addFileUploadEntry(firestore, fileName, object, user, result, safeSearchResultId);

          if (fileName.includes('transaction_receipt')) {
            updateTrxAfterFileUpload(firestore, fileName, user);
          }
        }
      }
    }
    else {

    }
  }

  if (fileDownloadedFlag) {
    try {
      console.log('Cleaning up temp file environment...');
      fs.unlinkSync(tempLocalPathFile);
      console.log(`Temp file generated for processing has been cleaned up: ${tempLocalPathFile}`);
    }
    catch(_) {
      console.log(`${tempLocalPathFile} appeared to be non existent, no clean-up has been performed.`);
    }
  }
});