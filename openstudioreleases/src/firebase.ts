import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCWKeYYj4JL-998jUeUDAShPluEmvCqrNg",
  authDomain: "testproject-c3dda.firebaseapp.com",
  projectId: "testproject-c3dda",
  storageBucket: "testproject-c3dda.appspot.com",
  messagingSenderId: "324206416101",
  appId: "1:324206416101:web:7642a70ecc4af7cf54440c",
  measurementId: "G-GD1G371C2J"
};

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseAnalytics = getAnalytics(firebaseApp);