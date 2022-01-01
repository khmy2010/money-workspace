import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { TransactionReceiptComponent } from './pages/transaction-receipt/transaction-receipt.component';
import { ViewTransactionsComponent } from './pages/view-transactions/view-transactions.component';

const routes: Routes = [
  {
    path: RouteConstant.ADD_TRANSACTIONS,
    component: AddTransactionsComponent
  },
  {
    path: RouteConstant.TRANSACTIONS_ACK + '/:id',
    component: TransactionReceiptComponent
  },
  {
    path: RouteConstant.VIEW_TRANSACTIONS,
    component: ViewTransactionsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
