import * as admin from 'firebase-admin';
import { Change } from 'firebase-functions/v1';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { ChangeTypeEnum } from './constant/change.constant';

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
