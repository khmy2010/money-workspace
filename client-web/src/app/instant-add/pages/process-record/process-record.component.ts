import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { concatMap, Observable, of, take, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FInstantEntryModel, FInstantEntryStatus } from 'src/app/firestore/model/store.model';
import { InstantEntryService } from 'src/app/firestore/persistence/instant-entry.service';
import { TransactionReviewStoreService } from 'src/app/firestore/persistence/transaction-review.service';
import { RouteConstant } from 'src/constant';

@Component({
  templateUrl: './process-record.component.html',
  styleUrls: ['./process-record.component.scss'],
  providers: [SubHandlingService]
})
export class ProcessRecordComponent implements OnInit {
  instantEntries: FInstantEntryModel[] = [];
  displayInstantEntries: FInstantEntryModel[] = [];
  excludeCompleted: boolean = false;

  readonly FInstantEntryStatus = FInstantEntryStatus;

  constructor(
    private subHandler: SubHandlingService,
    private instantEntryService: InstantEntryService,
    private router: Router,
    private route: ActivatedRoute,
    private matSnackBar: MatSnackBar,
    private transactionReviewStoreService: TransactionReviewStoreService,
  ) { }

  ngOnInit(): void {
    this.excludeCompleted = this.route.snapshot.queryParams['new'] || false;

    this.subHandler.subscribe(
      this.instantEntryService.findRecent().pipe(
        tap((instantEntries: FInstantEntryModel[]) => {
          this.instantEntries = [...instantEntries];
          this.applyFilter();
          console.log(instantEntries);
        })
      )
    );
  }

  viewCreatedTransaction(transactionId: string | undefined) {
    if (!transactionId) {
      return;
    }

    const commands: string[] = [
      '/',
      RouteConstant.APP,
      RouteConstant.EXPENSES,
      RouteConstant.TRANSACTIONS_ACK,
      transactionId,
    ];

    this.router.navigate(commands);
  }

  reviewTransaction(reviewId: string | undefined) {
    if (!reviewId) {
      return;
    }

    const commands: string[] = [
      '/',
      RouteConstant.APP,
      RouteConstant.EXPENSES,
      RouteConstant.ADD_TRANSACTIONS,
    ];

    const extras: NavigationExtras = {
      queryParams: {
        review: reviewId
      }
    };

    this.router.navigate(commands, extras);
  }

  applyFilter(event?: MatCheckboxChange) {
    if (event) {
      this.excludeCompleted = event.checked;
    }

    this.displayInstantEntries = this.instantEntries.filter(({ postProcessSuccess }) => {
      if (this.excludeCompleted) {
        return !postProcessSuccess;
      }

      return true;
    });
  }

  deleteFailedAttempt(entry: FInstantEntryModel) {
    const _id: string | undefined = entry._id;

    if (_id) {
      this.subHandler.subscribe(
        this.instantEntryService.delete(_id).pipe(
          tap(() => {
            this.matSnackBar.open('Deleted Entry ' + _id, undefined, { duration: 500 });
          })
        )
      );
    }
  }

  rejectRequest(entry: FInstantEntryModel) {
    let rejectRequest$: Observable<any> = of(null);
    const _id: string | undefined = entry._id;

    if (entry.transactionPendingReview) {
      rejectRequest$ = rejectRequest$.pipe(
        concatMap(() => {
          return this.transactionReviewStoreService.delete(entry.transactionPendingReview as string).pipe(take(1));
        })
      );
    }

    rejectRequest$ = rejectRequest$.pipe(
      concatMap(() => {
        return this.instantEntryService.delete(_id as string).pipe(take(1));
      }),
      tap(() => {
        this.matSnackBar.open('Deleted Entry ' + _id, undefined, { duration: 500 });
      })
    );

    this.subHandler.subscribe(rejectRequest$);
  }

}
