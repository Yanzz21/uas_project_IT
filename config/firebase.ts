// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYqgvm2B0FkJ06ncvMjaXPdCJCjToTN1E",
  authDomain: "uas-web-7a62d.firebaseapp.com",
  projectId: "uas-web-7a62d",
  storageBucket: "uas-web-7a62d.firebasestorage.app",
  messagingSenderId: "224673832332",
  appId: "1:224673832332:web:888c0bd0255db6e5884aa9",
  measurementId: "G-XLKEW4ZDWN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
