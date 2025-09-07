import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// You'll need to replace these with your actual Firebase project config
// Or use environment variables (recommended for production)
const firebaseConfig = {
  apiKey: "AIzaSyBMIG00yYePrnYmn2yFs2flG-gYFhBa_FY",
  authDomain: "trade-journals-36cb6.firebaseapp.com",
  projectId: "trade-journals-36cb6",
  storageBucket: "trade-journals-36cb6.firebasestorage.app",
  messagingSenderId: "163402422172",
  appId: "1:163402422172:web:e5b36199a3ae8627459a59",
  measurementId: "G-N8WHZY8LW1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
