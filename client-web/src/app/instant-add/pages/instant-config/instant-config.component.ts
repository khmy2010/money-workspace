import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FCategoryModel, FPaymentMethodModel } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';
import { PaymentMethodStoreService } from 'src/app/firestore/persistence/payment-method.service';

@Component({
  templateUrl: './instant-config.component.html',
  styleUrls: ['./instant-config.component.scss']
})
export class InstantConfigComponent implements OnInit {
  form = this.fb.group({
    tngEWalletPaymentMethod: [null, [Validators.required]],
  });

  categories$: Observable<FCategoryModel[]> = this.categoriesStoreService.findUserCategories();
  paymentMethods$: Observable<FPaymentMethodModel[]> = this.paymentMethodStoreService.findByUserSnapshot(true);

  constructor(
    private categoriesStoreService: CategoriesStoreService,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

}
