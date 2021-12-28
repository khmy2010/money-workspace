import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AuthGuard } from './guards/auth.guard';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: RouteConstant.PUBLIC
  },
  {
    path: RouteConstant.PUBLIC,
    component: PublicLayoutComponent,
    children: [
      {
        path: RouteConstant.AUTH,
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
      }
    ]
  },
  {
    path: RouteConstant.APP,
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: RouteConstant.DASHBOARD
      },
      {
        path: RouteConstant.DASHBOARD,
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: RouteConstant.PREFERENCES,
        loadChildren: () => import('./preferences/preferences.module').then(m => m.PreferencesModule)
      },
      {
        path: RouteConstant.EXPENSES,
        loadChildren: () => import('./expenses/expenses.module').then(m => m.ExpensesModule)
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: RouteConstant.DASHBOARD
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
