import { db } from "../firebase-config.js";
import { collection, onSnapshot, query, where, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export function listarProdutosAtivos(quantidadeLimite, callback) {
    let q = query(collection(db, "produtos"), where("status", "==", "ativo"));
    if (quantidadeLimite) {
        q = query(collection(db, "produtos"), where("status", "==", "ativo"), limit(quantidadeLimite));
    }
    return onSnapshot(q, callback);
}