import { environment } from "src/environments/environment"
import { firebaseConfig } from "./dev"
import { firebaseProdConfig } from "./prod";

export const firebaseKeys = () => {
  if (environment.production) {
    return {
      ...firebaseProdConfig
    };
  } 
  else {
    return {
      ...firebaseConfig
    }
  }
}

export interface IProjectKeys {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}