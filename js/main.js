/**
 * ============================================================
 * Xerfan Tech Lab - main.js v15.0 (REST COM API KEY + WPP INFALÍVEL)
 * ============================================================
 */

'use strict';

// 1. CARREGAMENTO DE COMPONENTES
function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return Promise.resolve();

    return fetch(componentPath)
        .then(res => res.text())
        .then(html => {
            element.innerHTML = html;
            
            if (elementId === 'header') {
                initHeaderLogic();
                aplicarTravasVisibilidade();
                // Inicia o chatbot SEMPRE que o header carregar (apenas fora do admin)
                if (!window.location.pathname.includes('admin')) {
                    new XerfanSmartBot();
                }
            }
        })
        .catch(err => console.warn(`Erro no componente: ${componentPath}`, err));
}

// 2. LÓGICA DO HEADER
function initHeaderLogic() {
    const header = document.getElementById('main-header');
    const navWrapper = document.getElementById('nav-wrapper');
    const backTop = document.getElementById('back-to-top');
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        if (scrollY > 60) {
            header?.classList.add('scrolled');
            navWrapper?.classList.add('py-0', 'bg-gray-900/95', 'shadow-md');
        } else {
            header?.classList.remove('scrolled');
            navWrapper?.classList.remove('py-0', 'bg-gray-900/95', 'shadow-md');
        }

        if (backTop) {
            if (scrollY > 400) {
                backTop.classList.remove('opacity-0', 'invisible');
                backTop.classList.add('opacity-100', 'visible');
            } else {
                backTop.classList.add('opacity-0', 'invisible');
                backTop.classList.remove('opacity-100', 'visible');
            }
        }
    }, { passive: true });

    backTop?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let menuOpen = false;
    mobileBtn?.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
            mobileMenu?.classList.remove('hidden');
            if (menuIcon) menuIcon.className = 'fas fa-times text-base text-orange-500';
        } else {
            mobileMenu?.classList.add('hidden');
            if (menuIcon) menuIcon.className = 'fas fa-bars text-base';
        }
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item-pro[data-page], .mobile-nav-item[data-page]').forEach(l => {
        if (l.getAttribute('data-page') === currentPage) l.classList.add('active');
    });
}

// 3. TRAVAS DE ADMIN
async function aplicarTravasVisibilidade() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
        const { getFirestore, doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        const { app } = await import("./firebase-config.js");
        const dbToggle = getFirestore(initializeApp(app.options, "XerfanToggleApp"));

        onSnapshot(doc(dbToggle, "settings", "paginas"), (snap) => {
            if (snap.exists()) {
                const status = snap.data();
                ['produtos', 'servicos', 'portfolio', 'blog'].forEach(modulo => {
                    const ativo = status[`${modulo}_active`] ?? true;
                    document.querySelectorAll(`.nav-link-${modulo}`).forEach(l => l.style.display = ativo ? '' : 'none');
                    const secaoHome = document.getElementById(`secao-${modulo}`);
                    if (secaoHome) secaoHome.style.display = ativo ? '' : 'none';
                });
            }
        });
    } catch (e) { console.log("Travas não carregadas (normal se deslogado)"); }
}

// 4. UTILITÁRIOS
function initCounters() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target, target = parseInt(el.dataset.counter, 10), suffix = el.dataset.suffix || '';
                let start = null;
                const step = ts => {
                    if (!start) start = ts;
                    const progress = Math.min((ts - start) / 2000, 1);
                    el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target) + suffix;
                    if (progress < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
                };
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-counter]').forEach(c => observer.observe(c));
}

class TypeWriter {
    constructor(el, textos) { this.el = el; this.textos = textos; this.index = 0; this.char = 0; this.modo = 'escrever'; this.loop(); }
    loop() {
        const txt = this.textos[this.index];
        if (this.modo === 'escrever') {
            this.el.textContent = txt.slice(0, ++this.char);
            if (this.char === txt.length) { this.modo = 'pausar'; setTimeout(() => { this.modo = 'apagar'; this.loop(); }, 2500); } 
            else setTimeout(() => this.loop(), 40 + Math.random() * 20);
        } else if (this.modo === 'apagar') {
            this.el.textContent = txt.slice(0, --this.char);
            if (this.char === 0) { this.modo = 'escrever'; this.index = (this.index + 1) % this.textos.length; setTimeout(() => this.loop(), 400); } 
            else setTimeout(() => this.loop(), 25);
        }
    }
}

