import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';

const routes: Routes = [
  {
    path: RouteConstant.DISCLAIMER,
    component: DisclaimerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { }
