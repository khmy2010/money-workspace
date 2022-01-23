import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FInstantEntryStatus } from 'src/app/firestore/model/store.model';

@Component({
  selector: 'instant-process-status',
  templateUrl: './instant-process-status.component.html',
  styleUrls: ['./instant-process-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantProcessStatusComponent implements OnChanges {
  @Input() postProcessStatus!: FInstantEntryStatus | undefined;

  readonly FInstantEntryStatus = FInstantEntryStatus;

  pending: boolean = false

  ngOnChanges(changes: SimpleChanges) {
    if (changes.postProcessStatus) {
      this.pending = this.postProcessStatus === undefined || this.postProcessStatus === null;
    }
  }
}
