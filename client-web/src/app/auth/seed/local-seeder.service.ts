import { Injectable } from "@angular/core";
import { CategoriesStoreService } from "src/app/firestore/persistence/categories.service";
import { environment } from "src/environments/environment";
import { categorySeeds } from "./categories.seed";

@Injectable({
  providedIn: 'root'
})
export class LocalDataSeederService {
  constructor(private categoriesStoreService: CategoriesStoreService) {

  }

  seedDataForDevelopment() {
    if (!environment.useEmulators) {
      return;
    }

    // Seed Categories
    this.categoriesStoreService.batchInsert(categorySeeds);
  }
}