// On utilise les liens complets (CDN) car ton navigateur ne connaît pas "firebase/app" tout seul
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw95fNMUjwUKIqpwsaNQsGsxI5uGjYMVo",
  authDomain: "portfolio-youcef.firebaseapp.com",
  projectId: "portfolio-youcef",
  storageBucket: "portfolio-youcef.firebasestorage.app",
  messagingSenderId: "716256395408",
  appId: "1:716256395408:web:cd609e884c8066381f1815",
  measurementId: "G-80ZLGQMN00"
};

const app = initializeApp(firebaseConfig);
// On exporte "db" pour que ton fichier details.js puisse s'en servir
export const db = getFirestore(app);