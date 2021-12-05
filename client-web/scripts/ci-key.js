const fs = require('fs');
const path = require('path');

(function () {
  const prodKeyFile = 'src/keys/prod.ts';

  /**
   * Configurations loaded from environment variable
   */
  const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
  const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN;
  const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
  const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;
  const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID;

  try {
    const content = `
import { IProjectKeys } from ".";

export const firebaseProdConfig: IProjectKeys = {
  apiKey: "${FIREBASE_API_KEY}",
  authDomain: "${FIREBASE_AUTH_DOMAIN}",
  databaseURL: "${FIREBASE_DATABASE_URL}",
  projectId: "${FIREBASE_PROJECT_ID}",
  storageBucket: "${FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${FIREBASE_APP_ID}",
  measurementId: "${FIREBASE_MEASUREMENT_ID}"
};
    
    `;

    fs.writeFileSync(prodKeyFile, content);
    console.log('Prod keys has been successfully populated.');
  }
  catch(error) {
    console.error(error);
    process.exit(1);
  }

  // apiKey: "AIzaSyBRmGqXX-5FjKIUNb7iooi64AFqIW53u1I",
  // authDomain: "money-workspace-2022.firebaseapp.com",
  // databaseURL: "https://money-workspace-2022-default-rtdb.asia-southeast1.firebasedatabase.app",
  // projectId: "money-workspace-2022",
  // storageBucket: "money-workspace-2022.appspot.com",
  // messagingSenderId: "904959709013",
  // appId: "1:904959709013:web:9cc6ba9c2d0304d41729dc",
  // measurementId: "G-Z7YR7RN1PL"
})();