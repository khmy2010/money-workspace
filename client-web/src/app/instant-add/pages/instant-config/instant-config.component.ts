import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Observable, tap } from 'rxjs';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { FCategoryModel, FPaymentMethodModel, FRapidConfigModel, FRapidConfigType, FWalletConfigType } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';
import { PaymentMethodStoreService } from 'src/app/firestore/persistence/payment-method.service';
import { RapidConfigStoreService } from 'src/app/firestore/persistence/rapid-config.service';
import { checkFormGroup } from 'src/app/utils/form';

@Component({
  templateUrl: './instant-config.component.html',
  styleUrls: ['./instant-config.component.scss'],
  providers: [SubHandlingService]
})
export class InstantConfigComponent implements OnInit {
  basicSetupForm = this.fb.group({
    tngEWalletPaymentMethod: [null, [Validators.required]],
    rfidCategory: [null, [Validators.required]],
  });

  categories$: Observable<FCategoryModel[]> = this.categoriesStoreService.findUserCategories();
  paymentMethods$: Observable<FPaymentMethodModel[]> = this.paymentMethodStoreService.findUserWallets();
  userConfigs: FRapidConfigModel[] = [];

  constructor(
    private categoriesStoreService: CategoriesStoreService,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private rapidConfigStoreService: RapidConfigStoreService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private subHandler: SubHandlingService,
  ) { }

  ngOnInit(): void {
    this.subHandler.subscribe(
      this.rapidConfigStoreService.findByUser().pipe(
        tap((configs: FRapidConfigModel[]) => {
          this.userConfigs = [...configs];

          configs.forEach((config: FRapidConfigModel) => {
            switch(config.configType) {
              case FRapidConfigType.EWALLET_CONFIG:
                if (config.walletType === FWalletConfigType.TNG) {
                  this.basicSetupForm.get('tngEWalletPaymentMethod')?.patchValue(config.value);
                }
                break;
              case FRapidConfigType.RFID_CONFIG:
                this.basicSetupForm.get('rfidCategory')?.patchValue(config.value);
                break;
            }
          })
        })
      )
    );
  }

  saveBasicSetup() {
    checkFormGroup(this.basicSetupForm);

    if (this.basicSetupForm.invalid) {
      this.snackBar.open('Invalid Form, Please Check All Fields.');
      return;
    }

    const { tngEWalletPaymentMethod, rfidCategory } = this.basicSetupForm.value;

    const tngWalletConfig: FRapidConfigModel = {
      configType: FRapidConfigType.EWALLET_CONFIG,
      walletType: FWalletConfigType.TNG,
      value: tngEWalletPaymentMethod
    };

    const rfidConfig: FRapidConfigModel = {
      configType: FRapidConfigType.RFID_CONFIG,
      value: rfidCategory
    };

    const existingTngWalletConfig: FRapidConfigModel | undefined = this.findExistingConfig(FRapidConfigType.EWALLET_CONFIG);
    const existingRfidConfig: FRapidConfigModel | undefined = this.findExistingConfig(FRapidConfigType.RFID_CONFIG);

    const request$: Observable<any> = forkJoin({
      tngWalletConfig: existingTngWalletConfig ? this.rapidConfigStoreService.update(existingTngWalletConfig._id as string, tngWalletConfig) : this.rapidConfigStoreService.add(tngWalletConfig),
      rfidConfig: existingRfidConfig ? this.rapidConfigStoreService.update(existingRfidConfig._id as string, rfidConfig) : this.rapidConfigStoreService.add(rfidConfig),
    });

    this.subHandler.subscribe(request$);
  }

  private findExistingConfig(searchType: FRapidConfigType): FRapidConfigModel | undefined {
    return this.userConfigs.find(({ configType }) => configType === searchType);
  }
}
