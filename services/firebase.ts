// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// IMPORTANT: Replace the following with your app's Firebase project configuration
// For more information on how to get this, visit: https://firebase.google.com/docs/web/setup#get-config
const firebaseConfig = {
  apiKey: "AIzaSyDfBJS1Ayp6D2RI4p2BFUk-X5hPqFYbhe8",
  authDomain: "nolan-diagram.firebaseapp.com",
  projectId: "nolan-diagram",
  storageBucket: "nolan-diagram.firebasestorage.app",
  messagingSenderId: "574344954823",
  appId: "1:574344954823:web:aff51e7641d44ed68c0fe2",
  measurementId: "G-Z7LQHX3CK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a Firestore instance
export const db = getFirestore(app);
// Get an Auth instance
export const auth = getAuth(app);
