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
import { InstantProcessStatusComponent } from './components/instant-process-status/instant-process-status.component';
import { InstantEntryTypePipe } from './pipes/instant-entry-type.pipe';
import { CopyModule } from '../copy/copy.module';
import { AddGrabFoodComponent } from './pages/add-grab-food/add-grab-food.component';


@NgModule({
  declarations: [
    InstantConfigComponent,
    AddTngRfidComponent,
    UploadBoxComponent,
    ProcessRecordComponent,
    AddTngReceiptComponent,
    PlaceMappingComponent,
    InstantProcessStatusComponent,
    InstantEntryTypePipe,
    AddGrabFoodComponent,
  ],
  imports: [
    SharedModule,
    InstantAddRoutingModule,
    CopyModule,
  ]
})
export class InstantAddModule { }
