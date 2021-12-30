import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TransactionDataService } from 'src/app/firestore/data/transaction.service';
import { FTransactionModel } from 'src/app/firestore/model/store.model';
import { RouteConstant } from 'src/constant';

@Component({
  selector: 'app-transaction-receipt',
  templateUrl: './transaction-receipt.component.html',
  styleUrls: ['./transaction-receipt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionReceiptComponent implements OnInit {
  transaction$!: Observable<FTransactionModel | any>;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private transactionDataService: TransactionDataService) { }

  ngOnInit(): void {
    const id: string = this.route.snapshot.params?.id;

    if (id !== undefined) {
      this.transaction$ = this.transactionDataService.findTransaction(id).pipe(
        tap(() => this.loading = false)
      );

      this.transaction$.subscribe(console.log);
    }
  }

  createTransaction() {
    this.router.navigate([RouteConstant.ADD_TRANSACTIONS]
      , { relativeTo: this.route.parent });
  }

  viewTransactions() {
    this.router.navigate([RouteConstant.VIEW_TRANSACTIONS]
      , { relativeTo: this.route.parent });
  }
}
