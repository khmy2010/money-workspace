export interface CommonModel {
  _id?: string;
  createdDate?: any;
  _createdDate?: Date;
  _createdDateFromNow?: string;
  status?: string;
  uid?: string;
}

export interface FCategoryModel extends CommonModel {
  name: string;
  color: string;
}

export interface FTransactionModel extends CommonModel {
  transactionDate: any;
  _transactionDate?: Date;
  _transactionDateFromNow?: string;
  category: string;
  amount: number;
  remark: string;
  categoryDocument?: FCategoryModel;
  paymentMethod: string;
  paymentMethodDocument?: FPaymentMethodModel;
  transactionType: string;
  recurringPayment?: string;
}

export interface FPaymentMethodModel extends CommonModel {
  name: string;
  type: string;
  suffix?: string;
}

export interface FRecurringPaymentSetupModel extends CommonModel {
  firstDueDate: any;
  category: string;
  amount: number;
  title: string;
  frequency: string;
  nextDueDate?: any;
  _nextDueDate?: any;
  lastPayment?: string;
  due?: boolean;
  lastCheckedDate: any;
  categoryDocument?: FCategoryModel;
  _nextDueDateFromNow?: string;
  active?: boolean;
}