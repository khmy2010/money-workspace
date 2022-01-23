export class AuditTrailConstant {
  // Modules
  public static readonly TRANSACTIONS: string = 'CF - Transaction Audit';
  public static readonly USER_LOGIN: string = 'CF - User Login';
  public static readonly USER_CREATION: string = 'CF - User Created';
  public static readonly CATEGORY: string = 'CF - Category Audit';
  public static readonly PAYMENT_METHOD: string = 'CF - Payment Method Audit';
  public static readonly USER_LOGOUT: string = 'CF - User Logout';
  public static readonly CLOUD_STORAGE: string = 'CF - Cloud Storage';
  public static readonly RAPID_CONFIG: string = 'CF - Rapid Config Audit';
}

export class ModuleConstant {
  public static readonly TRANSACTIONS: string = 'Transactions';
  public static readonly AUTH: string = 'Authentication';
  public static readonly CATS: string = 'Categories';
  public static readonly PM: string = 'Payment Methods';
  public static readonly INSTANT_TRANSACTION: string = 'Instant Transaction';
  public static readonly CLOUD_VISION: string = 'Google Cloud Vision API';
  public static readonly UPLOAD: string = 'File Upload';
}