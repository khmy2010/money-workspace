import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
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
  excludeCompleted: boolean = false;

  readonly FInstantEntryStatus = FInstantEntryStatus;

  constructor(
    private subHandler: SubHandlingService,
    private instantEntryService: InstantEntryService,
    private router: Router,
    private route: ActivatedRoute,
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

}
