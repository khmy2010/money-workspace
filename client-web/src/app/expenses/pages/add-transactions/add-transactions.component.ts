import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, tap } from 'rxjs';
import { FCategoryModel, FPaymentMethodModel, FRecurringPaymentSetupModel, FTransactionModel } from 'src/app/firestore/model/store.model';
import { CategoriesStoreService } from 'src/app/firestore/persistence/categories.service';
import { PaymentMethodStoreService } from 'src/app/firestore/persistence/payment-method.service';
import { RecurringPaymentSetupStoreService } from 'src/app/firestore/persistence/recurring-payment-setup.service';
import { TransactionStoreService } from 'src/app/firestore/persistence/transaction.service';
import { checkFormGroup } from 'src/app/utils/form';
import { RouteConstant } from 'src/constant';
import { DocumentData } from '@angular/fire/firestore';
import { StorageService } from 'src/app/storage/storage.service';
import { readURL } from 'src/app/utils/image';
import { SubHandlingService } from 'src/app/common/services/subs.service';


@Component({
  selector: 'app-add-transactions',
  templateUrl: './add-transactions.component.html',
  styleUrls: ['./add-transactions.component.scss'],
  providers: [SubHandlingService]
})
export class AddTransactionsComponent {
  form = this.fb.group({
    transactionDate: [new Date(), [Validators.required]],
    category: [null, [Validators.required]],
    amount: [null, [Validators.required]],
    remark: [null, [Validators.required]],
    paymentMethod: [null, [Validators.required]],
    receipt: [null],
    important: [false, [Validators.required]],
  });

  categories$: Observable<FCategoryModel[]> = this.categoriesStoreService.findUserCategories();
  paymentMethods$: Observable<FPaymentMethodModel[]> = this.paymentMethodStoreService.findByUserSnapshot(true);
  paymentId!: string;
  file!: File | null;
  previewFile$!: Observable<string | null> | null;

  @ViewChild('fileUpload') fileUploadButton!: ElementRef<HTMLElement>;

  constructor(
    private ngZone: NgZone,
    private subHandler: SubHandlingService,
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
      this.previewFile$ = readURL(uploadFile);
      this.form.get('receipt')?.patchValue(fileName);
    }
  }

  removeFile() {
    this.form.get('receipt')?.reset();
    this.form.get('receipt')?.updateValueAndValidity();

    this.file = null;
    this.previewFile$ = null;
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

      if (this.file) {
        payload = {
          ...payload,
          receiptReviewed: false
        };
      }
      else {
        delete payload.receipt;
      }

      let request$: Observable<any>;

      if (this.file) {
         request$ = forkJoin({
          transaction: this.transactionStoreService.addByUser(payload),
          fileId: this.storageService.uploadFile(payload.receipt as string, this.file)
        }).pipe(tap(({ transaction }) => {
          if (transaction?.id) {
            this.navigateToReceipt(transaction.id);
          }
        }));
      }
      else {
        request$ = this.transactionStoreService.addByUser(payload).pipe(
          tap((doc: DocumentReference<DocumentData>) => {
            if (doc?.id) {
              this.navigateToReceipt(doc.id);
            }
          })
        );
      }

      this.subHandler.subscribe(request$);
    }
  }

  private navigateToReceipt(id: string) {
    this.ngZone.run(() => {
      this.router.navigate([RouteConstant.TRANSACTIONS_ACK, id], {
        relativeTo: this.route.parent,
      });
    });
  }
}
