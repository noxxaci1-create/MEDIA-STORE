import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBWynXuzXoDiYuTwCLUGjHb-AuMBWAzGjQ",
  authDomain: "web-nokosgur.firebaseapp.com",
  projectId: "web-nokosgur",
  storageBucket: "web-nokosgur.firebasestorage.app",
  messagingSenderId: "777703420525",
  appId: "1:777703420525:web:32b142070a5645a9d48564"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;