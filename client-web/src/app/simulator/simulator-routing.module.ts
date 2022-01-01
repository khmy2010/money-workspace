import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstant } from 'src/constant';
import { ConsoleComponent } from './console/console.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: RouteConstant.CONSOLE
  },
  {
    path: RouteConstant.CONSOLE,
    component: ConsoleComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimulatorRoutingModule { }
