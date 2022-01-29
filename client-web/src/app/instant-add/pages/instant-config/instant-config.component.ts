import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  basicSetupForm: FormGroup = this.fb.group({
    tngEWalletPaymentMethod: [null, [Validators.required]],
    rfidCategory: [null, [Validators.required]],
    grabPayPaymentMethod: [null, [Validators.required]],
  });

  merchantSetupForm: FormGroup = this.fb.group({
    merchantConfigs: this.fb.array([])
  });

  categories: FCategoryModel[] = [];
  paymentMethods: FPaymentMethodModel[] = [];
  userConfigs: FRapidConfigModel[] = [];
  creatingMerchant: boolean = false;

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
      this.categoriesStoreService.findUserCategories().pipe(
        tap((categories: FCategoryModel[]) => {
          this.categories = [...categories];
        })
      )
    );

    this.subHandler.subscribe(
      this.paymentMethodStoreService.findUserWallets().pipe(
        tap((paymentMethods: FPaymentMethodModel[]) => {
          this.paymentMethods = [...paymentMethods];
        })
      )
    );

    this.subHandler.subscribe(
      this.rapidConfigStoreService.findByUser().pipe(
        tap((configs: FRapidConfigModel[]) => {
          this.userConfigs = [...configs];
          this.merchants.clear();
          this.merchants.reset();

          configs.forEach((config: FRapidConfigModel) => {
            switch(config.configType) {
              case FRapidConfigType.EWALLET_CONFIG:
                if (config.walletType === FWalletConfigType.TNG) {
                  this.basicSetupForm.get('tngEWalletPaymentMethod')?.patchValue(config.value);
                }

                if (config.walletType === FWalletConfigType.GRABPAY) {
                  this.basicSetupForm.get('grabPayPaymentMethod')?.patchValue(config.value);
                }
                break;
              case FRapidConfigType.RFID_CONFIG:
                this.basicSetupForm.get('rfidCategory')?.patchValue(config.value);
                break;
              case FRapidConfigType.MERCHANT_CONFIG:
                this.pushMerchantFormGroup(config);
                break;
            }
          });

          this.pushMerchantFormGroup();
        })
      )
    );

    this.rapidConfigStoreService.getGrabPayConfig().subscribe(console.log);
  }

  saveBasicSetup() {
    checkFormGroup(this.basicSetupForm);

    if (this.basicSetupForm.invalid) {
      this.snackBar.open('Invalid Form, Please Check All Fields.');
      return;
    }

    const { tngEWalletPaymentMethod, rfidCategory, grabPayPaymentMethod } = this.basicSetupForm.value;

    const tngWalletConfig: FRapidConfigModel = {
      configType: FRapidConfigType.EWALLET_CONFIG,
      walletType: FWalletConfigType.TNG,
      value: tngEWalletPaymentMethod
    };

    const rfidConfig: FRapidConfigModel = {
      configType: FRapidConfigType.RFID_CONFIG,
      value: rfidCategory
    };

    const grabPayConfig: FRapidConfigModel = {
      configType: FRapidConfigType.EWALLET_CONFIG,
      walletType: FWalletConfigType.GRABPAY,
      value: grabPayPaymentMethod
    };

    const existingTngWalletConfig: FRapidConfigModel | undefined = this.findExistingConfig(FRapidConfigType.EWALLET_CONFIG, FWalletConfigType.TNG);
    const existingGrabPayConfig: FRapidConfigModel | undefined = this.findExistingConfig(FRapidConfigType.EWALLET_CONFIG, FWalletConfigType.GRABPAY);
    const existingRfidConfig: FRapidConfigModel | undefined = this.findExistingConfig(FRapidConfigType.RFID_CONFIG);

    const request$: Observable<any> = forkJoin({
      tngWalletConfig: existingTngWalletConfig ? this.rapidConfigStoreService.update(existingTngWalletConfig._id as string, tngWalletConfig) : this.rapidConfigStoreService.add(tngWalletConfig),
      rfidConfig: existingRfidConfig ? this.rapidConfigStoreService.update(existingRfidConfig._id as string, rfidConfig) : this.rapidConfigStoreService.add(rfidConfig),
      grabConfig: existingGrabPayConfig ? this.rapidConfigStoreService.update(existingGrabPayConfig._id as string, grabPayConfig) : this.rapidConfigStoreService.add(grabPayConfig),
    });

    this.subHandler.subscribe(request$);
  }

  createNewMerchant(index: number) {
    const formGroup: FormGroup = this.merchants.at(index) as FormGroup; 

    if (!formGroup || formGroup?.invalid) {
      return;
    }

    const { merchantName, value } = formGroup.value;

    const payload: FRapidConfigModel = {
      configType: FRapidConfigType.MERCHANT_CONFIG,
      merchantName,
      value
    };

    this.creatingMerchant = true;

    this.subHandler.subscribe(
      this.rapidConfigStoreService.add(payload).pipe(
        tap(() => this.creatingMerchant = false)
      )
    );
  }

  updateExistingMerchant(index: number) {
    const formGroup: FormGroup = this.merchants.at(index) as FormGroup; 

    if (!formGroup || formGroup?.invalid) {
      return;
    }

    const { merchantName, value, id } = formGroup.value;

    const payload: FRapidConfigModel = {
      configType: FRapidConfigType.MERCHANT_CONFIG,
      merchantName,
      value
    };

    this.subHandler.subscribe(
      this.rapidConfigStoreService.update(id, payload).pipe(
        tap(() => this.creatingMerchant = false)
      )
    );
  }

  deleteMerchant(index: number) {
    const formGroup: FormGroup = this.merchants.at(index) as FormGroup; 

    if (!formGroup) {
      return;
    }

    const id = formGroup.value?.id;

    this.subHandler.subscribe(
      this.rapidConfigStoreService.delete(id)
    );
  }

  addMerchant() {
    this.pushMerchantFormGroup();
  }

  get merchants(): FormArray {
    return this.merchantSetupForm.get('merchantConfigs') as FormArray;
  }

  private findExistingConfig(searchType: FRapidConfigType, searchWalletType?: FWalletConfigType): FRapidConfigModel | undefined {
    return this.userConfigs.find(({ configType, walletType }) => {
      if (searchWalletType) {
        return configType === searchType && walletType === searchWalletType;
      }

      return configType === searchType;
    });
  }

  private pushMerchantFormGroup(configValue?: FRapidConfigModel) {
    this.merchants.push(
      this.fb.group({
        merchantName: [configValue?.merchantName ?? null, [Validators.required]],
        value: [configValue?.value ?? null, [Validators.required]],
        persisted: !!configValue,
        id: configValue?._id
      })
    );
  }
}
