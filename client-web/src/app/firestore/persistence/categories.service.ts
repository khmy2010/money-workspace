import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { SearchCriteria } from "../criteria/search-criteria";
import { FCategoryModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class CategoriesStoreService extends BasePersistenceService<FCategoryModel> {
  private readonly NAME: string = 'name';

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.CATEGORIES, firestore, auth);
  }

  findUserCategories() {
    const searchCriteria: SearchCriteria = new SearchCriteria().equalsUser().asc(this.NAME);

    return this.findBySearchCriteria(searchCriteria);
  }
}