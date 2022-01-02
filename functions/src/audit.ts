import { AuditTrailConstant, ModuleConstant } from './constant';
import { FAuditTrailModel } from './models/firestore.model';
import { getCurrentTime } from './utils';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { UserRecord } from 'firebase-functions/v1/auth';
import { QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { EventContext } from 'firebase-functions/v1';
import { CallableContext } from 'firebase-functions/v1/https';

export const auditTransaction = async (firestore: firestore.Firestore, snapshot: QueryDocumentSnapshot, context: EventContext) => {
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

  firestore.collection('user-logs').add(payload);
}

export const auditLogin = async (firestore: firestore.Firestore, context: CallableContext, uid: string) => {
  const payload: FAuditTrailModel = {
    entryPoint: AuditTrailConstant.USER_LOGIN,
    clientIp: context.rawRequest.ip ?? 'Unknown',
    module: ModuleConstant.AUTH,
    action: `${uid} log in.`,
    uid: uid,
    auditDate: getCurrentTime()
  };

  await firestore.collection('user-logs').add(payload);
}