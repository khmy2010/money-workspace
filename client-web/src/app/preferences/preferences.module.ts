import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreferencesRoutingModule } from './preferences-routing.module';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CopyModule } from '../copy/copy.module';
import { PaymentMethodComponent } from './pages/payment-method/payment-method.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
  declarations: [
    CategoriesComponent,
    ActivityLogsComponent,
    PaymentMethodComponent
  ],
  imports: [
    SharedModule,
    ScrollingModule,
    MatSlideToggleModule,
    PreferencesRoutingModule,
    CopyModule,
  ]
})
export class PreferencesModule { }
