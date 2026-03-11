import { db } from "../firebase-config.js";
import { collection, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export function listarArtigosRecentes(quantidadeLimite, callback) {
    let q = query(collection(db, "blog"), orderBy("data", "desc"));
    if (quantidadeLimite) {
        q = query(collection(db, "blog"), orderBy("data", "desc"), limit(quantidadeLimite));
    }
    return onSnapshot(q, callback);
}