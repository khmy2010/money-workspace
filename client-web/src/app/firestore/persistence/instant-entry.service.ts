import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FInstantEntryModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class InstantEntryService extends BasePersistenceService<FInstantEntryModel> {
  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.INSTANT_ENTRY, firestore, auth);
  }
}