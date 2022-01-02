import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CustomControlBase } from '../../template/custom-control';
import toDate from 'date-fns/toDate';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatePickerComponent,
      multi: true
    }
  ]
})
export class DatePickerComponent extends CustomControlBase<any> implements ControlValueAccessor {
  @Input() matLabel: string = 'Transaction Date';

  date: any;
  mobile: boolean = false;

  constructor(private bpObserver: BreakpointObserver,) {
    super();
  }

  ngOnInit() {
    this.mobile = this.bpObserver.isMatched(Breakpoints.XSmall);
  }

  handleValueChanged(datePickerEvent: MatDatepickerInputEvent<any>) {
   const { value } = datePickerEvent;

   if (value) {
     const date = toDate(value);
     this.onTouchFn();
     this.onChangeFn(date);
   }
  }

  writeValue(value: any) {
    this.date = toDate(value);
  }
}
