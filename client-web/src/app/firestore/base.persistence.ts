import { Inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { doc, docData, Firestore, addDoc, collection, query, where, CollectionReference, serverTimestamp } from '@angular/fire/firestore';

@Injectable()
export class BasePersistenceService<T> {
  private collectionRef: CollectionReference = collection(this.firestore, this.collectionID);

  constructor(
    @Inject(String) protected collectionID: string, 
    protected firestore: Firestore,
    protected auth: Auth) {

  }

  add(payload: T) {
    const dataPayload: T = {
      ...payload,
      uid: this.getUserId(),
      createdDate: serverTimestamp()
    };

    return addDoc(this.collectionRef, {...dataPayload});
  }

  addByUser(payload: T) {
    const dataPayload: T = {
      ...payload,
      uid: this.getUserId(),
      createdDate: serverTimestamp(),
      createdBy: this.getUserId()
    };

    return addDoc(this.collectionRef, {...dataPayload});
  }
  
  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}