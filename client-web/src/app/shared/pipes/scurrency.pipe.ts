import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@angular/common';

@Pipe({
  name: 'scurr'
})
export class StandardCurrencyPipe implements PipeTransform {
  transform(value: any): any {
    if (value === null || value === undefined) {
      return '-';
    }

    return formatCurrency(value, 'en', 'MYR ', 'MYR ', '1.2-2');
  }
}
