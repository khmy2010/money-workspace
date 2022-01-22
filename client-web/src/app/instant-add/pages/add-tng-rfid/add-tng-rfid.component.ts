import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concatMap, forkJoin, map, Observable, take } from 'rxjs';
import { SearchCriteria } from 'src/app/firestore/criteria/search-criteria';
import { FInstantAddType, FInstantEntryModel, FRapidConfigType, FWalletConfigType } from 'src/app/firestore/model/store.model';
import { InstantEntryService } from 'src/app/firestore/persistence/instant-entry.service';
import { StorageService } from 'src/app/storage/storage.service';
import { BaseInstantTemplate } from '../../template/base-instant';

@Component({
  templateUrl: './add-tng-rfid.component.html',
  styleUrls: ['./add-tng-rfid.component.scss']
})
export class AddTngRfidComponent extends BaseInstantTemplate implements OnInit {
  form: FormGroup = this.fb.group({
    fileName: [null, [Validators.required]]
  });

  readonly FInstantAddType = FInstantAddType;

  ngOnInit(): void {

  }

  submit() {
    const precheckCondition: boolean = this.precheck(this.form);

    if (!precheckCondition) {
      return;
    }

    const request$: Observable<any> = forkJoin({
      paymentMethod: this.rapidConfigStoreService.getTngEWalletConfig(),
      category: this.rapidConfigStoreService.getRfidConfig()
    }).pipe(
      map(({ paymentMethod, category }) => {
        return {
          paymentMethod: paymentMethod ? paymentMethod[0] : null,
          category: category ? category[0] : null
        }
      }),
      concatMap(({ paymentMethod, category }) => {
        const payload: FInstantEntryModel = {
          type: FInstantAddType.TNG_RFID_RECEIPT,
          fileName: this.form.value.fileName,
          paymentMethod: paymentMethod ? paymentMethod._id : null,
          category: category ? category._id : null
        };

        return this.uploadAndSubmit(payload);
      }),
      take(1)
    );

    request$.subscribe();
  }

}
