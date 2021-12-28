import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';

const routes: Routes = [
  {
    path: RouteConstant.ADD_TRANSACTIONS,
    component: AddTransactionsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
