import { RouteConstant as RT } from "src/constant";

// https://fonts.google.com/icons?selected=Material+Icons
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
      },
    ]
  },
  {
    module: 'Instant Add',
    routes: [
      {
        name: 'Config',
        route: [RT?.INSTANT, RT?.CONFIG],
        pageTitle: 'Instant Transaction Configurations',
        icon: 'settings'
      },
      {
        name: 'Places Mapping',
        route: [RT?.INSTANT, RT?.PLACE_MAPPING],
        pageTitle: 'Instant Transaction Configurations',
        icon: 'place'
      },
      {
        name: 'Add TNG RFID Transaction',
        route: [RT?.INSTANT, RT?.TNG_RFID],
        pageTitle: 'Instantly Add TNG RFID',
        icon: 'toll'
      },
      {
        name: 'Add TNG Transaction',
        route: [RT?.INSTANT, RT?.TNG_RECEIPT],
        pageTitle: 'Instantly Add TNG Recept',
        icon: 'receipt'
      },
      {
        name: 'Add Grab Food Transaction',
        route: [RT?.INSTANT, RT?.GRAB_FOOD_RECEIPT],
        pageTitle: 'Instantly Add Grab Food Receipt',
        icon: 'delivery_dining'
      },
      {
        name: 'View Status',
        route: [RT?.INSTANT, RT?.INSTANT_PROCESS_RECORD],
        pageTitle: 'View Status',
        icon: 'inventory'
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
        name: 'Payment Methods',
        route: [RT?.PREFERENCES, RT?.PAYMENT_METHOD],
        pageTitle: 'User\'s Payment Methods',
        icon: 'card_membership'
      },
      {
        name: 'Activity Logs',
        route: [RT?.PREFERENCES, RT?.ACTIVITY_LOGS],
        pageTitle: 'Activity Logs',
        icon: 'view_agenda'
      },
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