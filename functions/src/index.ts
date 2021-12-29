import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { EventContext } from 'firebase-functions';
import { getCurrentTime } from './utils';
import { AuditTrailModel } from './models/audit-trail.model';
import { AuditTrailConstant, ModuleConstant } from './constant';
import { UserRecord } from 'firebase-functions/v1/auth';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

const firestore = admin.firestore();

export const createUserStore = functions.auth.user().onCreate(async (user: any) => {
  const { uid, displayName, email, photoURL } = user;

  console.log(`Attemping to create user ${uid}`);
  const now = admin.firestore.Timestamp.now();

  await firestore.collection(`users`).doc(uid).set({
    uid,
    displayName,
    email,
    photoURL,
    createdDate: now,
    lastLogin: now,
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

  console.log(user.uid + ' has been created in Firestore.');
});

export const transactionAudit = functions.firestore
  .document('transactions/{transaction}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: EventContext) => {
    const payload: AuditTrailModel = {
      entryPoint: AuditTrailConstant.TRANSACTIONS,
      module: ModuleConstant.TRANSACTIONS,
      action: `A transaction ${snapshot.id} has been created (remarks: ${snapshot.data()?.remark || '-'}).`,
      user: snapshot.data()?.uid ?? 'Unknown',
      time: getCurrentTime(),
      eventType: context?.eventType
    };

    const user: UserRecord = await admin.auth().getUser(snapshot.data()?.uid);
    
    if (user) {
      console.log(`${user.displayName} has created a transaction ${snapshot.id} (remarks: ${snapshot.data()?.remark || '-'})`);
    }

    return firestore.collection('user-logs').add(payload);
  });