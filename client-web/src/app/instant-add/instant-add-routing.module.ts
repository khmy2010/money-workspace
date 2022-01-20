import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTngRfidComponent } from './pages/add-tng-rfid/add-tng-rfid.component';
import { InstantConfigComponent } from './pages/instant-config/instant-config.component';

const routes: Routes = [
  {
    path: RouteConstant.CONFIG,
    component: InstantConfigComponent
  },
  {
    path: RouteConstant.TNG_RFID,
    component: AddTngRfidComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstantAddRoutingModule { }
