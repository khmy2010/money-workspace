import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RouteConstant } from "src/constant";
import { LoginComponent } from "./pages/login/login.component";

const routes: Routes = [
  {
    path: RouteConstant.LOGIN,
    component: LoginComponent,
  },
  {
    path: '**',
    redirectTo: RouteConstant.LOGIN
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AuthRoutingModule {

}