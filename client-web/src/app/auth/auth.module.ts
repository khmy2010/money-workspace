import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from './pages/login/login.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    AuthRoutingModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule {

}