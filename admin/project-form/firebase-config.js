// 1. IMPORTATIONS DES SERVICES DE BASE DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ➕ AJOUT : On importe le module d'authentification Firebase via CDN
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. VOS CLÉS DE CONFIGURATION INITIALES
const firebaseConfig = {
  apiKey: "AIzaSyDw95fNMUjwUKIqpwsaNQsGsxI5uGjYMVo",
  authDomain: "portfolio-youcef.firebaseapp.com",
  projectId: "portfolio-youcef",
  storageBucket: "portfolio-youcef.firebasestorage.app",
  messagingSenderId: "716256395408",
  appId: "1:716256395408:web:cd609e884c8066381f1815",
  measurementId: "G-80ZLGQMN00"
};

// 3. INITIALISATION DE L'APPLICATION FIREBASE
const app = initializeApp(firebaseConfig);

// 4. INITIALISATION DES SERVICES (FIRESTORE ET AUTH)
const db = getFirestore(app);
// ➕ AJOUT : Initialisation de l'outil d'authentification pour votre projet
const auth = getAuth(app);

// 5. EXPORTATION DES SERVICES
// 🔄 MODIFICATION : On exporte "db" (pour vos projets) ET "auth" (pour la page de connexion)
export { db, auth };