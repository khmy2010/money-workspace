import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { Change, EventContext } from 'firebase-functions';
import { AuditTrailConstant, ModuleConstant } from './constant';
import { UserRecord } from 'firebase-functions/v1/auth';
import { AuditTrailRequestModel, FAuditTrailModel, FCategoryModel, FPaymentMethodModel, FTransactionModel } from './models/firestore.model';
import { CallableContext } from 'firebase-functions/v1/https';
import { audit, auditCategory, auditLogin, auditLogout, auditTransaction, auditVisionAPIUsage } from './audit';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { SafeSearchAnnotation } from './models/vision.model';
import { isExplicitImage } from './utils';

// Node.js core modules
// const fs = require('fs');
// const {promisify} = require('util');
// const exec = promisify(require('child_process').exec);
// const path = require('path');
// const os = require('os');

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
  const fileName: string = object.name as string;
  const user = fileName.split('/')[0];

  console.log('jsdfklsjfslkjf: ', fileName);
  console.log('user', user);
  if (fileName && user) {
    console.log(`processing newly uploaded file ${fileName}...`);

    // Process With Google Cloud Vision API
    if (object.contentType?.startsWith('image')) {
      console.log(`Uploaded file ${fileName} is an image, invoking Google Cloud Vision API...`);
      const visionClient = new vision.ImageAnnotatorClient();

      try {
        if (process.env.FUNCTIONS_EMULATOR) {
          console.log('Running in a simulator environment');
           // TODO: Get Image From Simulator and Pass to Vision API
        }
        else {
          const [result] = await visionClient.safeSearchDetection(
            `gs://${object.bucket}/${fileName}`
          );

          auditVisionAPIUsage(firestore, fileName, user);
  
          if (result) {
            const detections: SafeSearchAnnotation = result.safeSearchAnnotation;
            const explicitResult: boolean = isExplicitImage(detections);
            console.log(`Explicit Result for ${fileName}: ${explicitResult ? 'YES' : 'NO'}`);
          }
          else {
            console.log('There is no result from Google Cloud Vision API.');
          }
        }

      }
      catch(error) {
        console.log('An Error has occured when calling Google Cloud Vision API: ', error);
      }

      // const safeSearchResult = data[0].safeSearchAnnotation;
      console.log('Safe Search')
    }
    else {

    }

  }
});