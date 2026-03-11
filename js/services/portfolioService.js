import { db } from "../firebase-config.js";
import { collection, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export function listarPortfolioRecente(quantidadeLimite, callback) {
    let q = query(collection(db, "portfolio"), orderBy("data_cadastro", "desc"));
    if (quantidadeLimite) {
        q = query(collection(db, "portfolio"), orderBy("data_cadastro", "desc"), limit(quantidadeLimite));
    }
    return onSnapshot(q, callback);
}