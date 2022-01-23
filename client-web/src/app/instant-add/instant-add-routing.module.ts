import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { AddTngReceiptComponent } from './pages/add-tng-receipt/add-tng-receipt.component';
import { AddTngRfidComponent } from './pages/add-tng-rfid/add-tng-rfid.component';
import { InstantConfigComponent } from './pages/instant-config/instant-config.component';
import { PlaceMappingComponent } from './pages/place-mapping/place-mapping.component';
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
    path: RouteConstant.TNG_RECEIPT,
    component: AddTngReceiptComponent
  },
  {
    path: RouteConstant.INSTANT_PROCESS_RECORD,
    component: ProcessRecordComponent
  },
  {
    path: RouteConstant.PLACE_MAPPING,
    component: PlaceMappingComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstantAddRoutingModule { }
