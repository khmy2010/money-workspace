import { FCategoryModel } from "src/app/firestore/model/store.model";
import { AppConstant } from "src/constant";

export const categorySeeds: FCategoryModel[] = [
  {
    name: 'Entertainment',
    color: '#e50914',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Barber',
    color: '#323232',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Personal Care',
    color: '#f37021',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Chore',
    color: '#ffcf22',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Transportations',
    color: '#1d2473',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Health and Fitness',
    color: '#ff0363',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Gifts and Goodwill',
    color: '#ade1cd',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Insurance',
    color: '#23366f',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Groceries',
    color: '#d640a1',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Foods and Beverages',
    color: '#2c9f45',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'CapEx',
    color: '#fb9e99',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Loan',
    color: '#A85566',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Utilities',
    color: '#115e67',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Room Rental',
    color: '#333333',
    status: AppConstant.ACTIVE,
  },
  {
    name: 'Development',
    color: '#005cff',
    status: AppConstant.ACTIVE,
  },
];