import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FCategoryModel, FPaymentMethodModel, FRecurringPaymentSetupModel, FTransactionModel } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';
import { PaymentMethodStoreService } from 'src/app/firestore/persistence/payment-method.service';
import { RecurringPaymentSetupStoreService } from 'src/app/firestore/persistence/recurring-payment-setup.service';
import { TransactionStoreService } from 'src/app/firestore/persistence/transaction.service';
import { checkFormGroup } from 'src/app/utils/form';
import { RouteConstant } from 'src/constant';

@Component({
  selector: 'app-add-transactions',
  templateUrl: './add-transactions.component.html',
  styleUrls: ['./add-transactions.component.scss']
})
export class AddTransactionsComponent {
  form = this.fb.group({
    transactionDate: [new Date(), [Validators.required]],
    category: [null, [Validators.required]],
    amount: [null, [Validators.required]],
    remark: [null, [Validators.required]],
    paymentMethod: [null, [Validators.required]]
  });

  categories$: Observable<FCategoryModel[]> = this.categoriesStoreService.findUserCategories();
  paymentMethods$: Observable<FPaymentMethodModel[]> = this.paymentMethodStoreService.findByUserSnapshot(true);
  paymentId!: string;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private transactionStoreService: TransactionStoreService,
    private recurringPaymentStoreService: RecurringPaymentSetupStoreService,
    private categoriesStoreService: CategoriesStoreService) { }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.queryParams['payment'];
    this.paymentMethods$.subscribe(console.log);

    if (this.paymentId) {
      this.recurringPaymentStoreService.get(this.paymentId).subscribe((data: FRecurringPaymentSetupModel) => {
        if (data) {
          this.form.patchValue({
            category: data?.category,
            remark: `Scheduled payment for ${data?.title}`,
            amount: data?.amount
          });
  
          this.form.get('category')?.disable();
          this.form.get('remark')?.disable();
          this.form.get('amount')?.disable();
        }
      });
    }
  }

  addTransaction() {
    checkFormGroup(this.form);

    if (this.form.valid) {
      let payload: FTransactionModel = {
        ...this.form.getRawValue(),
        transactionType: this.paymentId ? 'recurring' : 'normal'
      };

      if (this.paymentId) {
        payload = {
          ...payload,
          recurringPayment: this.paymentId
        };
      }

      // this.transactionStoreService.addByUser(payload).subscribe((doc: DocumentReference<FTransactionModel>) => {
      //   if (doc?.id) {
      //     this.router.navigate([RouteConstant.TRANSACTIONS_ACK, doc?.id], {
      //       relativeTo: this.route.parent,
      //     });
      //   }
      // });
    }
  }

}
