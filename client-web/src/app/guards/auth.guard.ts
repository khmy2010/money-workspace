import { Injectable } from "@angular/core";
import { Auth, authState, signOut, User } from '@angular/fire/auth';
import { CanActivate, Router, UrlTree } from "@angular/router";
import { map, Observable } from "rxjs";
import { RouteConstant } from "src/constant";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {

  }


  canActivate(): Observable<boolean | UrlTree> {
    return authState(this.auth).pipe(
      map((user: User | null) => !!user),
      map((loggedIn: boolean) => {
        if (loggedIn) {
          return true;
        }

        const commands = [
          RouteConstant.PUBLIC,
          RouteConstant.AUTH,
          RouteConstant.LOGIN
        ];

        return this.router.createUrlTree(commands);
      })
    );   
  }
}