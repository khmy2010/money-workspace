import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FCategoryModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class CategoriesStoreService extends BasePersistenceService<FCategoryModel> {
  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.CATEGORIES, firestore, auth);
  }
}