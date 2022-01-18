import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Observable, startWith, Subject, switchMap, take, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { SearchCriteria } from 'src/app/firestore/criteria/search-criteria';
import { SearchDate } from 'src/app/firestore/criteria/search-date';
import { TransactionDataService } from 'src/app/firestore/data/transaction.service';
import { FTransactionFields, FTransactionModel } from 'src/app/firestore/model/store.model';
import { RouteConstant } from 'src/constant';
import { QueryMode, QueryRangeMode, QueryImportanceMode } from './query-mode';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QueryCategoryDialogComponent } from '../../components/query-category-dialog/query-category-dialog.component';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';

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

  queryRange: QueryRangeMode = QueryRangeMode.TODAY;
  queryImportance: QueryImportanceMode = QueryImportanceMode.ALL;
  queryMinAmount: any = null;
  queryMaxAmount: any = null;
  queryCategories: string[] = [];
  mobileView: boolean = false;

  readonly tableColumns: string[] = [
    'id',
    'transactionDate',
    'category',
    'amount',
    'paymentMethod',
    'remark',
  ];

  readonly QueryRangeMode = QueryRangeMode;
  readonly QueryImportanceMode = QueryImportanceMode;
  readonly RouteConstant = RouteConstant;
  readonly today: Date = new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private transactionQueryEvent: Subject<any> = new Subject<any>();

  constructor(
    private dialog: MatDialog,
    private categoriesStoreService: CategoriesStoreService,
    private bpObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private transDataService: TransactionDataService, 
    private snackBar: MatSnackBar,
    private subHandler: SubHandlingService) { }

  ngOnInit(): void {
    this.mobileView = this.bpObserver.isMatched(Breakpoints.XSmall);

    this.subHandler.subscribe(
      this.transactionQueryEvent.pipe(
        startWith(QueryMode.RANGE),
        debounceTime(300),
        switchMap((queryMode: QueryMode) => this.retrieveData(queryMode)),
      )
    );
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  addTransaction() {
    this.router.navigate([RouteConstant.ADD_TRANSACTIONS], { relativeTo: this.route.parent });
  }

  changeRangeCriteria(matButtonToggleChangeEvent: MatButtonToggleChange) {
    if (this.queryRange && matButtonToggleChangeEvent.value) {
      this.transactionQueryEvent.next(QueryMode.RANGE);
    }
  }

  changeImportanceCriteria(matButtonToggleChangeEvent: MatButtonToggleChange) {
    if (this.queryImportance && matButtonToggleChangeEvent.value) {
      this.transactionQueryEvent.next(QueryMode.IMPORTANCE);
    }
  }

  changeAmountCriteria() {
    this.transactionQueryEvent.next(QueryMode.AMOUNT);
  }

  openCategoryDialog() {
    const dialogRef: MatDialogRef<QueryCategoryDialogComponent> = this.dialog.open(QueryCategoryDialogComponent, {
      data: {
        categories$: this.categoriesStoreService.findByUserSnapshot(true).pipe(take(1)),
        current: this.queryCategories || []
      }
    });

    const postProcessing$: Observable<any> = dialogRef.afterClosed().pipe(
      tap((data: any) => {
        this.queryCategories = data?.categories ? [...data?.categories] : [];

        if (data?.categories) {
          this.transactionQueryEvent.next(QueryMode.CATEGORY);
        }
      })
    );

    this.subHandler.subscribe(postProcessing$);
  }

  private retrieveData(queryMode: QueryMode = QueryMode.RANGE): Observable<FTransactionModel[]> {
    const searchCriteria: SearchCriteria = new SearchCriteria();

    switch(queryMode) {
      case QueryMode.AMOUNT:
        this.buildAmountCriteria(searchCriteria);
        break;
      case QueryMode.RANGE:
        this.buildDateCriteria(searchCriteria);
        this.buildCategoryCriteria(searchCriteria);
        break;
      case QueryMode.CATEGORY:
        if (this.queryMinAmount || this.queryMaxAmount) {
          this.buildAmountCriteria(searchCriteria);
        }
        else if (this.queryRange) {
          this.buildDateCriteria(searchCriteria);
        }

        this.buildCategoryCriteria(searchCriteria);
        break;
      case QueryMode.IMPORTANCE:
        this.buildImportanceCriteria(searchCriteria);
        break;
      default:
        this.buildDateCriteria(searchCriteria);
        break;
    }

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

  private getDateCriteria(): SearchDate {
    const dateCriteria: SearchDate = new SearchDate();

    switch(this.queryRange) {
      case QueryRangeMode.TODAY:
        dateCriteria.today();
        break;
      case QueryRangeMode.CURRENT_WEEK:
        dateCriteria.thisWeek();
        break;
      default:
        console.warn(`Unknown date criteria: ${this.queryRange}`, dateCriteria);
        dateCriteria.today();
        break;
    }

    return dateCriteria;
  }

  private buildDateCriteria(searchCriteria: SearchCriteria): SearchCriteria {
    const dateCriteria: SearchDate = new SearchDate();

    switch(this.queryRange) {
      case QueryRangeMode.TODAY:
        dateCriteria.today();
        break;
      case QueryRangeMode.CURRENT_WEEK:
        dateCriteria.thisWeek();
        break;
      default:
        console.warn(`Unknown date criteria: ${this.queryRange}`, dateCriteria);
        dateCriteria.today();
        break;
    }

    searchCriteria.buildRangeCriteria(FTransactionFields.TRANSACTION_DATE, this.getDateCriteria());

    return searchCriteria;
  }

  private buildAmountCriteria(searchCriteria: SearchCriteria): SearchCriteria {
    if (this.queryMinAmount) {
      searchCriteria.greaterEqThan(FTransactionFields.AMOUNT, +this.queryMinAmount);
    }

    if (this.queryMaxAmount) {
      searchCriteria.lessEqThan(FTransactionFields.AMOUNT, +this.queryMaxAmount);
    }

    return searchCriteria;
  }

  private buildCategoryCriteria(searchCriteria: SearchCriteria): SearchCriteria {
    if (Array.isArray(this.queryCategories) && this.queryCategories.length > 0) {
      const validArrayCheck: boolean = this.queryCategories.every((category: string) => !!category);

      if (validArrayCheck) {
        searchCriteria.in(FTransactionFields.CATEGORY, this.queryCategories);
      }
    }

    return searchCriteria;
  }

  private buildImportanceCriteria(searchCriteria: SearchCriteria): SearchCriteria {
    switch(this.queryImportance) {
      case QueryImportanceMode.IMP_ONLY:
        searchCriteria.equals(FTransactionFields.IMPORTANT, true);
        break;
      case QueryImportanceMode.NORMAL:
        searchCriteria.notEqual(FTransactionFields.IMPORTANT, true);
        break;
      case QueryImportanceMode.ALL:
      default:
        return this.buildDateCriteria(searchCriteria);
    }

    return searchCriteria;
  }

  private notifyDataRetrieved<T>(result: T[]) {
    const config: MatSnackBarConfig = {
      panelClass: 'text-white',
      duration: 1200
    };

    this.snackBar.open(`Fetched ${result?.length ?? 0} rows of transactions.`, undefined, config);
  }
}
