import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth, authState, signOut, User } from '@angular/fire/auth';

@Component({
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  user$: Observable<User | null> = authState(this.auth);

  constructor(private auth: Auth) { }

  ngOnInit(): void {
  }

}
