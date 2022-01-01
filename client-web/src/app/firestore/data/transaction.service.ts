import { Injectable } from "@angular/core";
import { concatMap, forkJoin, map, Observable, of, tap } from "rxjs";
import { SearchCriteria } from "../criteria/search-criteria";
import { FCategoryModel, FPaymentMethodModel, FTransactionModel } from "../model/store.model";
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

  findTransactions(searchCriteria: SearchCriteria) {
    const transactionsData: FTransactionModel[] = [];

    return this.transactionStoreService.findBySearchCriteriaSnapshot(searchCriteria).pipe(
      concatMap((transactions: FTransactionModel[]) => {
        transactionsData.push(...transactions);
        return forkJoin({
          paymentMethods: this.paymentMethodStoreService.findByUserSnapshot(true),
          categories: this.categoriesStoreService.findByUserSnapshot(true)
        });
      }),
      map(({ paymentMethods, categories }) => this.mapTransactionMeta(transactionsData, paymentMethods, categories))
    );
  }

  private mapTransactionMeta(transactions: FTransactionModel[], paymentMethods: FPaymentMethodModel[], categories: FCategoryModel[]) {
    if (transactions?.length === 0 || !transactions) {
      return transactions;
    }
    
    return transactions.map((transaction: FTransactionModel) => {
      const paymentMethod: FPaymentMethodModel | any = paymentMethods.find(({  _id }) => _id === transaction.paymentMethod);
      const category: FCategoryModel | any = categories.find(({  _id }) => _id === transaction.category);

      if (paymentMethod && category) {
        return {
          ...transaction,
          paymentMethodDocument: paymentMethod,
          categoryDocument: category
        }
      }
      else {
        return transaction;
      }
    });
  }
}