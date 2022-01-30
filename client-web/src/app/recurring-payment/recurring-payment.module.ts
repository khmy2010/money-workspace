import { NgModule } from '@angular/core';
import { RecurringPaymentRoutingModule } from './recurring-payment-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PaymentDashboardComponent } from './pages/payment-dashboard/payment-dashboard.component';
import { SetupTransactComponent } from './pages/setup-transact/setup-transact.component';


@NgModule({
  declarations: [
    PaymentDashboardComponent,
    SetupTransactComponent
  ],
  imports: [
    SharedModule,
    RecurringPaymentRoutingModule
  ]
})
export class RecurringPaymentModule { }
