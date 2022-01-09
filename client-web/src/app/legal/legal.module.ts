import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegalRoutingModule } from './legal-routing.module';
import { DisclaimerComponent } from './pages/disclaimer/disclaimer.component';

@NgModule({
  declarations: [
    DisclaimerComponent
  ],
  imports: [
    CommonModule,
    LegalRoutingModule
  ]
})
export class LegalModule { }