function initHeroTypewriter() {
    const el = document.getElementById('hero-texto-animado');
    if (el) new TypeWriter(el, ['Transforme seu negócio com tecnologia', 'Automação inteligente', 'Desenvolvimento Web Profissional']);
}

function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal], .stagger-children').forEach(el => observer.observe(el));
}

// 5. CHATBOT INTELIGENTE COM FIREBASE REST API
class XerfanSmartBot {
    constructor() {
        this.isOpen = false;
        this.step = 0; 
        this.lead = { detalhes: '', nome: '', local: '' };
        document.querySelectorAll('#xtl-bot-window-root').forEach(el => el.remove());
        this.init();
    }

    init() {
        this.renderChatWindow();
        this.bindEvents();
        setTimeout(() => this.appendBot('Olá! 👋 Como posso ajudar você hoje?'), 1000);
    }

    renderChatWindow() {
        const div = document.createElement('div');
        div.id = 'xtl-bot-window-root';
        div.innerHTML = `
            <style>
                #xtl-bot-window { transform-origin: bottom right; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 2000; }
                .chat-bubble-user { background: linear-gradient(135deg, #25D366, #128C7E); color: white; margin-left: auto; border-radius: 1rem 1rem 0 1rem; padding: 0.6rem 1rem; max-width: 85%; font-size: 0.85rem; margin-bottom: 8px;}
                .chat-bubble-bot { background-color: #1f2937; color: #e5e7eb; margin-right: auto; border-radius: 1rem 1rem 1rem 0; padding: 0.6rem 1rem; max-width: 85%; border: 1px solid #374151; font-size: 0.85rem; margin-bottom: 8px; }
            </style>
            <div id="xtl-bot-window" class="fixed bottom-[90px] right-6 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-[320px] sm:w-[340px] overflow-hidden scale-0 opacity-0 pointer-events-none flex flex-col">
                <div class="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-950 rounded-full p-1 border border-gray-700"><img src="img/logo.png" class="w-full h-full object-contain"></div>
                        <h4 class="text-white font-bold text-sm">Suporte XTL</h4>
                    </div>
                    <button id="xtl-bot-close" class="text-gray-400 hover:text-white p-1"><i class="fas fa-times"></i></button>
                </div>
                <div id="xtl-bot-body" class="p-4 bg-[#0b101a] h-[300px] overflow-y-auto flex flex-col relative"></div>
                <div id="xtl-bot-transfer" class="hidden p-3 bg-gray-800 border-t border-gray-700">
                    <button id="xtl-bot-wpp" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-sm transition-colors cursor-pointer">Falar no WhatsApp Agora</button>
                </div>
                <div class="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
                    <input type="text" id="xtl-bot-input" placeholder="Digite aqui..." class="flex-1 bg-gray-800 text-white text-sm border border-gray-700 rounded-xl px-3 py-2 outline-none">
                    <button id="xtl-bot-send" class="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center cursor-pointer"><i class="fas fa-paper-plane text-xs"></i></button>
                </div>
            </div>`;
        document.body.appendChild(div);
    }

