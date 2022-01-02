import { NgModule } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SharedModule } from '../shared/shared.module';
import { CopyDirective } from './copy.directive';

@NgModule({
  declarations: [
    CopyDirective,
  ],
  imports: [
    ClipboardModule,
    SharedModule
  ],
  exports: [
    ClipboardModule,
    SharedModule,
    CopyDirective
  ]
})
export class CopyModule { }
