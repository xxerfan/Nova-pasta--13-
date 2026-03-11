import { db } from "../firebase-config.js";
import { collection, onSnapshot, query, where, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Função para buscar TODOS os serviços ativos (usado na página de Serviços)
export function listarServicosAtivos(callback) {
    const q = query(collection(db, "servicos"), where("status", "==", "ativo"));
    return onSnapshot(q, callback);
}

// Função para buscar apenas os 3 serviços de destaque (usado na Home)
export function listarServicosDestaque(quantidade, callback) {
    const q = query(collection(db, "servicos"), where("status", "==", "ativo"), limit(quantidade));
    return onSnapshot(q, callback);
}