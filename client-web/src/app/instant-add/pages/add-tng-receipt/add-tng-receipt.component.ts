import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { concatMap, filter, map, Observable, tap } from 'rxjs';
import { FInstantAddType, FInstantEntryModel, FRapidConfigModel } from 'src/app/firestore/model/store.model';
import { BaseInstantTemplate } from '../../template/base-instant';

@Component({
  templateUrl: './add-tng-receipt.component.html',
  styleUrls: ['./add-tng-receipt.component.scss']
})
export class AddTngReceiptComponent extends BaseInstantTemplate implements OnInit {
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

    const payload: FInstantEntryModel = {
      type: FInstantAddType.TNG_TRX_RECEIPT,
      fileName: this.form.value.fileName
    };

    const tngPaymentMethod$: Observable<string | null> = this.rapidConfigStoreService.getTngEWalletConfig().pipe(
      map((walletConfigs: FRapidConfigModel[]) => {
        if (walletConfigs?.length === 0) {
          console.warn('No TNG Payment Found');
          return null;
        }
        
        const tngWalletConfig: FRapidConfigModel = walletConfigs[0];

        return tngWalletConfig?.value || null;
      })
    );

    tngPaymentMethod$.pipe(
      filter((paymentMethod: string | null) => !!paymentMethod),
      tap((paymentMethod: string | null) => {
        payload.paymentMethod = paymentMethod;
      }),
      concatMap(() => this.uploadAndSubmit(payload))
    ).subscribe();
  }
}
