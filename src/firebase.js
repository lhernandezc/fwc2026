import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVzKP0EwJ9-TyvEoeQFrKmMIv9efprLDQ",
  authDomain: "myfwc26.firebaseapp.com",
  databaseURL: "https://myfwc26-default-rtdb.firebaseio.com",
  projectId: "myfwc26",
  storageBucket: "myfwc26.firebasestorage.app",
  messagingSenderId: "558755007029",
  appId: "1:558755007029:web:79ad513405525bad393f7c",
  measurementId: "G-BW1934Z2GB"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const ADMIN_EMAIL = "leonardo.hernandez@activa.co.cr";
