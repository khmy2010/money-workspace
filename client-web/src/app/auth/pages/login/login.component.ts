import { Component, OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CloudFunctionService } from 'src/app/cloudfunction/cloud-function.service';
import { SubHandlingService } from 'src/app/common/services/subs.service';
import { RouteConstant } from 'src/constant';
import { environment } from 'src/environments/environment';
import { LocalDataSeederService } from '../../seed/local-seeder.service';

//https://github.com/angular/angularfire/blob/master/samples/modular/src/app/auth/auth.component.ts
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(private auth: Auth, private router: Router, private localSeeder: LocalDataSeederService, private cfService: CloudFunctionService) {

  }

  ngOnInit(): void {
  }

  async login() {
    const userCredential: UserCredential = await signInWithPopup(this.auth, new GoogleAuthProvider());

    if (userCredential) {
      console.log('user login success: ', userCredential);
      const commands: string[] = [
        RouteConstant.APP,
        RouteConstant.DASHBOARD
      ];

      if (environment.useEmulators) {
        this.localSeeder.seedDataForDevelopment();
      }

      // this.cfService.callLogin();
      this.router.navigate(commands);
    }
  }
}
