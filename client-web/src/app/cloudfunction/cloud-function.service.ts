import { Injectable } from "@angular/core";
import { Functions, httpsCallableData } from '@angular/fire/functions';

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