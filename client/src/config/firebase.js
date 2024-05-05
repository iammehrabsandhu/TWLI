// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBlPF8enfCLyjAA7oZvS24NT7h_DBC68IY",
  authDomain: "this-world-of-mine.firebaseapp.com",
  databaseURL: "https://this-world-of-mine-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "this-world-of-mine",
  storageBucket: "this-world-of-mine.appspot.com",
  messagingSenderId: "525542354809",
  appId: "1:525542354809:web:f2df0ea6551f36c68189a8"
};

// Initialize Firebase
 const app = initializeApp(firebaseConfig);
