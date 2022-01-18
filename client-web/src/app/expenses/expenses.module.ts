import { NgModule } from '@angular/core';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { AddTransactionsComponent } from './pages/add-transactions/add-transactions.component';
import { SharedModule } from '../shared/shared.module';
import { TransactionReceiptComponent } from './pages/transaction-receipt/transaction-receipt.component';
import { ViewTransactionsComponent } from './pages/view-transactions/view-transactions.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageViewerModule } from '../image-viewer/image-viewer.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { QueryCategoryDialogComponent } from './components/query-category-dialog/query-category-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [
    AddTransactionsComponent,
    TransactionReceiptComponent,
    ViewTransactionsComponent,
    QueryCategoryDialogComponent,
  ],
  imports: [
    SharedModule,
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule,
    ExpensesRoutingModule,
    ImageViewerModule,
    HighchartsChartModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatBadgeModule,
  ]
})
export class ExpensesModule { }
