import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { SearchCriteria } from "../criteria/search-criteria";
import { FInstantEntryModel, FInstantEntryStatus } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class InstantEntryService extends BasePersistenceService<FInstantEntryModel> {
  private CREATED_DATE: string = 'createdDate';

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.INSTANT_ENTRY, firestore, auth);
  }

  findRecent() {
    const searchCriteria: SearchCriteria = new SearchCriteria();
    
    searchCriteria.equalsUser();
    searchCriteria.limit(20);
    searchCriteria.desc(this.CREATED_DATE);

    return this.findBySearchCriteria(searchCriteria);
  }

  reviewSuccess(id: string, transactionId: string) {
    const payload: Partial<FInstantEntryModel> = {
      postProcessStatus: FInstantEntryStatus.SUCCESS,
      postProcessSuccess: true,
      postProcessSuccessDate: this.currentServerTime(),
      transactionCreated: transactionId,
    };

    return this.upsert(id, payload);
  }
}