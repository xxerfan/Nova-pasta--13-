import { db } from "../firebase-config.js";
import { collection, onSnapshot, doc, updateDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Escuta o evento disparado pelo auth.js informando que o admin tem permissão
    window.addEventListener('adminLoggedIn', () => {
        iniciarDash();
    });
    
    // Fallback caso o evento dispare muito rápido
    setTimeout(() => iniciarDash(), 1000);
});

// MOTOR DE DADOS DO DASHBOARD
function iniciarDash() {
    let dashIniciado = false;
    if(dashIniciado) return;
    dashIniciado = true;

    // 1. Total de Visualizações (Analytics)
    onSnapshot(doc(db, "analytics", "geral"), (snap) => { 
        const el = document.getElementById('stat-views');
        if(snap.exists() && el) el.innerText = snap.data().views || 0; 
    });
    
    // 2. Total de Leads / Mensagens
    onSnapshot(collection(db, "mensagens"), (s) => { 
        const el = document.getElementById('stat-leads');
        if(el) el.innerText = s.empty ? "0" : s.size; 
    });

    // 3. Badges (Avisos vermelhos no menu de novas mensagens)
    const qNovasMsg = query(collection(db, "mensagens"), where("status", "==", "nova"));
    onSnapshot(qNovasMsg, (snapshot) => {
        const badge = document.getElementById('badge-novas');
        if(badge) {
            if(!snapshot.empty && snapshot.size > 0) {
                badge.innerText = snapshot.size;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    });
    
    // 4. Somatório do Catálogo (Produtos + Serviços)
    let pSize = 0; let sSize = 0;
    const updateCatalogo = () => {
        const el = document.getElementById('stat-catalogo');
        if(el) el.innerText = pSize + sSize;
    };
    onSnapshot(collection(db, "produtos"), (s) => { pSize = s.empty ? 0 : s.size; updateCatalogo(); });
    onSnapshot(collection(db, "servicos"), (s) => { sSize = s.empty ? 0 : s.size; updateCatalogo(); });

    // 5. Somatório de Conteúdo (Portfólio + Blog)
    let poSize = 0; let blSize = 0;
    const updateConteudo = () => {
        const el = document.getElementById('stat-conteudo');
        if(el) el.innerText = poSize + blSize;
    };
    onSnapshot(collection(db, "portfolio"), (s) => { poSize = s.empty ? 0 : s.size; updateConteudo(); });
    onSnapshot(collection(db, "blog"), (s) => { blSize = s.empty ? 0 : s.size; updateConteudo(); });

    // 6. Toggles (Chaves liga/desliga de páginas)
    const configRef = doc(db, "settings", "paginas");
    onSnapshot(configRef, (snap) => {
        if(snap.exists()){
            const data = snap.data();
            const swProd = document.getElementById('switch-produtos');
            const swServ = document.getElementById('switch-servicos');
            const swPort = document.getElementById('switch-portfolio');
            const swBlog = document.getElementById('switch-blog');

            if(swProd) swProd.checked = data.produtos_active ?? true;
            if(swServ) swServ.checked = data.servicos_active ?? true;
            if(swPort) swPort.checked = data.portfolio_active ?? true;
            if(swBlog) swBlog.checked = data.blog_active ?? true;
        } else {
            setDoc(configRef, { produtos_active: true, servicos_active: true, portfolio_active: true, blog_active: true });
        }
    });

    const atualizarStatus = async (pagina, status) => {
        try { await updateDoc(configRef, { [`${pagina}_active`]: status }); } 
        catch (e) { alert("Erro ao atualizar o status. Verifique permissões."); }
    };

    const bindToggle = (id, pagina) => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', (e) => atualizarStatus(pagina, e.target.checked));
    };

    bindToggle('switch-produtos', 'produtos');
    bindToggle('switch-servicos', 'servicos');
    bindToggle('switch-portfolio', 'portfolio');
    bindToggle('switch-blog', 'blog');
}