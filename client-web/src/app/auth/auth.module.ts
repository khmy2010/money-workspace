import { NgModule } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  imports: [
    AuthRoutingModule,
    MatButtonModule,
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule {

}