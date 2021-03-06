import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from "@angular/fire/firestore";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export const genericConverter: FirestoreDataConverter<unknown> = {
  toFirestore<T>(object: T): DocumentData {
    return object;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
    const object: DocumentData = {
      ...snapshot.data(options)
    };

    // Convert Date from Firestore Server Timestamp to Javascript Date
    Object.keys(object).forEach((key: string) => {
      if (key.toLowerCase().includes('date') && object[key]) {
        try {
          if (object[key] instanceof Timestamp) {
            const convertedDate: Date = object[key].toDate();
            object[`_${key}`] = convertedDate;
            object[`_${key}FromNow`] = formatDistanceToNow(convertedDate, { addSuffix: true });
          }
        }
        catch(e) {
          console.warn('Something went wrong when trying to parse date: ', {...object}, key);
          console.error(e);
        }
      }
    })

    return {
      ...object,
      _id: snapshot.id
    }
  }
};