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
