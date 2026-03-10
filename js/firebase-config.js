// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Exportamos o 'db' para que as outras páginas possam usá-lo facilmente
export { app, db };