    bindEvents() {
        const trigger = document.getElementById('xtl-chat-trigger');
        if (trigger) trigger.addEventListener('click', () => this.toggle());
        document.getElementById('xtl-bot-close').addEventListener('click', () => this.close());
        document.getElementById('xtl-bot-send').addEventListener('click', () => this.handleInput());
        document.getElementById('xtl-bot-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') this.handleInput(); });
        document.getElementById('xtl-bot-wpp').addEventListener('click', () => this.sendToWhatsApp());
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
        const win = document.getElementById('xtl-bot-window');
        win.classList.add('scale-100', 'opacity-100'); win.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
        document.getElementById('xtl-bot-icon').className = 'fas fa-times text-xl';
        const tooltip = document.getElementById('xtl-bot-tooltip');
        if (tooltip) tooltip.style.display = 'none';
        this.isOpen = true;
        setTimeout(() => document.getElementById('xtl-bot-input').focus(), 100);
    }

    close() {
        const win = document.getElementById('xtl-bot-window');
        win.classList.remove('scale-100', 'opacity-100'); win.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
        document.getElementById('xtl-bot-icon').className = 'fab fa-whatsapp';
        const tooltip = document.getElementById('xtl-bot-tooltip');
        if (tooltip) tooltip.style.display = '';
        this.isOpen = false;
    }

    appendUser(text) {
        const body = document.getElementById('xtl-bot-body');
        body.innerHTML += `<div class="chat-bubble-user">${text}</div>`;
        body.scrollTop = body.scrollHeight;
    }

    appendBot(text) {
        const body = document.getElementById('xtl-bot-body');
        setTimeout(() => {
            body.innerHTML += `<div class="chat-bubble-bot">${text}</div>`;
            body.scrollTop = body.scrollHeight;
        }, 600);
    }

    handleInput() {
        const input = document.getElementById('xtl-bot-input');
        const msg = input.value.trim();
        if(!msg) return;
        this.appendUser(msg);
        input.value = '';
        document.getElementById('xtl-bot-transfer').classList.remove('hidden');

        if (this.step === 0) {
            this.lead.detalhes = msg;
            this.appendBot('Entendido! Para te ajudar melhor, qual é o teu nome?');
            this.step = 1;
        } else if (this.step === 1) {
            this.lead.nome = msg;
            this.appendBot(`Prazer, ${msg}! Em qual bairro te encontras?`);
            this.step = 2;
        } else if (this.step === 2) {
            this.lead.local = msg;
            this.appendBot('Tudo pronto! Clica no botão abaixo para falar com o técnico.');
            this.step = 3;
        }
    }

    sendToWhatsApp() {
        const btnWpp = document.getElementById('xtl-bot-wpp');
        if (btnWpp) {
            btnWpp.innerText = "A redirecionar...";
            btnWpp.disabled = true;
        }

        try {
            // 1. SALVAR NO FIREBASE (API REST COM CHAVE - Resolve o Erro 403)
            const apiKey = "AIzaSyCpxfzPrj1DJpcv-bHsVtR1Y7NSVN3KRTI"; // Sua chave real do firebase-config.js
            const projectId = "xerfan-tech-lab";
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/mensagens?key=${apiKey}`;
            
            const dbPayload = {
                fields: {
                    nome: { stringValue: this.lead.nome || "Visitante" },
                    local: { stringValue: this.lead.local || "Não informado" },
                    mensagem: { stringValue: this.lead.detalhes || "Contato via Site" },
                    status: { stringValue: "nova" },
                    origem: { stringValue: "Chatbot do Site" },
                    data: { stringValue: new Date().toISOString() }
                }
            };

            fetch(firestoreUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            }).then(() => console.log("✅ Lead Registado no Admin!")).catch(e => console.error(e));

        } catch(error) {
            console.error(error);
        }

        // 2. ABRIR O WHATSAPP (MÉTODO 100% INFALÍVEL)
        let text = `*SITE XERFAN TECH*%0A👤 *Nome:* ${this.lead.nome}%0A📍 *Local:* ${this.lead.local}%0A📝 *Dúvida:* ${this.lead.detalhes}`;
        const linkWpp = `https://wa.me/5521984197719?text=${text}`;
        
        setTimeout(() => {
            // Tentativa 1: Abrir numa aba nova
            let abaWpp = window.open(linkWpp, '_blank');
            
            // Tentativa 2: Se o bloqueador engoliu a aba nova, força a página atual a ir para o WhatsApp
            if (!abaWpp || abaWpp.closed || typeof abaWpp.closed === 'undefined') {
                window.location.href = linkWpp; 
            }
            
            // Limpeza visual (só ocorre se a página não mudar)
            this.close();
            this.step = 0;
            this.lead = { detalhes: '', nome: '', local: '' };
            const bodyDiv = document.getElementById('xtl-bot-body');
            if(bodyDiv) bodyDiv.innerHTML = '';
            const transferDiv = document.getElementById('xtl-bot-transfer');
            if(transferDiv) transferDiv.classList.add('hidden');
            if (btnWpp) {
                btnWpp.innerText = "Falar no WhatsApp Agora";
                btnWpp.disabled = false;
            }
        }, 150); // Atraso minúsculo para garantir que o fetch iniciou
    }
}

// BOOT
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', 'components/header.html');
    loadComponent('footer', 'components/footer.html');
    initCounters();
    initHeroTypewriter();
    initScrollReveal();
});