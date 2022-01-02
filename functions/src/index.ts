import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { Change, EventContext } from 'firebase-functions';
import { getCurrentTime } from './utils';
import { AuditTrailConstant, ModuleConstant } from './constant';
import { UserRecord } from 'firebase-functions/v1/auth';
import { FAuditTrailModel, FCategoryModel, FTransactionModel } from './models/firestore.model';
import { CallableContext } from 'firebase-functions/v1/https';

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

  if (uid) {
    await firestore.collection('users').doc(uid).set({
      lastLogin: now
    }, { merge: true });

    const payload: FAuditTrailModel = {
      entryPoint: AuditTrailConstant.USER_LOGIN,
      clientIp: context.rawRequest.ip ?? 'Unknown',
      module: ModuleConstant.AUTH,
      action: `${uid} log in.`,
      uid: uid,
      auditDate: now
    };

    await firestore.collection('user-logs').add(payload);

    return now.toDate();
  }

  return 'Unable to find a valid user.';
});

export const transactionAudit = functions.firestore
  .document('transactions/{transaction}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: EventContext) => {
    const payload: FAuditTrailModel = {
      entryPoint: AuditTrailConstant.TRANSACTIONS,
      module: ModuleConstant.TRANSACTIONS,
      action: `A transaction ${snapshot.id} has been created (remarks: ${snapshot.data()?.remark || '-'}).`,
      uid: snapshot.data()?.uid ?? 'Unknown',
      auditDate: getCurrentTime(),
      eventType: context?.eventType
    };

    const user: UserRecord = await admin.auth().getUser(snapshot.data()?.uid);
    
    if (user) {
      console.log(`${user.displayName} has created a transaction ${snapshot.id} (remarks: ${snapshot.data()?.remark || '-'})`);
    }

    return firestore.collection('user-logs').add(payload);
  });

export const transactionWriteHandler = functions.firestore
  .document('transactions/{transaction}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    // https://firebase.google.com/docs/firestore/solutions/aggregation
    const transactionDoc: FTransactionModel = (change.after.data() || change.before.data()) as FTransactionModel;
    const isDelete: boolean = !change.after.data() && !!change.before.data();
    const isUpdate: boolean = !!change.before.data() && !!change.after.data();
    const isCreation: boolean = !change.before.data() && !!change.after.data();

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

export const auditTrailMetaHandler = functions.firestore
  .document('user-logs/{log}')
  .onWrite(async (change: Change<DocumentSnapshot>) => {
    const isDelete: boolean = !change.after.data() && !!change.before.data();
    const isCreation: boolean = !change.before.data() && !!change.after.data();
    const auditTrail: FAuditTrailModel = (change.after.data() || change.before.data()) as FAuditTrailModel;

    if (auditTrail) {
      const userMetaRef = await firestore.collection('meta').doc(auditTrail?.uid as string);
      
      if ((await userMetaRef.get()).exists) {
        const userMetaDoc = (await userMetaRef.get()).data();
        let userLogCount: number = userMetaDoc?.activityLogs ?? 0;
        let oriCount = userLogCount;

        if (isDelete) {
          userLogCount = userLogCount - 1;
        }
        else if (isCreation) {
          userLogCount = userLogCount + 1;
        }

        userLogCount = userLogCount > 0 ? userLogCount : 0;

        if (oriCount !== userLogCount) {
          userMetaRef.set({
            activityLogs: userLogCount
          });
        }
      }
      else {
        userMetaRef.create({
          activityLogs: 1,
          uid: auditTrail?.uid
        });
      }
    }
  })