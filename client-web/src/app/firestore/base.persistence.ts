import { Inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { doc, docData, Firestore, addDoc, collection, query, where, CollectionReference, serverTimestamp, getDocs, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { SearchCriteria } from "./criteria/search-criteria";

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

    return addDoc(this.collectionRef, { ...dataPayload });
  }

  addByUser(payload: T) {
    const dataPayload: T = {
      ...payload,
      uid: this.getUserId(),
      createdDate: serverTimestamp(),
      createdBy: this.getUserId()
    };

    return addDoc(this.collectionRef, { ...dataPayload });
  }

  async findByUserSnapshot(active?: boolean) {
    const searchCriteria = new SearchCriteria().equalsUser();

    if (active) {
      searchCriteria.active();
    }
    
    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  async findBySearchCriteriaSnapshot(searchCriteria: SearchCriteria) {
    const result: QuerySnapshot = await getDocs(searchCriteria.buildSafely(this.collectionRef));
    const data: DocumentData[] = [];

    result.forEach((snapshot: QueryDocumentSnapshot) => {
      const snapshotData: any = snapshot.data();
      data.push(snapshotData);
    });

    return data;
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}