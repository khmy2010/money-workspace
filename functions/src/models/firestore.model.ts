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
  aggregatedCount?: number;
  aggregatedSpending?: number;
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
  receipt?: string;
  receiptThumbnail?: string;
  receiptMobile?: string;
  receiptReviewed?: boolean;
  receiptReviewedDate?: any;
  _receiptReviewedDate?: Date;
  important?: boolean;
  instantEntryRecord?: string;
}

export enum FTransactionFields {
  TRANSACTION_DATE = 'transactionDate',
  AMOUNT = 'amount',
  CATEGORY = 'category',
  IMPORTANT = 'important',
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

export interface FUserModel extends CommonModel {
  displayName: string;
  email: string;
  lastLoginDate: any;
  photoURL: string;
  uid: string;
}

export interface FDayEndModel extends CommonModel {
  
}

export interface FAuditTrailModel extends CommonModel {
  entryPoint: string;
  module: string;
  action: string;
  eventType?: string;
  uid?: string;
  auditDate: any;
  clientIp?: string;
  oldValueJson?: string;
  newValueJson?: string;

  // Image Processing
  resizeFileName?: string;
  resizeFilePath?: string;
  thumbFileName?: string;
  thumbnailFilePath?: string;
}

export interface FMetaModel {
  activityLogs: number;
  uid: string;
}

export interface AuditTrailRequestModel {
  entryPoint: string;
  module: string;
  itemName: string;
  metaName: string;
  metaKey: string;
}

export interface FFileModel {
  fileName: string;
  type: string;
  uid: string;
  fullPath: string;
  bucket: string;
  fileCreatedDate: string;
  resizeFileName?: string;
  resizeFilePath?: string;
  thumbFileName?: string;
  thumbnailFilePath?: string;
  mobileFileName?: string;
  mobileFilePath?: string;
  screenResult?: any[];
}

export enum FRapidConfigType {
  EWALLET_CONFIG = 'EWALLET_CONFIG',
  RFID_CONFIG = 'RFID_CONFIG'
}

export enum FWalletConfigType {
  TNG = 'TNG_EWALLET',
}

export interface FRapidConfigModel extends CommonModel {
  configType: FRapidConfigType;
  value: any;
  walletType?: FWalletConfigType;
}

export enum FInstantAddType {
  TNG_RFID_RECEIPT = 'TNG_RFID_RECEIPT',
  TNG_TRX_RECEIPT = 'TNG_TRX_RECEIPT',
}

export interface FInstantEntryModel extends CommonModel {
  type: FInstantAddType;
  fileName: string;
  paymentMethod?: string | null;
  category?: string | null;
  postProcessSuccess?: boolean;
  transactionCreated?: string;
  postProcessSuccessDate?: any;
}