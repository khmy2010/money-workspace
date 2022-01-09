import { NgModule } from '@angular/core';
import { FullViewerComponent } from './containers/full-viewer/full-viewer.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    FullViewerComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    FullViewerComponent,
  ]
})
export class ImageViewerModule { }
