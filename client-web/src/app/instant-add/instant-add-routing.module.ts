import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTngRfidComponent } from './pages/add-tng-rfid/add-tng-rfid.component';
import { InstantConfigComponent } from './pages/instant-config/instant-config.component';
import { ProcessRecordComponent } from './pages/process-record/process-record.component';

const routes: Routes = [
  {
    path: RouteConstant.CONFIG,
    component: InstantConfigComponent
  },
  {
    path: RouteConstant.TNG_RFID,
    component: AddTngRfidComponent
  },
  {
    path: RouteConstant.INSTANT_PROCESS_RECORD,
    component: ProcessRecordComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstantAddRoutingModule { }
