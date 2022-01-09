const fs = require('fs');
const path = require('path');

(function () {
  const devKeyFile = 'src/keys/dev.ts';
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
    fs.writeFileSync(prodKeyFile, getFirebaseConfig());
    fs.writeFileSync(devKeyFile, getFirebaseConfig(true));

    let maskedDomain = FIREBASE_AUTH_DOMAIN || '';
    console.log('Prod keys has been successfully populated: debug message: ', maskedDomain.substring(0, 3));
  }
  catch(error) {
    console.error(error);
    process.exit(1);
  }

  function getFirebaseConfig(dev) {
    return `
import { IProjectKeys } from ".";
    
export const ${dev ? 'firebaseConfig' : 'firebaseProdConfig'}: IProjectKeys = {
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
  }
})();