// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCpxfzPrj1DJpcv-bHsVtR1Y7NSVN3KRTI",
    authDomain: "xerfan-tech-lab.firebaseapp.com",
    projectId: "xerfan-tech-lab",
    storageBucket: "xerfan-tech-lab.firebasestorage.app",
    messagingSenderId: "931331197336",
    appId: "1:931331197336:web:ca2550d7d10da44fbb43ed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportamos app, db e auth para o painel admin usar
export { app, db, auth };