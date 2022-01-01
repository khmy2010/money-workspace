import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreferencesRoutingModule } from './preferences-routing.module';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [
    CategoriesComponent,
    ActivityLogsComponent
  ],
  imports: [
    SharedModule,
    ScrollingModule,
    PreferencesRoutingModule
  ]
})
export class PreferencesModule { }
