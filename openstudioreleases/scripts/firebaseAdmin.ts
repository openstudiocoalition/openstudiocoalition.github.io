import { cert } from 'firebase-admin/app';
import * as firebaseAdmin from 'firebase-admin';
// move this to .env
import serviceAccount from '../firebase-admin-test-project.json';
import * as admin from 'firebase-admin';

firebaseAdmin.initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'gs://testproject-c3dda.appspot.com',
});

export const firebaseBucket = admin.storage().bucket();

export {
  firebaseAdmin,
}