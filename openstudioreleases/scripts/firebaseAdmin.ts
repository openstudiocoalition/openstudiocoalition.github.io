import { cert } from 'firebase-admin/app';
import * as firebaseAdmin from 'firebase-admin';

import firebaseConfig from '../firebase-config.json';
import serviceAccount from '../firebase-service-account.json';
import * as admin from 'firebase-admin';

firebaseAdmin.initializeApp({
  credential: cert(serviceAccount),
  storageBucket: firebaseConfig.storageBucket,
});

export const firebaseBucket = admin.storage().bucket();

export {
  firebaseAdmin,
}