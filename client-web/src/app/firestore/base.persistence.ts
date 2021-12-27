import { Inject, Injectable } from "@angular/core";
import { doc, docData, Firestore, addDoc, collection, CollectionReference } from '@angular/fire/firestore';

@Injectable()
export class BasePersistenceService<T> {
  private collectionRef: CollectionReference = collection(this.firestore, this.collectionID);

  constructor(@Inject(String) protected collectionID: string, protected firestore: Firestore) {

  }

  add(payload: T) {
    const dataPayload: T = {
      ...payload
    };

    return addDoc(this.collectionRef, {...dataPayload});
  }
  
  
}