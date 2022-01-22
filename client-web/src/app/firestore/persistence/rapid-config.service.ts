import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { FireCollectionConstant } from "src/constant";
import { BasePersistenceService } from "../base.persistence";
import { FRapidConfigModel } from "../model/store.model";

@Injectable({
  providedIn: 'root'
})
export class RapidConfigStoreService extends BasePersistenceService<FRapidConfigModel> {
  private userFolderPath: string | undefined = this.auth.currentUser?.uid;

  constructor(protected override firestore: Firestore, protected override auth: Auth) {
    super(FireCollectionConstant.RAPID_CONFIG, firestore, auth);
  }

  saveConfig(payload: FRapidConfigModel) {
    return this.upsert(this.userFolderPath as string, payload);
  }
}