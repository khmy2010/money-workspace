import { Injectable } from "@angular/core";
import { concatMap, forkJoin, map, Observable, of, tap } from "rxjs";
import { FTransactionModel } from "../model/store.model";
import { CategoriesStoreService } from "../persistence/categories.service";
import { PaymentMethodStoreService } from "../persistence/payment-method.service";
import { TransactionStoreService } from "../persistence/transaction.service";

@Injectable({
  providedIn: 'root'
})
export class TransactionDataService {
  constructor(
    private paymentMethodStoreService: PaymentMethodStoreService,
    private categoriesStoreService: CategoriesStoreService, 
    private transactionStoreService: TransactionStoreService) {

  }

  findTransaction(id: string) {
    const transaction$: Observable<FTransactionModel> = this.transactionStoreService.get(id);
    let transactionDocument!: FTransactionModel;

    return transaction$.pipe(
      tap((transaction: FTransactionModel) => {
        transactionDocument = transaction;
      }),
      concatMap((transaction: FTransactionModel) => {
        if (transaction) {
          return forkJoin({
            paymentMethod: this.paymentMethodStoreService.get(transaction.paymentMethod),
            category: this.categoriesStoreService.get(transaction.category)
          });
        }
        return of({
          paymentMethod: null,
          category: null
        });
      }),
      map(({ paymentMethod, category }) => {
        return {
          ...transactionDocument,
          paymentMethodDocument: paymentMethod,
          categoryDocument: category
        }
      })
    );
  }
}