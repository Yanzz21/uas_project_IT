import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYqgvm2B0FkJ06ncvMjaXPdCJCjToTN1E",
  authDomain: "uas-web-7a62d.firebaseapp.com",
  projectId: "uas-web-7a62d",
  storageBucket: "uas-web-7a62d.firebasestorage.app",
  messagingSenderId: "224673832332",
  appId: "1:224673832332:web:888c0bd0255db6e5884aa9",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;