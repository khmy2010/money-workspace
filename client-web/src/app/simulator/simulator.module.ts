import { NgModule } from '@angular/core';
import { SimulatorRoutingModule } from './simulator-routing.module';
import { ConsoleComponent } from './console/console.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ConsoleComponent
  ],
  imports: [
    SharedModule,
    SimulatorRoutingModule
  ]
})
export class SimulatorModule { }
