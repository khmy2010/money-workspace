import { Injectable } from "@angular/core";
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CloudFunctionService {
  constructor(private functions: Functions) {

  }

  callLogin() {
    return httpsCallableData(this.functions, 'userLogin')();
  }

  callLogout() {
    return httpsCallableData(this.functions, 'userLogout')();
  }
}