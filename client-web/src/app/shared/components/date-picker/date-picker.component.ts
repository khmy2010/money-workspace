import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CustomControlBase } from '../../template/custom-control';
import toDate from 'date-fns/toDate';

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

  constructor() {
    super();
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
