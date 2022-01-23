import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FInstantEntryModel, FInstantEntryStatus } from 'src/app/firestore/model/store.model';
import { InstantEntryService } from 'src/app/firestore/persistence/instant-entry.service';
import { RouteConstant } from 'src/constant';

@Component({
  templateUrl: './process-record.component.html',
  styleUrls: ['./process-record.component.scss'],
  providers: [SubHandlingService]
})
export class ProcessRecordComponent implements OnInit {
  instantEntries: FInstantEntryModel[] = [];
  displayInstantEntries: FInstantEntryModel[] = [];

  readonly FInstantEntryStatus = FInstantEntryStatus;

  constructor(
    private subHandler: SubHandlingService,
    private instantEntryService: InstantEntryService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      this.instantEntryService.findRecent().pipe(
        tap((instantEntries: FInstantEntryModel[]) => {
          this.instantEntries = [...instantEntries];
          this.displayInstantEntries = [...instantEntries];
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

}
