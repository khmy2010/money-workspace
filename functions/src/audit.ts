import { AuditTrailConstant, ModuleConstant } from './constant';
import { FAuditTrailModel, FCategoryModel, FTransactionModel } from './models/firestore.model';
import { getChangeType, getCurrentTime, getDoc, getId } from './utils';
import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { Change, EventContext } from 'firebase-functions/v1';
import { CallableContext } from 'firebase-functions/v1/https';
import { ChangeTypeEnum } from './constant/change.constant';

export const auditTransaction = async (firestore: firestore.Firestore, change: Change<DocumentSnapshot>, context: EventContext) => {
  const action: ChangeTypeEnum = getChangeType(change);
  const doc: FTransactionModel = getDoc(change);
  const id: string = getId(change);

  const payload: FAuditTrailModel = {
    entryPoint: AuditTrailConstant.TRANSACTIONS,
    module: ModuleConstant.TRANSACTIONS,
    action: '',
    uid: doc?.uid ?? 'Unknown',
    auditDate: getCurrentTime(),
    eventType: context?.eventType
  };

  switch(action) {
    case ChangeTypeEnum.CREATE:
      payload.action = `A transaction ${id} has been created (remarks: ${doc?.remark || '-'}).`;
      break;
    case ChangeTypeEnum.UPDATE:
      payload.action = `A transaction ${id} has been updated (remarks: ${doc?.remark || '-'}).`;
      payload.oldValueJson = JSON.stringify(change.before.data());
      break;
    case ChangeTypeEnum.DELETE:
      payload.action = `A transaction ${id} has been deleted.`;
      payload.oldValueJson = JSON.stringify(change.before.data());
      break;
  }

  addAuditTrail(firestore, payload);
}

export const auditCategory = async (firestore: firestore.Firestore, change: Change<DocumentSnapshot>, context: EventContext) => {
  const action: ChangeTypeEnum = getChangeType(change);
  const doc: FCategoryModel = getDoc(change);
  const id: string = getId(change);

  const payload: FAuditTrailModel = {
    entryPoint: AuditTrailConstant.CATEGORY,
    module: ModuleConstant.CATS,
    uid: doc?.uid ?? 'Unknown',
    auditDate: getCurrentTime(),
    eventType: context?.eventType,
    action: '',
  };

  switch(action) {
    case ChangeTypeEnum.CREATE:
      payload.action = `A transaction category ${id} (${doc.name}) has been created.`;
      break;
    case ChangeTypeEnum.UPDATE:
      const before: FCategoryModel = change.before.data() as FCategoryModel;
      const after: FCategoryModel = change.after.data() as FCategoryModel;
      payload.action = `A transaction category ${id} (${doc.name}) has been updated.`;
      payload.oldValueJson = JSON.stringify(before);

      if (before.aggregatedCount !== after.aggregatedCount || before.aggregatedSpending !== after.aggregatedSpending) {
        payload.action = `
        A transaction category ${id} (${doc.name}) has been aggregated 
        from ${before.aggregatedCount || 0} to ${after.aggregatedCount} [ac], 
        ${before.aggregatedSpending || 0} to ${after.aggregatedSpending} [as] by CF.`;
      }
   
      break;
    case ChangeTypeEnum.DELETE:
      payload.action = `A transaction category ${id} (${doc.name}) has been deleted.`;
      payload.oldValueJson = JSON.stringify(change.before.data());
      break;
  }

  addAuditTrail(firestore, payload);
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

  addAuditTrail(firestore, payload);
}

export const auditLogout = async (firestore: firestore.Firestore, context: CallableContext, uid: string) => {
  const payload: FAuditTrailModel = {
    entryPoint: AuditTrailConstant.USER_LOGOUT,
    clientIp: context.rawRequest.ip ?? 'Unknown',
    module: ModuleConstant.AUTH,
    action: `${uid} log out.`,
    uid: uid,
    auditDate: getCurrentTime()
  };

  addAuditTrail(firestore, payload);
}

function addAuditTrail(firestore: firestore.Firestore, model: FAuditTrailModel) {
  firestore.collection('user-logs').add(model);
}