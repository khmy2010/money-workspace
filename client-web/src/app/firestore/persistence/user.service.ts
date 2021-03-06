import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FUserModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class UserStoreService extends BasePersistenceService<FUserModel> {
  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.USERS, firestore, auth);
  }
}