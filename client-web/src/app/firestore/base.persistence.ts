import { Inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { doc, docData, Firestore, addDoc, collection, query, where, CollectionReference, serverTimestamp, getDocs, QuerySnapshot, QueryDocumentSnapshot, DocumentData, updateDoc, deleteDoc, onSnapshot, writeBatch, WriteBatch, getDoc, DocumentReference } from '@angular/fire/firestore';
import { finalize, from, map, Observable, Subject } from "rxjs";
import { genericConverter } from "./converters/generic.converter";
import { SearchCriteria } from "./criteria/search-criteria";
import { v4 as uuidv4 } from 'uuid';

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

    return from(addDoc(this.collectionRef, { ...dataPayload }));
  }

  addByUser(payload: T) {
    const dataPayload: T = {
      ...payload,
      uid: this.getUserId(),
      createdDate: serverTimestamp(),
      createdBy: this.getUserId()
    };

    return from(addDoc(this.collectionRef, { ...dataPayload }));
  }

  update(path: string, payload: T) {
    const dataPayload: T = {
      ...payload,
      updatedDate: serverTimestamp(),
      updatedBy: this.getUserId()
    };

    const docRef = doc(this.firestore, this.collectionID, path);
    const updateRequest = updateDoc(docRef, dataPayload);

    return from(updateRequest);
  }

  batchInsert(payloads: T[]) {
    const dataPayload: T[] = payloads.map((payload: T) => {
      return {
        ...payload,
        uid: this.getUserId(),
        createdDate: serverTimestamp()
      }
    });
    
    const batch: WriteBatch = writeBatch(this.firestore);

    dataPayload.forEach((payload: T) => {
      const id: string = uuidv4().replace(/-/g, '');
      const ref = doc(this.firestore, this.collectionID, id);
      batch.set(ref, payload);
    });

    return from(batch.commit());
  }

  delete(path: string) {
    const docRef = doc(this.firestore, this.collectionID, path);
    return from(deleteDoc(docRef));
  }

  get(id: string): Observable<T> {
    const docRef: DocumentReference = doc(this.firestore, this.collectionID, id);

    return from(getDoc(docRef)) as unknown as Observable<T>;
  }

  findByUserSnapshot(active?: boolean) {
    const searchCriteria = new SearchCriteria().equalsUser();

    if (active) {
      searchCriteria.active();
    }
    
    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  findBySearchCriteriaSnapshot(searchCriteria: SearchCriteria): Observable<T[]> {
    const result$: Observable<any> = from(
      getDocs(searchCriteria.buildSafely(this.collectionRef).withConverter(genericConverter))
    );

    return result$.pipe(
      map((querySnapshot: QuerySnapshot) => {
        const data: DocumentData[] = [];
        
        querySnapshot.forEach((snapshot: QueryDocumentSnapshot) => {
          const snapshotData: any = snapshot.data();
          data.push(snapshotData);
        });

        return data;
      })
    ) as Observable<T[]>;
  }

  findByUser(active?: boolean) {
    const searchCriteria = new SearchCriteria().equalsUser();

    if (active) {
      searchCriteria.active();
    }

    return this.findBySearchCriteria(searchCriteria);
  }

  findBySearchCriteria(searchCriteria: SearchCriteria) {
    const query: any = searchCriteria.buildSafely(this.collectionRef).withConverter(genericConverter);
    const subject: Subject<any> = new Subject<any>();

    const unsubscribeHook = onSnapshot(query, { includeMetadataChanges: true }, (querySnapshot: QuerySnapshot) => {
      const dataCollections: any[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        dataCollections.push(doc.data());
      });

      subject.next(dataCollections);
    });

    return subject.pipe(
      finalize(() => {
        try {
          unsubscribeHook();
        }
        catch(_) {
          console.warn(`Failed to detach the listener, collectionID: ${this.collectionID}`);
        }
      })
    );
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}