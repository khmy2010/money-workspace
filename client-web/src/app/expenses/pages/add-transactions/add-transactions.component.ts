import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, forkJoin, Observable, of, tap } from 'rxjs';
import { FCategoryModel, FPaymentMethodModel, FRapidConfigModel, FRapidConfigType, FRecurringPaymentSetupModel, FTransactionModel, FTransactionReviewModel } from 'src/app/firestore/model/store.model';
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
import { TransactionReviewStoreService } from 'src/app/firestore/persistence/transaction-review.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstantEntryService } from 'src/app/firestore/persistence/instant-entry.service';
import { RapidConfigStoreService } from 'src/app/firestore/persistence/rapid-config.service';


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
  loading: boolean = false;
  reviewId!: string;
  reviewModel!: FTransactionReviewModel;
  pendingNavigation!: string;

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
    private storageService: StorageService,
    private transactionReviewStoreService: TransactionReviewStoreService,
    private matSnackBar: MatSnackBar,
    private instantEntryService: InstantEntryService,
    private configStoreService: RapidConfigStoreService, ) { }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.queryParams['payment'];
    this.reviewId = this.route.snapshot.queryParams['review'];
    const copyFrom: string = this.route.snapshot.queryParams['copyFrom'];

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
    else if (copyFrom) {
      const transactionDoc$: Observable<FTransactionModel | null> = this.transactionStoreService.get(copyFrom).pipe(
        catchError(() => of(null) as Observable<null>),
        tap((transaction: FTransactionModel | null) => {
          if (transaction) {
            const { _transactionDate, category, paymentMethod } = transaction;

            this.form.patchValue({
              transactionDate: _transactionDate || new Date(),
              category: category || null,
              paymentMethod: paymentMethod || null
            });
          }
        })
      );

      this.subHandler.subscribe(transactionDoc$);
    }
    else if (this.reviewId) {
      const reviewDoc$: Observable<FTransactionReviewModel | null> = this.transactionReviewStoreService.get(this.reviewId).pipe(
        catchError(() => of(null) as Observable<null>),
        tap((reviewModel: FTransactionReviewModel | null) => {
          if (!reviewModel) {
            return;
          }

          this.reviewModel = {
            ...reviewModel
          };

          const { 
            category,
            paymentMethod,
            remark,
            _transactionDate,
            amount,
           } = reviewModel;

           console.log('Review Model: ', reviewModel);

           this.form.patchValue({
            transactionDate: _transactionDate || new Date(),
            category: category || null,
            paymentMethod: paymentMethod || null,
            remark: remark || null,
            amount: amount || 0,
          });
        })
      );

      this.subHandler.subscribe(reviewDoc$);
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

      if (this.reviewMode) {
        payload = {
          ...payload,
          instantEntryRecord: this.reviewModel?.instantEntryRecord
        };
      }

      let request$: Observable<any>;
      this.loading = true;

      if (this.file) {
         request$ = forkJoin({
          transaction: this.transactionStoreService.addByUser(payload),
          fileId: this.storageService.uploadFile(payload.receipt as string, this.file)
        }).pipe(tap(({ transaction }) => {
          this.loading = false;

          if (transaction?.id) {
            this.navigateToReceipt(transaction.id, this.reviewMode);
          }
        }));
      }
      else {
        request$ = this.transactionStoreService.addByUser(payload).pipe(
          tap((doc: DocumentReference<DocumentData>) => {
            this.loading = false;
            
            if (doc?.id) {
              this.navigateToReceipt(doc.id, this.reviewMode);
            }
          })
        );
      }

      if (this.reviewMode) {
        request$ = request$.pipe(
          concatMap((doc: DocumentReference<DocumentData>) => this.reviewSuccess(payload.category, doc?.id)),
          tap(() => {
            this.navigateToReceipt(this.pendingNavigation);
          })
        );
      }

      this.subHandler.subscribe(request$);
    }
    else {
      this.matSnackBar.open('Invalid Form');
    }
  }

  get reviewMode(): boolean {
    return !!this.reviewId && !!this.reviewModel;
  }

  private navigateToReceipt(id: string, wait?: boolean) {
    if (wait) {
      this.pendingNavigation = id;
      return;
    }

    this.ngZone.run(() => {
      this.router.navigate([RouteConstant.TRANSACTIONS_ACK, id], {
        relativeTo: this.route.parent,
      });
    });
  }

  private reviewSuccess(reviewedCategoryId: string, transactionCreatedId: string) {
    if (!this.reviewMode || !this.reviewModel?.instantEntryRecord) {
      return of(null);
    }

    const entryReviewRequest$: Observable<any> = this.instantEntryService.reviewSuccess(this.reviewModel.instantEntryRecord as string, transactionCreatedId);
    const deleteReviewRequest$: Observable<any> = this.transactionReviewStoreService.delete(this.reviewId);
    const configPayload: FRapidConfigModel = {
      configType: FRapidConfigType.MERCHANT_CONFIG,
      merchantName: this.reviewModel.merchantName,
      value: reviewedCategoryId
    };
    const addConfigRequest$: Observable<any> = this.configStoreService.add(configPayload);

    return forkJoin({
      entryReview: entryReviewRequest$,
      deleteReview: deleteReviewRequest$,
      addConfig: addConfigRequest$
    });
  }
}
