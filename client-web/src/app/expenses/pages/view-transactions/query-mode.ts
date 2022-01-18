export enum QueryRangeMode {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  CURRENT_WEEK = 'Current Week',
  CURRENT_MONTH = 'Current Month',
}

export enum QueryImportanceMode {
  ALL = 'All',
  IMP_ONLY = 'IMPORTANT_ONLY',
  NORMAL = 'NORMAL',
}

export enum QueryMode {
  RANGE = 'Range',
  AMOUNT = 'Amount',
  CATEGORY = 'Category',
  IMPORTANCE = 'Importance',
}