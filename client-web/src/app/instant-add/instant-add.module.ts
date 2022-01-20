import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstantAddRoutingModule } from './instant-add-routing.module';
import { InstantConfigComponent } from './pages/instant-config/instant-config.component';
import { AddTngRfidComponent } from './pages/add-tng-rfid/add-tng-rfid.component';
import { UploadBoxComponent } from './components/upload-box/upload-box.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    InstantConfigComponent,
    AddTngRfidComponent,
    UploadBoxComponent
  ],
  imports: [
    SharedModule,
    InstantAddRoutingModule
  ]
})
export class InstantAddModule { }
