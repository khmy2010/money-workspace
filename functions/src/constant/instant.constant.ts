export class InstantExceptionConstant {
  public static readonly INVALID_MERCHANT: string = 'Invalid Merchant Name Found.';
  public static readonly INVALID_AMOUNT: string = 'Invalid Transaction Amount Extracted.';
  public static readonly NO_MERCHANT_FOUND: string = 'Unable to Extract Valid Merchant Name from Uploaded Document.';
  public static readonly INVALID_DATE: string = 'Invalid Transaction Date Extracted.';
  public static readonly NO_AMOUNT_FOUND: string = 'Unable to Extract Valid Transaction Amount from Uploaded Document.';
  public static readonly MISSING_MERCHANT_CONFIG: string = 'No Merchant Found from Configurations.';
  public static readonly INVALID_INSTANT_ENTRY: string = 'Invalid Instant Entry.';
  public static readonly INVALID_INSTANT_TYPE: string = 'Invalid Instant Type.';
  public static readonly NO_DATE_FOUND: string = 'Unable to Extract Valid Transaction Date from Uploaded Document.';
  public static readonly IMAGE_NOT_SAFE: string = 'Image Uploaded Is Not Safe for Processing.';
  public static readonly NO_TEXT_FOUND: string = 'Unable to Extract Content from Uploaded Image.';
}


/**
 * Non Parsable Words [TNG Reserved Keywords]
 */
export const INSTANT_NPC_CONSTANT: string[] = [
  'Paid',
  'Merchant',
  'Transaction Type',
  'Date/Time',
  'Date / Time',
  'eWallet Ref No.',
  'Payment Method',
  'Quick Payment',
  'You will see a reload with this amount before this transaction in your transaction history',
  'Done',
  'Receiver',
  'Wallet Ref',
  'Status',
  'Transaction No.',
  'Merchants can scan the code for refund or query transaction',
  'Pay Via',
  'DuitNow Ref No.',
  'Payment Details',
];

/**
 * Non Parsable Words [Grab Reserved Keywords]
 */
export const INSTANT_NPC_GRAB_CONSTANT: string[] = [
  'Booking Details',
  'Receipt Summary',
  'Vehicle type',
  'Issued by driver',
  'Issued to',
  'Booking code',
  'Order location:',
  'Order location',
  'Delivery location:',
  'Delivery location',
  'Profil',
  'Subtotal',
  'incl. Tax',
  'TOTAL (INCL. TAX)',
  'Points Earned:',
  'Points Earned',
  'Mata yang diperolehi:',
  'Mata yang diperolehi',
  'Delivery fee',
  'Restaurant packaging charge',
  'HOTDEALS',
  'Profile:',
  'Personal',
];