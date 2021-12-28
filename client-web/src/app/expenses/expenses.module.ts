import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesRoutingModule } from './expenses-routing.module';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    AddTransactionsComponent
  ],
  imports: [
    SharedModule,
    ExpensesRoutingModule
  ]
})
export class ExpensesModule { }
