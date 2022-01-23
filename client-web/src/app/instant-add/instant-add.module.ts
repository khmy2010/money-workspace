import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstantAddRoutingModule } from './instant-add-routing.module';
import { InstantConfigComponent } from './pages/instant-config/instant-config.component';
import { AddTngRfidComponent } from './pages/add-tng-rfid/add-tng-rfid.component';
import { UploadBoxComponent } from './components/upload-box/upload-box.component';
import { SharedModule } from '../shared/shared.module';
import { ProcessRecordComponent } from './pages/process-record/process-record.component';
import { AddTngReceiptComponent } from './pages/add-tng-receipt/add-tng-receipt.component';
import { PlaceMappingComponent } from './pages/place-mapping/place-mapping.component';


@NgModule({
  declarations: [
    InstantConfigComponent,
    AddTngRfidComponent,
    UploadBoxComponent,
    ProcessRecordComponent,
    AddTngReceiptComponent,
    PlaceMappingComponent
  ],
  imports: [
    SharedModule,
    InstantAddRoutingModule
  ]
})
export class InstantAddModule { }
