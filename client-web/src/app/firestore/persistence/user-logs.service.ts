import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore, doc, DocumentSnapshot } from "@angular/fire/firestore";
import { AppConstant, FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { SearchCriteria } from "../criteria/search-criteria";
import { FAuditTrailModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class UserLogStoreService extends BasePersistenceService<FAuditTrailModel> {
  private readonly AUDIT_DATE: string = 'auditDate';

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.USER_LOGS, firestore, auth);
  }

  findByPaginatedSearch(page: number, size: number, lastElement?: DocumentSnapshot<any>) {
    console.log('PAGE: ', page, lastElement);
    const searchCriteria: SearchCriteria = new SearchCriteria();
    // searchCriteria.equalsUser();
    searchCriteria.asc(this.AUDIT_DATE);

    if (lastElement) {
      searchCriteria.startAt(lastElement);
    }

    searchCriteria.limit(size);

    return this.findBySearchCriteriaSnapshot(searchCriteria);
  }
}