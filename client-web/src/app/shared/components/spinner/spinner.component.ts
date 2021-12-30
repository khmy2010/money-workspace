import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  styleUrls: ['./spinner.component.scss'],
  template: `
    <div class="loading w-full my-10 ml-auto mr-auto" *ngIf="loading; else contentTemplate">
      <mat-progress-spinner color="primary" mode="indeterminate" color="primary"></mat-progress-spinner>
    </div>

    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class SpinnerComponent {
  @Input() loading: boolean = false;
}
