/**
 * Advanced ChatBot with AI capabilities
 * Xerfan Tech Lab - Inteligência Artificial para atendimento
 * Versão: 2.0.0
 */

class AdvancedChatBot {
    constructor() {
        this.isOpen = false;
        this.currentConversation = [];
        this.knowledgeBase = this.loadKnowledgeBase();
        this.context = {
            userName: '',
            userEmail: '',
            userPhone: '',
            conversationStage: 'greeting',
            lastIntent: '',
            entities: {}
        };
        this.init();
    }

    init() {
        this.createChatBot();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    createChatBot() {
        const chatbotHTML = `
            <!-- ChatBot Button -->
            <div id="chatbot-button" class="fixed bottom-6 right-6 z-50">
                <button id="chatbot-toggle" class="bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <i class="fas fa-robot text-2xl"></i>
                </button>
            </div>

            <!-- ChatBot Container -->
            <div id="chatbot-container" class="fixed bottom-24 right-6 z-50 hidden">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-96 h-96 flex flex-col overflow-hidden">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-orange-500 p-4 text-white">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-robot text-2xl"></i>
                                <div>
                                    <h3 class="font-semibold">Assistente Virtual</h3>
                                    <p class="text-xs opacity-90">Xerfan Tech Lab</p>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button id="chatbot-minimize" class="text-white hover:opacity-70">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button id="chatbot-close" class="text-white hover:opacity-70">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div id="chatbot-messages" class="flex-1 p-4 overflow-y-auto chat-messages">
                        <div class="flex items-start space-x-2 mb-3">
                            <div class="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                                <i class="fas fa-robot text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-80%">
                                <p class="text-sm">Olá! 👋 Sou o assistente virtual da Xerfan Tech Lab. Como posso te ajudar hoje?</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div id="quick-actions" class="p-2 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex flex-wrap gap-2">
                            <button onclick="chatbot.startConversation('contato')" class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800">
                                Falar com consultor
                            </button>
                            <button onclick="chatbot.startConversation('agendamento')" class="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs hover:bg-orange-200 dark:hover:bg-orange-800">
                                Agendar serviço
                            </button>
                            <button onclick="chatbot.startConversation('orcamento')" class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-800">
                                Solicitar orçamento
                            </button>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-4 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex space-x-2">
                            <input id="chatbot-input" type="text" placeholder="Digite sua mensagem..." 
                                   class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <button id="chatbot-send" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div id="typing-indicator" class="hidden p-2 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex items-center space-x-2">
                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                                <div class="flex space-x-1">
                                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                </div>
                            </div>
                            <span class="text-xs text-gray-600 dark:text-gray-400">Digitando...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const minimize = document.getElementById('chatbot-minimize');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');

        toggle.addEventListener('click', () => this.toggleChatBot());
        close.addEventListener('click', () => this.closeChatBot());
        minimize.addEventListener('click', () => this.minimizeChatBot());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Eventos de teclado para abrir/fechar
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggleChatBot();
            }
        });
    }

    toggleChatBot() {
        const container = document.getElementById('chatbot-container');
        const button = document.getElementById('chatbot-button');

        if (this.isOpen) {
            container.classList.add('hidden');
            button.classList.remove('hidden');
            this.isOpen = false;
        } else {
            container.classList.remove('hidden');
            button.classList.add('hidden');
            this.isOpen = true;
            this.focusInput();
        }
    }

    closeChatBot() {
        const container = document.getElementById('chatbot-container');
        const button = document.getElementById('chatbot-button');
        container.classList.add('hidden');
        button.classList.remove('hidden');
        this.isOpen = false;
    }

    minimizeChatBot() {
        const container = document.getElementById('chatbot-container');
        container.classList.toggle('h-12');
        container.classList.toggle('h-96');
    }

    focusInput() {
        setTimeout(() => {
            const input = document.getElementById('chatbot-input');
            input.focus();
        }, 100);
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message) return;

        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        input.value = '';

        // Mostrar indicador de digitando
        this.showTypingIndicator();

        // Processar mensagem com IA
        setTimeout(() => {
            this.processMessageWithAI(message);
        }, 1000);
    }

    addMessage(content, sender, options = {}) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        
        const messageClass = sender === 'user' 
            ? 'flex items-start justify-end space-x-2 mb-3' 
            : 'flex items-start space-x-2 mb-3';

        const contentClass = sender === 'user'
            ? 'bg-blue-500 text-white rounded-lg p-3 max-w-80%'
            : 'bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-80%';

        messageElement.className = messageClass;

        if (sender === 'user') {
            messageElement.innerHTML = `
                <div class="${contentClass}">
                    <p class="text-sm">${content}</p>
                </div>
                <div class="bg-gray-200 dark:bg-gray-600 rounded-full p-2">
                    <i class="fas fa-user text-gray-600 dark:text-gray-300"></i>
                </div>
            `;
        } else {
            const avatar = options.avatar || 'robot';
            const avatarColor = options.avatarColor || 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
            
            messageElement.innerHTML = `
                <div class="${avatarColor} rounded-full p-2">
                    <i class="fas fa-${avatar} ${options.avatarColor || 'text-blue-600 dark:text-blue-400'}"></i>
                </div>
                <div class="${contentClass}">
                    <p class="text-sm">${content}</p>
                    ${options.buttons ? this.renderButtons(options.buttons) : ''}
                </div>
            `;
        }

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Adicionar à conversa atual
        this.currentConversation.push({
            content,
            sender,
            timestamp: new Date().toISOString(),
            ...options
        });

        // Salvar histórico
        this.saveConversationHistory();
    }

    renderButtons(buttons) {
        return `
            <div class="mt-2 space-y-1">
                ${buttons.map(button => `
                    <button onclick="chatbot.handleButtonClick('${button.action}')" 
                            class="block w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                        ${button.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.add('hidden');
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async processMessageWithAI(message) {
        this.hideTypingIndicator();

        // Analisar intenção da mensagem
        const intent = this.analyzeIntent(message);
        
        // Extrair entidades
        const entities = this.extractEntities(message);
        
        // Atualizar contexto
        this.updateContext(intent, entities);

        // Gerar resposta baseada na intenção detectada
        const response = await this.generateResponse(intent, message);
        
        // Adicionar resposta do bot
        this.addMessage(response.text, 'bot', response.options || {});

        // Executar ação se necessário
        if (response.action) {
            await this.executeAction(response.action, response.parameters);
        }
    }

    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intenções de negócios
        if (this.containsKeywords(lowerMessage, ['contato', 'falar', 'consultor', 'representante', 'comercial'])) {
            return 'contact_request';
        }
        
        if (this.containsKeywords(lowerMessage, ['agendar', 'agendamento', 'marcar', 'horário', 'data'])) {
            return 'schedule_request';
        }
        
        if (this.containsKeywords(lowerMessage, ['orçamento', 'preço', 'custo', 'valor', 'orçar', 'cotar'])) {
            return 'budget_request';
        }
        
        if (this.containsKeywords(lowerMessage, ['serviço', 'serviços', 'manutenção', 'automação', 'desenvolvimento', 'infra'])) {
            return 'service_inquiry';
        }
        
        if (this.containsKeywords(lowerMessage, ['produto', 'produtos', 'equipamento', 'hardware'])) {
            return 'product_inquiry';
        }
        
        if (this.containsKeywords(lowerMessage, ['suporte', 'problema', 'ajuda', 'suporte técnico', 'erro'])) {
            return 'support_request';
        }
        
        if (this.containsKeywords(lowerMessage, ['localização', 'endereço', 'encontrar', 'chegar', 'rua'])) {
            return 'location_inquiry';
        }
        
        if (this.containsKeywords(lowerMessage, ['tempo', 'prazo', 'quando', 'demora', 'urgente'])) {
            return 'time_inquiry';
        }
        
        // Saudações
        if (this.containsKeywords(lowerMessage, ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'hello'])) {
            return 'greeting';
        }
        
        // Despedidas
        if (this.containsKeywords(lowerMessage, ['tchau', 'adeus', 'até mais', 'obrigado', 'valeu', 'bye'])) {
            return 'goodbye';
        }
        
        // Informações sobre a empresa
        if (this.containsKeywords(lowerMessage, ['empresa', 'sobre', 'informação', 'quem é', 'quem são'])) {
            return 'company_info';
        }
        
        // Newsletter
        if (this.containsKeywords(lowerMessage, ['newsletter', 'novidades', 'notícias', 'inscrever', 'email'])) {
            return 'newsletter_request';
        }
        
        // Caso não consiga identificar, retorna fallback
        return 'fallback';
    }

    extractEntities(message) {
        const entities = {};
        
        // Extrair email
        const emailRegex = /[\w._-]+@[\w.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = message.match(emailRegex);
        if (emailMatch) {
            entities.email = emailMatch[0];
        }
        
        // Extrair telefone
        const phoneRegex = /\(\d{2}\)\s?\d{4,5}-?\d{4}/;
        const phoneMatch = message.match(phoneMatch);
        if (phoneMatch) {
            entities.phone = phoneMatch[0];
        }
        
        // Extrair valores de orçamento
        const budgetRegex = /R\$\s?\d{1,3}(\.\d{3})*(,\d{2})?/;
        const budgetMatch = message.match(budgetRegex);
        if (budgetMatch) {
            entities.budget = budgetMatch[0];
        }
        
        // Extrair nomes (simplificado)
        const nameKeywords = ['meu nome é', 'me chamo', 'sou o', 'sou a'];
        for (let keyword of nameKeywords) {
            if (message.toLowerCase().includes(keyword)) {
                const afterKeyword = message.split(keyword)[1];
                if (afterKeyword) {
                    entities.name = afterKeyword.trim().split(' ')[0];
                    break;
                }
            }
        }
        
        return entities;
    }

    updateContext(intent, entities) {
        this.context.lastIntent = intent;
        
        // Atualizar entidades no contexto
        if (entities.email) this.context.userEmail = entities.email;
        if (entities.phone) this.context.userPhone = entities.phone;
        if (entities.name) this.context.userName = entities.name;
        
        // Atualizar estágio da conversação
        if (intent === 'greeting') {
            this.context.conversationStage = 'greeting';
        } else if (intent === 'contact_request' || intent === 'schedule_request' || intent === 'budget_request') {
            this.context.conversationStage = 'collecting_info';
        }
    }

    async generateResponse(intent, message) {
        const responses = {
            greeting: {
                text: this.context.userName 
                    ? `Olá ${this.context.userName}! 😊 Que bom te ver novamente! Como posso ajudar você hoje?` 
                    : 'Olá! 😊 Sou o assistente virtual da Xerfan Tech Lab. Como posso te ajudar hoje?',
                options: {
                    buttons: [
                        { text: '📞 Falar com consultor', action: 'contact_request' },
                        { text: '📅 Agendar serviço', action: 'schedule_request' },
                        { text: '💰 Solicitar orçamento', action: 'budget_request' },
                        { text: '📋 Ver serviços', action: 'service_inquiry' }
                    ]
                }
            },
            
            contact_request: {
                text: 'Claro! Posso ajudar você a entrar em contato com nossa equipe comercial. Qual é o seu nome e telefone para que possamos retornar?',
                action: 'collect_contact_info'
            },
            
            schedule_request: {
                text: 'Perfeito! Posso ajudar com o agendamento. Qual serviço você gostaria de agendar?',
                options: {
                    buttons: [
                        { text: '🔧 Manutenção', action: 'schedule_maintenance' },
                        { text: '🤖 Automação', action: 'schedule_automation' },
                        { text: '💻 Desenvolvimento Web', action: 'schedule_web' },
                        { text: '🌐 Infraestrutura', action: 'schedule_infrastructure' }
                    ]
                }
            },
            
            budget_request: {
                text: 'Ótimo! Posso ajudar com um orçamento. Para qual serviço você gostaria de um orçamento?',
                options: {
                    buttons: [
                        { text: 'Novo site', action: 'budget_website' },
                        { text: 'Reforma de site', action: 'budget_reform' },
                        { text: 'Sistema web', action: 'budget_system' },
                        { text: 'E-commerce', action: 'budget_ecommerce' }
                    ]
                }
            },
            
            service_inquiry: {
                text: 'Oferecemos diversos serviços tecnológicos:\n\n• 📱 Manutenção de computadores e celulares\n• 🤖 Automação de processos\n• 💻 Desenvolvimento web e sistemas\n• 🌐 Infraestrutura de TI\n• 📊 Consultoria tecnológica\n\nQual deste serviços te interessa?',
                options: {
                    buttons: [
                        { text: '📱 Manutenção', action: 'service_maintenance' },
                        { text: '🤖 Automação', action: 'service_automation' },
                        { text: '💻 Desenvolvimento', action: 'service_development' },
                        { text: '🌐 Infraestrutura', action: 'service_infrastructure' }
                    ]
                }
            },
            
            product_inquiry: {
                text: 'Temos diversos produtos tecnológicos disponíveis. Posso ajudar você a encontrar o que precisa. Qual tipo de equipamento está procurando?',
                action: 'collect_product_info'
            },
            
            support_request: {
                text: 'Entendo que você está com dificuldades. Posso ajudar a direcionar para o suporte adequado. Pode me descrever o problema?',
                action: 'collect_support_info'
            },
            
            location_inquiry: {
                text: 'Estamos localizados em São Paulo, mas atendemos toda a região metropolitana. Posso ajudar com mais informações sobre como chegar até nós.',
                options: {
                    buttons: [
                        { text: '📍 Ver endereço completo', action: 'show_full_address' },
                        { text '🚌 Como chegar', action: 'get_directions' },
                        { text: '📞 Ligar para empresa', action: 'call_company' }
                    ]
                }
            },
            
            time_inquiry: {
                text: 'Os prazos variam de acordo com o serviço:\n\n• Manutenção: 1-3 dias úteis\n• Automação: 5-15 dias úteis\n• Desenvolvimento: 15-45 dias úteis\n• Infraestrutura: 2-10 dias úteis\n
Para um prazo mais preciso, posso fazer um orçamento específico. Qual serviço tem interessa?',
                action: 'collect_time_info'
            },
            
            company_info: {
                text: 'A Xerfan Tech Lab é uma empresa especializada em soluções tecnológicas completas. Estamos no mercado há 10 anos e oferecemos:\n\n• Manutenção de computadores e celulares\n• Automação de processos\n• Desenvolvimento web e sistemas\n• Infraestrutura de TI\n• Consultoria tecnológica\n\nCom mais de 500 clientes atendidos, temos o conhecimento e experiência para ajudar seu negócio a crescer com tecnologia.',
                options: {
                    buttons: [
                        { text: '📖 Ver mais informações', action: 'more_company_info' },
                        { text: '💼 Nossos serviços', action: 'services_info' },
                        { text: '📞 Falar com consultor', action: 'contact_request' }
                    ]
                }
            },
            
            newsletter_request: {
                text: 'Ótimo interesse! Nossa newsletter é enviada quinzenalmente com as últimas novidades em tecnologia, dicas de empreendedorismo digital e ofertas especiais. Posso cadastrar seu e-mail?',
                action: 'collect_newsletter_email'
            },
            
            goodbye: {
                text: 'Foi um prazer conversar com você! 😊 Se precisar de mais alguma informação, estarei aqui. Tenha um ótimo dia!',
                options: {
                    buttons: [
                        { text: '🔄 Iniciar nova conversa', action: 'restart_conversation' },
                        { text: '📞 Falar com humano', action: 'human_transfer' }
                    ]
                }
            },
            
            fallback: {
                text: 'Desculpe, não entendi completamente. Posso ajudar com:\n\n• 📞 Contato com consultor\n• 📅 Agendamento de serviços\n• 💰 Orçamentos\n• 📋 Informações sobre serviços\n• 📍 Localização da empresa\n• 📰 Newsletter com novidades\n\nO que você gostaria de fazer?',
                options: {
                    buttons: [
                        { text: '📞 Falar com consultor', action: 'contact_request' },
                        { text: '📅 Agendar serviço', action: 'schedule_request' },
                        { text: '💰 Solicitar orçamento', action: 'budget_request' }
                    ]
                }
            }
        };

        return responses[intent] || responses.fallback;
    }

    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword.toLowerCase()));
    }

    async executeAction(action, parameters) {
        switch (action) {
            case 'collect_contact_info':
                this.startContactCollection();
                break;
            case 'collect_schedule_info':
                this.startScheduleCollection();
                break;
            case 'collect_budget_info':
                this.startBudgetCollection();
                break;
            case 'save_to_database':
                await this.saveToDatabase(parameters);
                break;
            case 'human_transfer':
                this.transferToHuman();
                break;
            case 'restart_conversation':
                this.restartConversation();
                break;
        }
    }

    startContactCollection() {
        this.addMessage('Para que possamos entrar em contar, preciso de algumas informações. Qual é o seu nome?', 'bot');
        this.context.conversationStage = 'collecting_contact_name';
    }

    startScheduleCollection() {
        this.addMessage('Perfeito! Para agendar o serviço, preciso de algumas informações. Qual é o seu nome?', 'bot');
        this.context.conversationStage = 'collecting_schedule_name';
    }

    startBudgetCollection() {
        this.addMessage('Para preparar seu orçamento, preciso de algumas informações. Qual é o seu nome?', 'bot');
        this.context.conversationStage = 'collecting_budget_name';
    }

    async saveToDatabase(data) {
        try {
            const response = await fetch('tables/contatos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.addMessage('Muito obrigado! Suas informações foram salvas com sucesso. Nossa equipe entrará em contato em breve.', 'bot');
            } else {
                throw new Error('Erro ao salvar dados');
            }
        } catch (error) {
            this.addMessage('Desculpe, houve um erro ao salvar suas informações. Por favor, tente novamente mais tarde ou entre em contato diretamente conosco.', 'bot');
        }
    }

    transferToHuman() {
        this.addMessage('Vou transferir você para um de nossos atendentes humanos. Por favor, aguarde um momento...', 'bot');
        
        // Simular transferência
        setTimeout(() => {
            this.addMessage('Conectando com nosso departamento de atendimento...', 'bot');
        }, 2000);

        setTimeout(() => {
            this.addMessage('Desculpe, todos os nossos consultores estão ocupados no momento. Posso deixar seu nome e telefone para que possamos retornar?', 'bot');
        }, 5000);
    }

    restartConversation() {
        this.context = {
            userName: '',
            userEmail: '',
            userPhone: '',
            conversationStage: 'greeting',
            lastIntent: '',
            entities: {}
        };
        
        this.currentConversation = [];
        
        // Limpar mensagens e reiniciar
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.innerHTML = '';
        
        this.addMessage('Olá! 👋 Reiniciamos nossa conversa. Como posso te ajudar hoje?', 'bot');
    }

    loadKnowledgeBase() {
        return {
            company: {
                name: 'Xerfan Tech Lab',
                description: 'Empresa especializada em soluções tecnológicas completas',
                services: [
                    'Manutenção de computadores e celulares',
                    'Automação de processos empresariais',
                    'Desenvolvimento web e sistemas',
                    'Infraestrutura de TI',
                    'Consultoria tecnológica'
                ],
                contact: {
                    phone: '(11) 9XXXX-XXXX',
                    email: 'contato@xerfantechlab.com.br',
                    address: 'São Paulo, SP'
                },
                hours: 'Segunda a Sexta, das 8h às 18h',
                website: 'https://xerfantechlab.com.br'
            },
            
            faq: {
                'tempo de atendimento': 'O tempo de atendimento varia de 1 a 45 dias úteis, dependendo do serviço',
                'garantia': 'Oferecemos garantia de 3 a 12 meses, dependendo do serviço',
                'pagamento': 'Aceitamos cartão, dinheiro, transferência e PIX',
                'orçamento': 'Orçamentos gratuitos e sem compromisso',
                'emergência': 'Atendimento emergencial disponível'
            }
        };
    }

    startConversation(type) {
        const messages = {
            contato: 'Perfeito! Vou ajudar você a falar com nosso consultor. Qual é o seu nome?',
            agendamento: 'Ótimo! Vou ajudar com o agendamento. Qual é o seu nome?',
            orcamento: 'Excelente! Vou ajudar com o orçamento. Qual é o seu nome?'
        };

        this.addMessage(messages[type] || 'Como posso ajudar você com isso?', 'bot');
    }

    handleButtonClick(action) {
        // Implementar lógica para lidar com cliques nos botões
        console.log('Botão clicado:', action);
        
        // Chamar função específica baseada na ação
        switch (action) {
            case 'contact_request':
                this.startContactCollection();
                break;
            case 'schedule_request':
                this.startScheduleCollection();
                break;
            case 'budget_request':
                this.startBudgetCollection();
                break;
            case 'service_inquiry':
                this.addMessage('Aqui estão nossos principais serviços:\n\n• Manutenção de computadores e celulares\n• Automação de processos\n• Desenvolvimento web e sistemas\n• Infraestrutura de TI\n• Consultoria tecnológica\n\nQual destes serviços te interessa?', 'bot');
                break;
            default:
                this.addMessage(`Você selecionou: ${action}. Posso ajudar mais com isso?`, 'bot');
        }
    }

    saveConversationHistory() {
        localStorage.setItem('chatbot_history', JSON.stringify(this.currentConversation));
    }

    loadConversationHistory() {
        const history = localStorage.getItem('chatbot_history');
        if (history) {
            try {
                this.currentConversation = JSON.parse(history);
                // Opcionalmente, restaurar últimas mensagens no chat visual
            } catch (error) {
                console.error('Erro ao carregar histórico:', error);
            }
        }
    }
}

// Inicialização global
window.chatbot = new AdvancedChatBot();

// Adicionar CSS necessário
const chatbotStyles = `
    <style>
        .chat-messages {
            scrollbar-width: thin;
            scrollbar-color: #c1c1c1 #f1f1f1;
        }
        
        .dark .chat-messages {
            scrollbar-color: #4b5563 #374151;
        }
        
        .toast {
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        #chatbot-container {
            transition: all 0.3s ease-out;
        }
        
        #chatbot-button button {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        #chatbot-button button:hover {
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', chatbotStyles);