import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreferencesRoutingModule } from './preferences-routing.module';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';


@NgModule({
  declarations: [
    CategoriesComponent,
    ActivityLogsComponent
  ],
  imports: [
    SharedModule,
    PreferencesRoutingModule
  ]
})
export class PreferencesModule { }
