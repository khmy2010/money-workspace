import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesRoutingModule } from './expenses-routing.module';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { SharedModule } from '../shared/shared.module';
import { TransactionReceiptComponent } from './pages/transaction-receipt/transaction-receipt.component';


@NgModule({
  declarations: [
    AddTransactionsComponent,
    TransactionReceiptComponent
  ],
  imports: [
    SharedModule,
    ExpensesRoutingModule
  ]
})
export class ExpensesModule { }
