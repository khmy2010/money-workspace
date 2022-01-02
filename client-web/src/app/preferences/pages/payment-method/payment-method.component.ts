import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FPaymentMethodModel } from 'src/app/firestore/model/store.model';
import { PaymentMethodStoreService } from 'src/app/firestore/persistence/payment-method.service';
import { AppConstant } from 'src/constant';

@Component({
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit {
  form: FormGroup = this.fb.group({
    methods: this.fb.array([])
  })

  constructor(
    private fb: FormBuilder,
    private paymentMethodStoreService: PaymentMethodStoreService
  ) { }

  ngOnInit(): void {
    this.paymentMethodStoreService.findByUser().subscribe((methods: FPaymentMethodModel[]) => {
      this.methods.clear();
      methods.forEach(method => this.pushFormGroup(method));
      this.pushFormGroup();
    });
  }

  get methods(): FormArray {
    return this.form.get('methods') as FormArray;
  }

  create(index: number) {
    const fg: FormGroup = this.methods.at(index) as FormGroup;

    const {
      name,
      status,
      type,
      suffix
    } = fg.value;

    const payload: FPaymentMethodModel = {
      name,
      status: status ? 'active' : 'inactive',
      type
    };

    if (type === 'creditCard') {
      payload.suffix = suffix;
    }

    this.paymentMethodStoreService.add(payload);
  }

  update(index: number) {

  }

  private pushFormGroup(value?: FPaymentMethodModel) {
    const formGroup: FormGroup = this.fb.group({
      name: [value?.name ?? '', [Validators.required]],
      status: [value?.status ? value?.status === AppConstant.ACTIVE : true, [Validators.required]],
      type: [value?.type ?? 'creditCard', [Validators.required]],
      suffix: [value?.suffix ?? ''],
      persisted: [!!value],
      id: [value?._id],
      submitting: [false]
    });

    if (value?.type === 'cash') {
      formGroup.disable();
    }

    this.methods?.push(formGroup);
  }
}
