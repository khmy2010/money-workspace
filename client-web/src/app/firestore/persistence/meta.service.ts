import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FMetaModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class MetaStoreService extends BasePersistenceService<FMetaModel> {
  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.META, firestore, auth);
  }

  getOwn() {
    return this.get(this.auth.currentUser?.uid as string);
  }
}