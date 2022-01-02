import { RouteConstant as RT } from "src/constant";

export const siteStructure: IStructureModel[] = [
  {
    module: 'Transactions',
    routes: [
      {
        name: 'Add',
        route: [RT?.EXPENSES, RT?.ADD_TRANSACTIONS],
        pageTitle: 'Add Transactions',
        icon: 'paid'
      },
      {
        name: 'View',
        route: [RT?.EXPENSES, RT?.VIEW_TRANSACTIONS],
        pageTitle: 'View Transactions',
        icon: 'shopping_basket'
      }
    ]
  },
  {
    module: 'Preferences',
    routes: [
      {
        name: 'Categories',
        route: [RT?.PREFERENCES, RT?.CATEGORIES],
        pageTitle: 'Transaction Categories',
        icon: 'style'
      },
      {
        name: 'Activity Logs',
        route: [RT?.PREFERENCES, RT?.ACTIVITY_LOGS],
        pageTitle: 'Activity Logs',
        icon: 'view_agenda'
      }
      // {
      //   name: 'Payment Methods',
      //   route: [RT?.PREFERENCES, RT?.PAYMENT_METHOD],
      //   pageTitle: 'User\'s Payment Methods'
      // }
    ]
  },
  // {
  //   module: 'Recurring Payments',
  //   routes: [
  //     {
  //       name: 'Dashboard',
  //       route: [RT?.RECURRING_PAYMENT, RT?.DASHBOARD],
  //       pageTitle: 'Recurring Payment - Dashboard'
  //     },
  //     {
  //       name: 'Setup New',
  //       route: [RT?.RECURRING_PAYMENT, RT?.SETUP_RECURRING_PAYMENT],
  //       pageTitle: 'Setup New Recurring Payment'
  //     }
  //   ]
  // }
];

export interface IStructureModel {
  module?: string;
  routes?: Array<IStructureModel>;
  name?: string;
  route?: Array<string>;
  pageTitle?: string;
  icon?: string;
}