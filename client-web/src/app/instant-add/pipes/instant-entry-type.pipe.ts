import { Pipe, PipeTransform } from '@angular/core';
import { FInstantAddType } from 'src/app/firestore/model/store.model';

@Pipe({
  name: 'instantEntryType'
})
export class InstantEntryTypePipe implements PipeTransform {

  transform(value: FInstantAddType | undefined): string {
    if (value) {
      switch(value) {
        case FInstantAddType.TNG_RFID_RECEIPT:
          return `Touch 'n Go RFID Receipt`;
        case FInstantAddType.TNG_TRX_RECEIPT:
          return `Touch 'n Go Transaction Receipt`;
      }
    }

    return '';
  }

}
