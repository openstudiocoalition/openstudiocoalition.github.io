import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

import firebaseConfig from '../firebase-config.json';
// import { firebaseConfig } from './firebaseConfig';

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseAnalytics = getAnalytics(firebaseApp);

export const githubProvider = new GithubAuthProvider()
// githubProvider.addScope('repo');