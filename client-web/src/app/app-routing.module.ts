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
      },
      {
        path: RouteConstant.LEGAL,
        loadChildren: () => import('./legal/legal.module').then(m => m.LegalModule)
      },
      {
        path: '**',
        redirectTo: RouteConstant.AUTH
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
        path: RouteConstant.SIMULATOR,
        loadChildren: () => import('./simulator/simulator.module').then(m => m.SimulatorModule)
      },
      {
        path: RouteConstant.INSTANT,
        loadChildren: () => import('./instant-add/instant-add.module').then(m => m.InstantAddModule)
      },
      {
        path: RouteConstant.RECURRING_PAYMENT,
        loadChildren: () => import('./recurring-payment/recurring-payment.module').then(m => m.RecurringPaymentModule)
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
