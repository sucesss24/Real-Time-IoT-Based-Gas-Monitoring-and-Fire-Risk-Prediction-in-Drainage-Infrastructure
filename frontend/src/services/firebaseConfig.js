// frontend/src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace these values with your **Firebase Web App config**
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mq-135-a4442.firebaseapp.com",
  databaseURL: "https://mq-135-a4442-default-rtdb.firebaseio.com",
  projectId: "mq-135-a4442",
  storageBucket: "mq-135-a4442.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);