// firebase-config.js
// Firebase configuration
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
firebase.initializeApp(firebaseConfig);

// Initialize Services
const db = firebase.firestore();
const storage = firebase.storage();
