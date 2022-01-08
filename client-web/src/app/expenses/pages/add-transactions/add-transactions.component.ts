import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { DocumentData } from '@angular/fire/firestore';
import { StorageService } from 'src/app/storage/storage.service';


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
    paymentMethod: [null, [Validators.required]],
    file: [null]
  });

  categories$: Observable<FCategoryModel[]> = this.categoriesStoreService.findUserCategories();
  paymentMethods$: Observable<FPaymentMethodModel[]> = this.paymentMethodStoreService.findByUserSnapshot(true);
  paymentId!: string;
  file!: File;

  @ViewChild('fileUpload') fileUploadButton!: ElementRef<HTMLElement>;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private paymentMethodStoreService: PaymentMethodStoreService,
    private transactionStoreService: TransactionStoreService,
    private recurringPaymentStoreService: RecurringPaymentSetupStoreService,
    private categoriesStoreService: CategoriesStoreService,
    private storageService: StorageService) { }

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

  ngAfterViewInit() {
    console.log(this.fileUploadButton);
  }

  openFileUploadInterface() {
    if (this.fileUploadButton?.nativeElement) {
      this.fileUploadButton.nativeElement.click();
    }
  }

  onFileSelected(fileUploadElement: HTMLInputElement) {
    const fileList: FileList | null = fileUploadElement.files;

    if (fileList && fileList.length > 0) {
      const uploadFile: File = fileList[0];
      this.file = uploadFile;
      const fileName: string = this.storageService.genFileName(uploadFile, 'transaction_receipt');

      this.form.get('file')?.patchValue(fileName);

      this.storageService.uploadFile(fileName, uploadFile);
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

      this.transactionStoreService.addByUser(payload).subscribe((doc: DocumentReference<DocumentData>) => {
        if (doc?.id) {
          this.router.navigate([RouteConstant.TRANSACTIONS_ACK, doc?.id], {
            relativeTo: this.route.parent,
          });
        }
      });
    }
  }

}
