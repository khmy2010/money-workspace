import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, startWith, Subject, switchMap, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { SearchCriteria } from 'src/app/firestore/criteria/search-criteria';
import { SearchDate } from 'src/app/firestore/criteria/search-date';
import { TransactionDataService } from 'src/app/firestore/data/transaction.service';
import { FTransactionFields, FTransactionModel } from 'src/app/firestore/model/store.model';
import { RouteConstant } from 'src/constant';

@Component({
  selector: 'app-view-transactions',
  templateUrl: './view-transactions.component.html',
  styleUrls: ['./view-transactions.component.scss'],
  providers: [SubHandlingService]
})
export class ViewTransactionsComponent implements OnInit {
  dataLoading: boolean = false;
  records: FTransactionModel[] = [];
  dataSource: MatTableDataSource<FTransactionModel> = new MatTableDataSource<any>();
  sum: number = 0;
  expanded: boolean = true;

  readonly tableColumns: string[] = [
    'id',
    'transactionDate',
    'category',
    'amount',
    'paymentMethod',
    'remark',
  ];

  readonly RouteConstant = RouteConstant;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private transactionQueryEvent: Subject<any> = new Subject<any>();

  constructor(
    private transDataService: TransactionDataService, 
    private snackBar: MatSnackBar,
    private subHandler: SubHandlingService) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      this.transactionQueryEvent.pipe(
        startWith(''),
        switchMap(() => this.retrieveData()),
      )
    );
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private retrieveData(): Observable<FTransactionModel[]> {
    const searchCriteria: SearchCriteria = new SearchCriteria();
    const dateCriteria: SearchDate = new SearchDate();
    dateCriteria.today();
    searchCriteria.buildRangeCriteria(FTransactionFields.TRANSACTION_DATE, dateCriteria);

    this.dataLoading = true;

    return this.transDataService.findTransactions(searchCriteria).pipe(
      tap(() => this.dataLoading = false),
      tap((transactionHistories: FTransactionModel[]) => {
        this.records = [...transactionHistories] || [];
        this.dataSource.data = [...transactionHistories] || [];
        this.notifyDataRetrieved(transactionHistories || []);

        this.sum = transactionHistories.reduce((acc: number, transaction: FTransactionModel) => {
          if (transaction?.amount !== undefined && transaction?.amount !== null) {
            acc = acc + +(transaction.amount);
          }

          return acc;
        }, 0);

        console.log('Sum added up: ', this.sum);
      })
    );
  }

  private notifyDataRetrieved<T>(result: T[]) {
    const config: MatSnackBarConfig = {
      panelClass: 'text-white',
      duration: 1200
    };

    this.snackBar.open(`Fetched ${result?.length ?? 0} rows of transactions.`, undefined, config);
  }
}
