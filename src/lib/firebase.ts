import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtqJfGuG5UGUqye1wygn6Q26pX8mlaJjg",
  authDomain: "tutor-36ee7.firebaseapp.com",
  projectId: "tutor-36ee7",
  storageBucket: "tutor-36ee7.firebasestorage.app",
  messagingSenderId: "848084214658",
  appId: "1:848084214658:web:cf80100245bc786c7ee59b",
  measurementId: "G-856H1GDJWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
