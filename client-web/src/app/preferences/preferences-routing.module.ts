import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { PaymentMethodComponent } from './pages/payment-method/payment-method.component';

const routes: Routes = [
  {
    path: RouteConstant.CATEGORIES,
    component: CategoriesComponent
  },
  {
    path: RouteConstant.PAYMENT_METHOD,
    component: PaymentMethodComponent
  },
  {
    path: RouteConstant.ACTIVITY_LOGS,
    component: ActivityLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferencesRoutingModule { }
