import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3jlWHo3sz1nZ3nShiEyjQybC1BESHtcU",
  authDomain: "vitalarc-968fa.firebaseapp.com",
  projectId: "vitalarc-968fa",
  storageBucket: "vitalarc-968fa.firebasestorage.app",
  messagingSenderId: "1049067873633",
  appId: "1:1049067873633:web:c0defbe7aab93558375120"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
