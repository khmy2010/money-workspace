import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { TransactionReceiptComponent } from './pages/transaction-receipt/transaction-receipt.component';

const routes: Routes = [
  {
    path: RouteConstant.ADD_TRANSACTIONS,
    component: AddTransactionsComponent
  },
  {
    path: RouteConstant.TRANSACTIONS_ACK + '/:id',
    component: TransactionReceiptComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
