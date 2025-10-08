import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// firebase.js

// YAHAN APNA CONFIG PASTE KARO
const firebaseConfig = {
  apiKey: "AIzaSyC-25CvcxzGmFuw3wRg-T9U-eKPuckFw0c",
  authDomain: "fototaker-studio.firebaseapp.com",
  projectId: "fototaker-studio",
  storageBucket: "fototaker-studio.firebasestorage.app",
  messagingSenderId: "401638389477",
  appId: "1:401638389477:web:a8af16d0f9b49bf8dc460c",
  measurementId: "G-W4NT35YBQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;