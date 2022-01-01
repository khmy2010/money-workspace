import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';
import { CategoriesComponent } from './pages/categories/categories.component';

const routes: Routes = [
  {
    path: RouteConstant.CATEGORIES,
    component: CategoriesComponent
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
