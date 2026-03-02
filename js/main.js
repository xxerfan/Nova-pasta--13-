/**
 * Xerfan Tech Lab - Main JavaScript
 * Funcionalidades principais do site
 */

// Configuração do Tailwind para dark mode
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

/**
 * Carrega componentes externos (header, footer, etc.)
 * @param {string} elementId - ID do elemento onde o componente será inserido
 * @param {string} componentPath - Caminho do arquivo do componente
 */
function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${componentPath}: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
            
            // Executa scripts inline do componente
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.head.appendChild(newScript);
                document.head.removeChild(newScript);
            });
            
            // Dispara evento de componente carregado
            window.dispatchEvent(new CustomEvent(`${elementId}Loaded`));
        })
        .catch(error => {
            console.error(`Erro ao carregar componente ${componentPath}:`, error);
            element.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Erro ao carregar componente: ${componentPath}</p>
                </div>
            `;
        });
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        html.classList.add('dark');
        localStorage.theme = 'dark';
    }
    
    // Atualiza ícone do botão
    updateThemeButton();
}

/**
 * Atualiza o ícone do botão de tema
 */
function updateThemeButton() {
    const themeButton = document.getElementById('themeToggle');
    if (!themeButton) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    themeButton.innerHTML = isDark ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
}

/**
 * Valida formulário de contato
 */
function validarFormularioContato() {
    const form = document.getElementById('form-contato');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = form.querySelector('input[name="nome"]');
        const email = form.querySelector('input[name="email"]');
        const telefone = form.querySelector('input[name="telefone"]');
        const mensagem = form.querySelector('textarea[name="mensagem"]');
        
        let isValid = true;
        let errors = [];
        
        // Validação do nome
        if (!nome.value.trim()) {
            errors.push('Nome é obrigatório');
            nome.classList.add('border-red-500');
            isValid = false;
        } else {
            nome.classList.remove('border-red-500');
        }
        
        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            errors.push('Email inválido');
            email.classList.add('border-red-500');
            isValid = false;
        } else {
            email.classList.remove('border-red-500');
        }
        
        // Validação do telefone (opcional)
        if (telefone.value.trim()) {
            const phoneRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
            if (!phoneRegex.test(telefone.value.replace(/\D/g, ''))) {
                errors.push('Telefone inválido');
                telefone.classList.add('border-red-500');
                isValid = false;
            } else {
                telefone.classList.remove('border-red-500');
            }
        }
        
        // Validação da mensagem
        if (!mensagem.value.trim()) {
            errors.push('Mensagem é obrigatória');
            mensagem.classList.add('border-red-500');
            isValid = false;
        } else {
            mensagem.classList.remove('border-red-500');
        }
        
        if (!isValid) {
            alert('Por favor, corrija os seguintes erros:\n' + errors.join('\n'));
            return;
        }
        
        // Simula envio bem-sucedido
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        form.reset();
    });
}

/**
 * Valida formulário de agendamento
 */
function validarFormularioAgendamento() {
    const form = document.getElementById('form-agendamento');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = form.querySelector('input[name="nome"]');
        const telefone = form.querySelector('input[name="telefone"]');
        const data = form.querySelector('input[name="data"]');
        const horario = form.querySelector('select[name="horario"]');
        const servico = form.querySelector('select[name="servico"]');
        
        let isValid = true;
        let errors = [];
        
        // Validação do nome
        if (!nome.value.trim()) {
            errors.push('Nome é obrigatório');
            nome.classList.add('border-red-500');
            isValid = false;
        } else {
            nome.classList.remove('border-red-500');
        }
        
        // Validação do telefone
        const phoneRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
        if (!telefone.value.trim() || !phoneRegex.test(telefone.value.replace(/\D/g, ''))) {
            errors.push('Telefone inválido');
            telefone.classList.add('border-red-500');
            isValid = false;
        } else {
            telefone.classList.remove('border-red-500');
        }
        
        // Validação da data (deve ser futura)
        const selectedDate = new Date(data.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!data.value || selectedDate < today) {
            errors.push('Data deve ser hoje ou futura');
            data.classList.add('border-red-500');
            isValid = false;
        } else {
            data.classList.remove('border-red-500');
        }
        
        // Validação do horário
        if (!horario.value) {
            errors.push('Horário é obrigatório');
            horario.classList.add('border-red-500');
            isValid = false;
        } else {
            horario.classList.remove('border-red-500');
        }
        
        // Validação do serviço
        if (!servico.value) {
            errors.push('Serviço é obrigatório');
            servico.classList.add('border-red-500');
            isValid = false;
        } else {
            servico.classList.remove('border-red-500');
        }
        
        if (!isValid) {
            alert('Por favor, corrija os seguintes erros:\n' + errors.join('\n'));
            return;
        }
        
        // Simula envio bem-sucedido
        alert('Agendamento realizado com sucesso! Confirmaremos por WhatsApp.');
        form.reset();
    });
}

/**
 * Adiciona máscara de telefone
 */
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{0,2})/, '($1');
        }
        
        e.target.value = value;
    });
}

/**
 * Configura o menu mobile
 */
function configurarMenuMobile() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;
    
    mobileMenuButton.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('block');
            mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('block');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Fecha menu ao clicar em link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('block');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

/**
 * Adiciona animação de contador aos números
 */
function animarContadores() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Inicia animação quando elemento está visível
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

/**
 * Adiciona efeito de digitação ao texto
 */
function efeitoDigitacao(elemento, texto, velocidade = 50) {
    let i = 0;
    elemento.textContent = '';
    
    function typeWriter() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i);
            i++;
            setTimeout(typeWriter, velocidade);
        }
    }
    
    typeWriter();
}

/**
 * Configura o botão de voltar ao topo
 */
function configurarBotaoTopo() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.remove('opacity-0', 'invisible');
            backToTop.classList.add('opacity-100', 'visible');
        } else {
            backToTop.classList.add('opacity-0', 'invisible');
            backToTop.classList.remove('opacity-100', 'visible');
        }
    });
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Adiciona loading skeleton enquanto imagens carregam
 */
function adicionarSkeletonLoading() {
    const images = document.querySelectorAll('img[data-skeleton]');
    
    images.forEach(img => {
        img.style.display = 'none';
        
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';
        skeleton.style.cssText = `
            width: ${img.width || '100%'};
            height: ${img.height || '200px'};
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 8px;
        `;
        
        img.parentNode.insertBefore(skeleton, img);
        
        img.addEventListener('load', () => {
            skeleton.remove();
            img.style.display = 'block';
        });
        
        img.addEventListener('error', () => {
            skeleton.remove();
            img.style.display = 'block';
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA4NUgxMTVWMTE1SDg1Vjg1WiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K';
        });
    });
}

// CSS para animação de loading
const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    .skeleton-loader {
        animation: loading 1.5s infinite;
    }
    
    .dark .skeleton-loader {
        background: linear-gradient(90deg, #374151 25%, #4B5563 50%, #374151 75%);
        background-size: 200% 100%;
    }
`;
document.head.appendChild(style);

/**
 * Cria sistema de partículas flutuantes
 */
function criarParticulas() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particleCount = 50;
    const particleTypes = ['small', 'medium', 'large'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        
        particle.className = `particle ${type}`;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        container.appendChild(particle);
    }
}

/**
 * Adiciona efeitos de hover avançados
 */
function adicionarEfeitosHover() {
    const cards = document.querySelectorAll('.card-hover');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = ripple.style.height = '0px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Adiciona animação de digitação ao hero
 */
function animarHeroTexto() {
    const elemento = document.getElementById('hero-texto-animado');
    if (!elemento) return;
    
    const textos = [
        'Transforme seu negócio com tecnologia de ponta',
        'Automação inteligente para sua casa e empresa',
        'Desenvolvimento web moderno e responsivo',
        'Manutenção especializada com garantia'
    ];
    
    let indiceAtual = 0;
    
    function proximoTexto() {
        efeitoDigitacao(elemento, textos[indiceAtual], 50);
        indiceAtual = (indiceAtual + 1) % textos.length;
        setTimeout(proximoTexto, 4000);
    }
    
    proximoTexto();
}

/**
 * Sistema de notificações toast
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    const notificacao = document.createElement('div');
    notificacao.className = `notification ${tipo}`;
    notificacao.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
            <span>${mensagem}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Animação de entrada
    setTimeout(() => notificacao.classList.add('show'), 100);
    
    // Remove após duração
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => notificacao.remove(), 300);
    }, duracao);
}

/**
 * Adiciona efeito de scroll suave com parallax
 */
function adicionarParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

/**
 * Sistema de progresso de leitura
 */
function adicionarProgressoLeitura() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Adiciona efeito de revelação ao scroll
 */
function adicionarRevelacaoScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    document.querySelectorAll('[data-reveal]').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Sistema de ChatBot Flutuante
 */
class FloatingChatBot {
    constructor() {
        this.isOpen = false;
        this.responses = {
            'manutencao': {
                keywords: ['manutencao', 'computador', 'notebook', 'conserto', 'reparo', 'pcdesktop'],
                response: 'Oferecemos manutenção especializada para computadores, notebooks e impressoras. Serviços preventivos e corretivos com garantia de qualidade. Deseja agendar uma visita?'
            },
            'automacao': {
                keywords: ['automacao', 'casa inteligente', 'smart home', 'iot', 'automatizacao'],
                response: 'Transformamos sua casa em um lar inteligente! Instalamos sistemas de automação para iluminação, cortinas, ar condicionado e segurança. Temos soluções personalizadas para cada necessidade.'
            },
            'desenvolvimento': {
                keywords: ['desenvolvimento', 'site', 'web', 'programacao', 'sistema', 'aplicativo'],
                response: 'Desenvolvemos sites profissionais, landing pages e sistemas web modernos e responsivos. Trabalhamos com as últimas tecnologias do mercado. Solicite um orçamento!'
            },
            'contato': {
                keywords: ['contato', 'telefone', 'whatsapp', 'email', 'endereco', 'localizacao'],
                response: 'Você pode nos contatar pelo WhatsApp (11) 9XXXX-XXXX, email contato@xerfantechlab.com.br ou através do formulário em nosso site. Atendemos toda a região!'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createChatWidget();
        this.setupEventListeners();
    }
    
    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'floating-chatbot';
        widget.innerHTML = `
            <!-- Chat Button -->
            <button id="chatbot-button" 
                    class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50">
                <i class="fas fa-comments text-xl"></i>
            </button>
            
            <!-- Chat Window -->
            <div id="chatbot-window" 
                 class="hidden fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                 style="max-height: calc(100vh - 120px);">
                
                <!-- Chat Header -->
                <div class="bg-gradient-to-r from-blue-600 to-orange-500 px-6 py-4 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold">Assistente Virtual</h3>
                                <p class="text-sm text-blue-100">Online</p>
                            </div>
                        </div>
                        <button id="close-chat" class="text-white hover:text-gray-200 transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Chat Messages -->
                <div id="chat-messages" class="chat-messages p-4 space-y-4">
                    <div class="message flex items-start gap-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
                            <p class="text-gray-800 dark:text-gray-200 text-sm">
                                Olá! 👋 Sou o assistente virtual da Xerfan Tech Lab. Como posso ajudar você hoje?
                            </p>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="flex flex-wrap gap-2 mt-4">
                        <button class="quick-action bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            💻 Manutenção
                        </button>
                        <button class="quick-action bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-full text-sm hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
                            🏠 Automação
                        </button>
                        <button class="quick-action bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-2 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                            🌐 Desenvolvimento
                        </button>
                        <button class="quick-action bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                            📞 Contato
                        </button>
                    </div>
                </div>
                
                <!-- Chat Input -->
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex gap-3">
                        <input type="text" 
                               id="chat-input" 
                               placeholder="Digite sua mensagem..." 
                               class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                               maxlength="500">
                        <button id="send-button" 
                                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
    }
    
    setupEventListeners() {
        const chatButton = document.getElementById('chatbot-button');
        const closeButton = document.getElementById('close-chat');
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        const quickActions = document.querySelectorAll('.quick-action');
        
        chatButton.addEventListener('click', () => this.toggleChat());
        closeButton.addEventListener('click', () => this.closeChat());
        sendButton.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        quickActions.forEach(button => {
            button.addEventListener('click', (e) => {
                const text = e.target.textContent.trim();
                this.handleQuickAction(text);
            });
        });
    }
    
    toggleChat() {
        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-button');
        
        if (this.isOpen) {
            window.classList.add('hidden');
            button.innerHTML = '<i class="fas fa-comments text-xl"></i>';
        } else {
            window.classList.remove('hidden');
            button.innerHTML = '<i class="fas fa-times text-xl"></i>';
            this.focusInput();
        }
        
        this.isOpen = !this.isOpen;
    }
    
    closeChat() {
        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-button');
        
        window.classList.add('hidden');
        button.innerHTML = '<i class="fas fa-comments text-xl"></i>';
        this.isOpen = false;
    }
    
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate response delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message flex items-start gap-3 ${sender === 'user' ? 'justify-end' : ''}`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl px-4 py-3 max-w-xs">
                    <p class="text-sm">${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
                    <p class="text-gray-800 dark:text-gray-200 text-sm">${text}</p>
                </div>
            `;
        }
        
        // Remove quick actions after first user message
        const quickActions = messagesContainer.querySelector('.flex.flex-wrap.gap-2');
        if (quickActions && sender === 'user') {
            quickActions.remove();
        }
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for keyword matches
        for (const [key, data] of Object.entries(this.responses)) {
            for (const keyword of data.keywords) {
                if (message.includes(keyword)) {
                    return data.response;
                }
            }
        }
        
        // Default responses
        const defaultResponses = [
            'Interessante! Para melhor atendê-lo, você prefere falar sobre manutenção, automação ou desenvolvimento web?',
            'Posso ajudar você com informações sobre nossos serviços. O que você gostaria de saber?',
            'Tem alguma dúvida específica sobre manutenção de computadores, automação residencial ou desenvolvimento web?',
            'Estou aqui para ajudar! Você prefere conversar sobre tecnologia, automação ou manutenção?'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    handleQuickAction(action) {
        let message = '';
        
        switch(action) {
            case '💻 Manutenção':
                message = 'Quero saber sobre manutenção de computadores';
                break;
            case '🏠 Automação':
                message = 'Quero saber sobre automação residencial';
                break;
            case '🌐 Desenvolvimento':
                message = 'Quero saber sobre desenvolvimento web';
                break;
            case '📞 Contato':
                message = 'Como posso entrar em contato?';
                break;
        }
        
        if (message) {
            this.addMessage(message, 'user');
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                const response = this.generateResponse(message);
                this.addMessage(response, 'bot');
            }, 1000);
        }
    }
    
    focusInput() {
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 100);
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize floating chatbot
document.addEventListener('DOMContentLoaded', function() {
    new FloatingChatBot();
});
document.addEventListener('DOMContentLoaded', function() {
    // Carrega componentes
    if (document.getElementById('header')) {
        loadComponent('header', 'components/header.html');
    }
    if (document.getElementById('footer')) {
        loadComponent('footer', 'components/footer.html');
    }
    
    // Aguarda carregamento do header para configurar elementos
    window.addEventListener('headerLoaded', function() {
        updateThemeButton();
        configurarMenuMobile();
    });
    
    // Valida formulários
    validarFormularioContato();
    validarFormularioAgendamento();
    
    // Aplica máscaras
    const telefoneInputs = document.querySelectorAll('input[name="telefone"]');
    telefoneInputs.forEach(input => aplicarMascaraTelefone(input));
    
    // Configura animações
    animarContadores();
    configurarBotaoTopo();
    adicionarSkeletonLoading();
    
    // Novas funcionalidades
    criarParticulas();
    adicionarEfeitosHover();
    animarHeroTexto();
    adicionarParallax();
    adicionarProgressoLeitura();
    adicionarRevelacaoScroll();
    
    console.log('✅ Xerfan Tech Lab - Sistema inicializado com sucesso!');
});

// Funções globais
window.toggleTheme = toggleTheme;
window.loadComponent = loadComponent;