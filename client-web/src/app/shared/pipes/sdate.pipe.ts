import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'sdate'
})
export class StandardDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return '-';
    }

    return formatDate(value, 'd MMM yyyy', 'en');
  }

}
