import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8fyr56RXVywjqa-DfkyHidCASaWthScc",
  authDomain: "aviator-8dc06.firebaseapp.com",
  projectId: "aviator-8dc06",
  storageBucket: "aviator-8dc06.appspot.com",
  messagingSenderId: "19003104016",
  appId: "1:19003104016:web:61d4bdb7e94bb55b786395",
  measurementId: "G-74H5GW36Z5"
};

let app: FirebaseApp;
let analytics: Analytics;
let auth: Auth;
let db: Firestore;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { app, analytics, auth, db }; 