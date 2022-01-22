import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { SearchCriteria } from "../criteria/search-criteria";
import { FPaymentMethodModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodStoreService extends BasePersistenceService<FPaymentMethodModel> {
  private readonly NAME: string = 'name';
  private readonly TYPE: string = 'type';

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.PAYMENT_METHODS, firestore, auth);
  }

  override findByUser() {
    const searchCriteria = new SearchCriteria().equalsUser().asc(this.NAME);

    return this.findBySearchCriteria(searchCriteria);
  }

  findUserWallets() {
    const EWALLET: string = 'ewallet';
    const searchCriteria: SearchCriteria = new SearchCriteria().equalsUser().equals(this.TYPE, EWALLET).asc(this.NAME);

    return this.findBySearchCriteria(searchCriteria);
  }
}