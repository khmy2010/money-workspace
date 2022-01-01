import { NgModule } from '@angular/core';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { SharedModule } from '../shared/shared.module';
import { TransactionReceiptComponent } from './pages/transaction-receipt/transaction-receipt.component';
import { ViewTransactionsComponent } from './pages/view-transactions/view-transactions.component';


@NgModule({
  declarations: [
    AddTransactionsComponent,
    TransactionReceiptComponent,
    ViewTransactionsComponent,
  ],
  imports: [
    SharedModule,
    ExpensesRoutingModule
  ]
})
export class ExpensesModule { }
