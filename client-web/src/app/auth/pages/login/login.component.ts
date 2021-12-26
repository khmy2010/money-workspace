import { Component, OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';
import { SubHandlingService } from 'src/app/common/services/subs.service';

//https://github.com/angular/angularfire/blob/master/samples/modular/src/app/auth/auth.component.ts
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(private auth: Auth) {

  }

  ngOnInit(): void {
  }

  async login() {
    const userCredential: UserCredential = await signInWithPopup(this.auth, new GoogleAuthProvider());

    if (userCredential) {
      console.log('user login success: ', userCredential);
    }
  }
}
