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
  RFID_CONFIG = 'RFID_CONFIG',
  MERCHANT_CONFIG = 'MERCHANT_CONFIG',
  PLACE_CONFIG = 'PLACE_CONFIG',
  GRAB_FOOD_CONFIG = 'GRAB_FOOD_CONFIG',
}

export enum FWalletConfigType {
  TNG = 'TNG_EWALLET',
  GRABPAY = 'GRABPAY_EWALLET',
}

export interface FRapidConfigModel extends CommonModel {
  configType: FRapidConfigType;
  value: any;
  walletType?: FWalletConfigType;
  merchantName?: string;
  placeType?: string;
  placeDisplayName?: string;
  googlePlaceType?: string;
}

export enum FInstantAddType {
  TNG_RFID_RECEIPT = 'TNG_RFID_RECEIPT',
  TNG_TRX_RECEIPT = 'TNG_TRX_RECEIPT',
  GRAB_FOOD_RECEIPT = 'GRAB_FOOD_RECEIPT',
}

export enum FInstantEntryStatus {
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVIEW_NEEDED = 'review_needed', // able to retrieve place info from Google API
  MANUAL_NEEDED = 'manual_needed', // unable to retrieve place info from Google API
}

export interface FInstantEntryModel extends CommonModel {
  type: FInstantAddType;
  fileName: string;
  paymentMethod?: string | null;
  category?: string | null;
  postProcessStatus?: FInstantEntryStatus;
  postProcessSuccess?: boolean;
  transactionCreated?: string;
  postProcessSuccessDate?: any;
  postProcessFailedDate?: any;
  postProcessFailedReason?: string;
  transactionPendingReview?: string;
  _postProcessSuccessDate?: Date;
}

export interface FTransactionReviewModel extends FTransactionModel {
  merchantName?: string;
}