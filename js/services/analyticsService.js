import { db } from "../firebase-config.js";
import { doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export function registrarVisitaSite() {
    try {
        const statsRef = doc(db, "analytics", "geral");
        setDoc(statsRef, { views: increment(1) }, { merge: true });
    } catch(e) {
        console.warn("Erro ao contar visita.", e);
    }
}