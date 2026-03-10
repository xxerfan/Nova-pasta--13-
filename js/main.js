/**
 * ============================================================
 * Xerfan Tech Lab - main.js v4.1 (MOBILE OPTIMIZED + SCROLL FIX)
 * Sistema completo de funcionalidades do site
 * ============================================================
 */

'use strict';

// ============================================================
// 1. CARREGAMENTO DE COMPONENTES E FEATURE TOGGLE (MODO MANUTENÇÃO)
// ============================================================
function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return Promise.resolve();

    return fetch(componentPath)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${componentPath}`);
            return res.text();
        })
        .then(html => {
            element.innerHTML = html;
            element.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                    newScript.async = false;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.head.appendChild(newScript);
                if (!oldScript.src) document.head.removeChild(newScript);
            });
            
            if (elementId === 'header') {
                aplicarTravasVisibilidade();
            }

            window.dispatchEvent(new CustomEvent(`${elementId}Loaded`, { detail: { path: componentPath } }));
        })
        .catch(err => console.warn(`Componente não encontrado: ${componentPath}`, err));
}

async function aplicarTravasVisibilidade() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
        const { getFirestore, doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        
        // 1. Puxamos a configuração do nosso novo arquivo central (que está na mesma pasta js/)
        const { app } = await import("./firebase-config.js");

        // 2. Iniciamos o appToggle usando as opções (chaves) que vieram do arquivo central
        const appToggle = initializeApp(app.options, "XerfanToggleApp");
        const dbToggle = getFirestore(appToggle);

        onSnapshot(doc(dbToggle, "settings", "paginas"), (snap) => {
            if (snap.exists()) {
                const status = snap.data();
                const modulos = ['produtos', 'servicos', 'portfolio', 'blog'];
                
                modulos.forEach(modulo => {
                    const ativo = status[`${modulo}_active`] ?? true;
                    
                    const links = document.querySelectorAll(`.nav-link-${modulo}`);
                    links.forEach(link => { link.style.display = ativo ? '' : 'none'; });
                    
                    const secaoHome = document.getElementById(`secao-${modulo}`);
                    if (secaoHome) { secaoHome.style.display = ativo ? '' : 'none'; }
                    
                    const pathAtual = window.location.pathname.toLowerCase();
                    if (pathAtual.includes(`/${modulo}.html`) && !ativo) {
                        window.location.href = 'index.html';
                    }
                });
            }
        });
    } catch (e) {
        console.error("Erro ao inicializar travas de visibilidade:", e);
    }
}

// ============================================================
// 2. SISTEMA DE NOTIFICAÇÕES (Toast)
// ============================================================
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3500) {
    document.querySelectorAll(`.notification.${tipo}`).forEach(n => n.remove());

    const icons = {
        success: 'fa-check-circle',
        error:   'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info:    'fa-info-circle'
    };

    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    notif.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icons[tipo] || icons.info} text-lg flex-shrink-0"></i>
            <span class="flex-1 text-sm">${mensagem}</span>
            <button onclick="this.closest('.notification').remove()" class="text-white/70 hover:text-white ml-2 flex-shrink-0 transition-colors">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notif);
    requestAnimationFrame(() => requestAnimationFrame(() => notif.classList.add('show')));

    const timer = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    }, duracao);

    notif.querySelector('button').addEventListener('click', () => clearTimeout(timer));
    return notif;
}

// ============================================================
// 3. BARRA DE PROGRESSO DE LEITURA
// ============================================================
function initProgressBar() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const doc = document.documentElement;
                const winH = doc.clientHeight;
                const docH = Math.max(doc.scrollHeight, document.body.scrollHeight) - winH;
                bar.style.width = Math.min((doc.scrollTop || document.body.scrollTop) / docH * 100, 100) + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ============================================================
// 4. ANIMAÇÃO DE CONTADORES
// ============================================================
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.counter, 10);
                const suffix = el.dataset.suffix || '';
                const duration = 2000;
                let start = null;

                const step = timestamp => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    const current = Math.floor((1 - Math.pow(1 - progress, 3)) * target);
                    el.textContent = current + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target + suffix;
                };
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ============================================================
// 5. EFEITO DE DIGITAÇÃO (TYPEWRITER)
// ============================================================
class TypeWriter {
    constructor(el, textos) {
        this.el = el;
        this.textos = textos;
        this.index = 0;
        this.char = 0;
        this.modo = 'escrever';
        this.loop();
    }
    loop() {
        const texto = this.textos[this.index];
        if (this.modo === 'escrever') {
            this.el.textContent = texto.slice(0, ++this.char);
            if (this.char === texto.length) {
                this.modo = 'pausar';
                setTimeout(() => { this.modo = 'apagar'; this.loop(); }, 2500);
            } else {
                setTimeout(() => this.loop(), 40 + Math.random() * 20);
            }
        } else if (this.modo === 'apagar') {
            this.el.textContent = texto.slice(0, --this.char);
            if (this.char === 0) {
                this.modo = 'escrever';
                this.index = (this.index + 1) % this.textos.length;
                setTimeout(() => this.loop(), 400);
            } else {
                setTimeout(() => this.loop(), 25);
            }
        }
    }
}
function initHeroTypewriter() {
    const el = document.getElementById('hero-texto-animado');
    if (el) new TypeWriter(el, [
        'Transforme seu negócio com tecnologia de ponta',
        'Automação inteligente para casa e empresa',
        'Desenvolvimento web moderno e responsivo',
        'Manutenção especializada com garantia',
        'Infraestrutura de TI segura e confiável'
    ]);
}

// ============================================================
// 6. REVELAÇÃO NO SCROLL (CORREÇÃO: Esta função estava em falta!)
// ============================================================
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed'); // A classe mágica que faz os elementos aparecerem!
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    
    // Procura por elementos com [data-reveal] ou cartões da Home
    document.querySelectorAll('[data-reveal], .stagger-children').forEach(el => observer.observe(el));
}

// ============================================================
// 7. MÁSCARA DE TELEFONE (Brasil)
// ============================================================
function aplicarMascaraTelefone(input) {
    if (!input) return;
    input.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (v.length > 10) { v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); } 
        else if (v.length > 6) { v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); } 
        else if (v.length > 2) { v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2'); } 
        else if (v.length > 0) { v = v.replace(/^(\d{0,2})/, '($1'); }
        e.target.value = v;
    });
}

// ============================================================
// 8. CHATBOT FLUTUANTE (MOBILE RESPONSIVE FIX)
// ============================================================
class FloatingChatBot {
    constructor() {
        this.isOpen = false;
        this.knowledge = [
            { keywords: ['manutencao', 'computador', 'notebook', 'pc', 'conserto', 'reparo', 'formatacao', 'lento'], response: '💻 <strong>Manutenção de Computadores</strong><br>Fazemos diagnóstico, limpeza, formatação e troca de peças. Atendemos Niterói! O prazo médio é de 24h a 48h. Deseja <a href="agendamento.html" class="underline text-blue-400">agendar uma visita</a>?' },
            { keywords: ['automacao', 'automação', 'casa inteligente', 'smart', 'iluminacao', 'cortina'], response: '🏠 <strong>Automação Residencial</strong><br>Transformamos sua casa num lar inteligente! Controlamos iluminação, câmeras e mais pelo celular. Temos soluções a partir de R$500.' },
            { keywords: ['site', 'website', 'desenvolvimento', 'web', 'sistema', 'loja virtual'], response: '🌐 <strong>Desenvolvimento Web</strong><br>Criamos sites profissionais e sistemas de alto desempenho. Solicite um orçamento!' },
            { keywords: ['contato', 'telefone', 'whatsapp', 'email', 'endereco'], response: '📞 <strong>Nossos Contatos</strong><br>WhatsApp/Tel: (21) 99999-9999<br>Email: contato@xerfantechlab.com.br<br>Localização: Niterói, RJ.' },
            { keywords: ['preco', 'preço', 'valor', 'quanto', 'custo', 'orcamento'], response: '💰 <strong>Orçamentos</strong><br>Os valores dependem do projeto, mas oferecemos orçamento gratuito! Fale direto conosco pelo WhatsApp no (21) 99999-9999.' }
        ];
        this.defaultResponses = [
            'Posso ajudar com manutenção, automação, desenvolvimento web ou suporte. O que procura? 😊',
            'Legal! Para te dar a melhor resposta, escolha uma das opções acima ou detalhe um pouco mais. 🤔',
            'Para um atendimento mais rápido e personalizado, me chame no WhatsApp: (21) 99999-9999! 📱'
        ];
        this.idx = 0;
        this.init();
    }

    init() {
        this.renderWidget();
        this.bindEvents();
    }

    renderWidget() {
        const div = document.createElement('div');
        div.id = 'chat-widget';
        div.innerHTML = `
            <button id="chat-toggle-btn" class="fixed bottom-24 right-6 md:left-6 md:right-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-orange-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center">
                <i class="fas fa-comments text-xl" id="chat-icon"></i>
            </button>
            
            <div id="chat-window" class="hidden fixed bottom-44 right-4 left-4 md:left-6 md:right-auto md:w-[340px] max-h-[70vh] bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col z-50 overflow-hidden">
                
                <div class="bg-gradient-to-r from-blue-600 to-orange-500 px-5 py-4 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><i class="fas fa-robot text-lg text-white"></i></div>
                        <div><p class="font-bold text-white text-sm">Assistente XTL</p><p class="text-blue-100 text-xs">Online agora</p></div>
                    </div>
                    <button id="chat-close-btn" class="text-white/70 hover:text-white p-2"><i class="fas fa-times"></i></button>
                </div>
                
                <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
                    <div class="flex items-start gap-2">
                        <div class="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mt-0.5"><i class="fas fa-robot"></i></div>
                        <div class="bg-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] text-xs text-gray-200">
                            Olá! 👋 Sou o assistente virtual da Xerfan Tech Lab. Como posso ajudar?
                        </div>
                    </div>
                    <div id="quick-actions" class="flex flex-wrap gap-1.5 mt-2">
                        <button class="qa-btn text-xs px-2.5 py-1.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800">Manutenção</button>
                        <button class="qa-btn text-xs px-2.5 py-1.5 bg-orange-900/30 text-orange-400 rounded-full border border-orange-800">Automação</button>
                    </div>
                </div>
                
                <div class="p-3 border-t border-gray-700 bg-gray-800 shrink-0">
                    <div class="flex gap-2">
                        <input type="text" id="chat-input" placeholder="Digite aqui..." class="flex-1 px-3 py-2 bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-white">
                        <button id="chat-send-btn" class="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0"><i class="fas fa-paper-plane text-xs"></i></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    bindEvents() {
        document.getElementById('chat-toggle-btn').addEventListener('click', () => this.isOpen ? this.close() : this.open());
        document.getElementById('chat-close-btn').addEventListener('click', () => this.close());
        document.getElementById('chat-send-btn').addEventListener('click', () => this.send());
        document.getElementById('chat-input').addEventListener('keypress', e => { if(e.key === 'Enter') this.send(); });
        document.querySelectorAll('.qa-btn').forEach(b => b.addEventListener('click', () => {
            this.addMessage(b.textContent, 'user');
            document.getElementById('quick-actions')?.remove();
            this.reply(b.textContent);
        }));
    }

    open() {
        document.getElementById('chat-window').classList.remove('hidden');
        document.getElementById('chat-icon').className = 'fas fa-times text-xl';
        this.isOpen = true;
        setTimeout(() => document.getElementById('chat-input').focus(), 100);
    }
    
    close() {
        document.getElementById('chat-window').classList.add('hidden');
        document.getElementById('chat-icon').className = 'fas fa-comments text-xl';
        this.isOpen = false;
    }
    
    addMessage(text, sender) {
        const c = document.getElementById('chat-messages');
        const d = document.createElement('div');
        d.className = `flex items-start gap-2 ${sender === 'user' ? 'flex-row-reverse' : ''}`;
        d.innerHTML = sender === 'user' 
            ? `<div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs max-w-[85%]">${text}</div>`
            : `<div class="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mt-0.5 flex-shrink-0"><i class="fas fa-robot"></i></div>
               <div class="bg-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-gray-200 max-w-[85%] leading-relaxed">${text}</div>`;
        c.appendChild(d);
        c.scrollTop = c.scrollHeight;
    }

    send() {
        const i = document.getElementById('chat-input');
        const v = i.value.trim();
        if(!v) return;
        this.addMessage(v, 'user');
        i.value = '';
        document.getElementById('quick-actions')?.remove();
        
        const c = document.getElementById('chat-messages');
        
        const existingTyping = document.getElementById('chat-typing');
        if (existingTyping) existingTyping.remove();
        
        const typ = document.createElement('div');
        typ.id = 'chat-typing';
        typ.innerHTML = `<div class="bg-gray-700 rounded-2xl px-3 py-2 text-xs text-gray-500 ml-9 w-fit">Digitando...</div>`;
        c.appendChild(typ);
        c.scrollTop = c.scrollHeight;
        
        setTimeout(() => {
            const typToRemove = document.getElementById('chat-typing');
            if(typToRemove) typToRemove.remove();
            this.reply(v);
        }, 800 + Math.random() * 500);
    }

    reply(msg) {
        const lower = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let ans = this.knowledge.find(k => k.keywords.some(w => lower.includes(w)))?.response;
        if(!ans) { ans = this.defaultResponses[this.idx % this.defaultResponses.length]; this.idx++; }
        this.addMessage(ans, 'bot');
    }
}

