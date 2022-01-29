import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }

// https://www.highcharts.com/docs/chart-and-series-types/line-chart