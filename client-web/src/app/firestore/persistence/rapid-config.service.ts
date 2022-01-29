import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { SearchCriteria } from "../criteria/search-criteria";
import { FRapidConfigModel, FRapidConfigType, FWalletConfigType } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class RapidConfigStoreService extends BasePersistenceService<FRapidConfigModel> {
  private readonly CONFIG_TYPE: string = 'configType';
  private readonly WALLET_TYPE: string = 'walletType';

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.RAPID_CONFIG, firestore, auth);
  }

  getTngEWalletConfig() {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.equalsUser();
    searchCriteria.equals(this.CONFIG_TYPE, FRapidConfigType.EWALLET_CONFIG)
    searchCriteria.equals(this.WALLET_TYPE, FWalletConfigType.TNG);
    searchCriteria.limit(1);

    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  getGrabPayConfig() {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.equalsUser();
    searchCriteria.equals(this.CONFIG_TYPE, FRapidConfigType.EWALLET_CONFIG)
    searchCriteria.equals(this.WALLET_TYPE, FWalletConfigType.GRABPAY);
    searchCriteria.limit(1);

    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  getRfidConfig() {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.equalsUser();
    searchCriteria.equals(this.CONFIG_TYPE, FRapidConfigType.RFID_CONFIG);
    searchCriteria.limit(1);

    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  getGrabFoodConfig() {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.equalsUser();
    searchCriteria.equals(this.CONFIG_TYPE, FRapidConfigType.GRAB_FOOD_CONFIG);
    searchCriteria.limit(1);

    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }

  findPlacesConfig() {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.equalsUser();
    searchCriteria.equals(this.CONFIG_TYPE, FRapidConfigType.PLACE_CONFIG);

    return this.findBySearchCriteria(searchCriteria);
  }
}