// ============================================================
// 9. BANNER DE COOKIES (LGPD)
// ============================================================
function initCookieConsent() {
    if (localStorage.getItem('cookieConsent')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-5 z-[9999] transform translate-y-full opacity-0 transition-all duration-500';
    
    banner.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl mt-1">🍪</div>
            <div>
                <h4 class="text-sm font-bold text-white mb-1">Nós usamos cookies</h4>
                <p class="text-xs text-gray-300 mb-3 leading-relaxed">
                    Utilizamos cookies para melhorar a sua experiência e analisar o tráfego do site. Ao continuar, você concorda com a nossa política.
                </p>
                <div class="flex gap-2">
                    <button id="accept-cookies" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-md">Aceitar Todos</button>
                    <button id="reject-cookies" class="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-2 px-4 rounded-lg transition-colors">Recusar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.remove('translate-y-full', 'opacity-0'));

    document.getElementById('accept-cookies').addEventListener('click', () => { localStorage.setItem('cookieConsent', 'accepted'); closeBanner(banner); });
    document.getElementById('reject-cookies').addEventListener('click', () => { localStorage.setItem('cookieConsent', 'rejected'); closeBanner(banner); });

    function closeBanner(el) {
        el.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => el.remove(), 500);
    }
}

// ============================================================
// 10. INICIALIZAÇÃO GERAL (TODAS AS FUNÇÕES CARREGAM AQUI)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadComponent === 'function') {
        Promise.all([
            loadComponent('header', 'components/header.html'),
            loadComponent('footer', 'components/footer.html')
        ]).then(() => {
            if (typeof aplicarTravasVisibilidade === 'function') { aplicarTravasVisibilidade(); }
        });
    }

    initProgressBar();
    initCounters();
    initHeroTypewriter();
    initScrollReveal(); // <--- A FUNÇÃO RESTAURADA QUE TRAZ OS CARTÕES DE VOLTA!
    
    document.querySelectorAll('[name="telefone"]').forEach(aplicarMascaraTelefone);
    
    if (!window.location.pathname.includes('chatbot') && !window.location.pathname.includes('admin')) {
        new FloatingChatBot();
    }
    
    setTimeout(initCookieConsent, 1500);
});

// Sistema de Notificações Premium (Toast)
function mostrarNotificacao(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-10 right-10 z-[9999] flex items-center p-4 mb-4 w-full max-w-xs rounded-2xl shadow-2xl transform transition-all duration-500 translate-y-[-100px] opacity-0 ${
        tipo === 'success' ? 'bg-gray-900 border border-green-500/50 text-white' : 'bg-gray-900 border border-red-500/50 text-white'
    }`;

    const icon = tipo === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500';
    
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-gray-800 rounded-lg">
            <i class="fas ${icon}"></i>
        </div>
        <div class="ml-3 text-sm font-bold">${mensagem}</div>
    `;

    document.body.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
        toast.classList.remove('translate-y-[-100px]', 'opacity-0');
    }, 100);

    // Auto-destruição após 4 segundos
    setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

window.mostrarNotificacao = mostrarNotificacao;