import { Injectable } from "@angular/core";
import { forkJoin, tap } from "rxjs";
import { FCategoryModel, FPaymentMethodModel, FTransactionModel } from "src/app/firestore/model/store.model";
import { CategoriesStoreService } from "src/app/firestore/persistence/categories.service";
import { PaymentMethodStoreService } from "src/app/firestore/persistence/payment-method.service";
import { TransactionStoreService } from "src/app/firestore/persistence/transaction.service";
import { environment } from "src/environments/environment";
import { categorySeeds } from "./categories.seed";
import { paymentMethodSeeds } from "./payment-method.seed";
import startOfToday from 'date-fns/startOfToday';
import { transactionRemarkSeeds } from "./transaction-remark.seed";

@Injectable({
  providedIn: 'root'
})
export class LocalDataSeederService {
  constructor(
    private categoriesStoreService: CategoriesStoreService,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private transactionStoreService: TransactionStoreService,
  ) {

  }

  seedDataForDevelopment() {
    if (!environment.useEmulators) {
      return;
    }

    // Seed Categories
    this.categoriesStoreService.batchInsert(categorySeeds);

    // Seed Payment Methods
    this.paymentMethodStoreService.batchInsert(paymentMethodSeeds);

    // Seed Transactions
    const data$ = forkJoin({
      categories: this.categoriesStoreService.findByUserSnapshot(),
      paymentMethods: this.paymentMethodStoreService.findByUserSnapshot(true)
    });

    data$.pipe(
      tap(({ categories, paymentMethods }) => {
        this.populateTransactions(categories, paymentMethods);
        this.populateTransactions(categories, paymentMethods);
        this.populateTransactions(categories, paymentMethods);
        this.populateTransactions(categories, paymentMethods);
        this.populateTransactions(categories, paymentMethods);
      })
    ).subscribe();
  }

  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomDate() {
    const dayStart: Date = startOfToday();
    const now: Date = new Date();
    const space = now.getTime() - dayStart.getTime() - 1;

    if (space > 10000) {
      const timestamp = this.getRandomInt(0, space);
      if (timestamp > 0) {
        return new Date(dayStart.getTime() + timestamp);
      }
      else {
        return new Date();
      }
    }
    else {
      return new Date();
    }
  }

  private populateTransactions(categories: FCategoryModel[], paymentMethods: FPaymentMethodModel[]) {
    const minPaymentMethod: number = 0;
    const maxPaymentMethod: number = (paymentMethods?.length - 1) || 0;
    let transactions: FTransactionModel[] = [];

    categories.forEach((category: FCategoryModel) => {
      const transaction: FTransactionModel = {
        amount: this.getRandomInt(5, 200),
        category: category._id as string,
        paymentMethod: paymentMethods[this.getRandomInt(minPaymentMethod, maxPaymentMethod)]?._id as string,
        remark: transactionRemarkSeeds[this.getRandomInt(0, transactionRemarkSeeds.length - 1)],
        transactionType: 'normal',
        transactionDate: this.getRandomDate(),
      };

      transactions = transactions.slice(0, 50);

      transactions.push(transaction);
    });

    console.log(`[Local Seed] - Inserting ${transactions.length} rows into FDS.`);
    this.transactionStoreService.batchInsert(transactions);
  }
}