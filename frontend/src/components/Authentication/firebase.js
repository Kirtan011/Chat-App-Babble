// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6hv4zWUjHUEoU_c7hN6fUsYW87PIGMYI",
  authDomain: "chat-app-babble.firebaseapp.com",
  projectId: "chat-app-babble",
  storageBucket: "chat-app-babble.firebasestorage.app",
  appId: "1:839772733639:web:fb5e2d56553001cc423ee2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
