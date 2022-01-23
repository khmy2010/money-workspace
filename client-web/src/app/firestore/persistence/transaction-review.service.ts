import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FTransactionReviewModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class TransactionReviewStoreService extends BasePersistenceService<FTransactionReviewModel> {
  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.TRANSACTION_REVIEW, firestore, auth);
  }
}