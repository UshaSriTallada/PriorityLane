import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Hooks and providers
import { useUser } from './auth/use-user';
import { FirebaseProvider } from './provider';
import { FirebaseClientProvider } from './client-provider';


let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}

// Export hooks and providers
export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useUser
};
