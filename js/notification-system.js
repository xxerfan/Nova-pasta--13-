/**
 * Notification System - Sistema de notificações em tempo real
 * Xerfan Tech Lab - Monitoramento e alertas
 * Versão: 1.0.0
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.permission = 'default';
        this.socket = null;
        this.audio = null;
        this.init();
    }

    init() {
        this.setupNotificationAPI();
        this.setupWebSocket();
        this.setupAudio();
        this.startMonitoring();
        this.setupEventListeners();
    }

    setupNotificationAPI() {
        if ('Notification' in window) {
            this.requestPermission();
        }
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            this.permission = await Notification.requestPermission();
        } else {
            this.permission = Notification.permission;
        }
    }

    setupWebSocket() {
        // Simular conexão WebSocket para notificações em tempo real
        // Em produção, isso seria uma conexão real com o servidor
        this.simulateWebSocket();
    }

    simulateWebSocket() {
        // Simular notificações aleatórias para demonstração
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% de chance a cada intervalo
                this.createRandomNotification();
            }
        }, 30000); // A cada 30 segundos

        // Notificações específicas baseadas em eventos do sistema
        this.monitorSystemEvents();
    }

    setupAudio() {
        // Criar objeto de áudio para notificações sonoras
        this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2u7CKA78j9XrtUkRAE2f1OuwSBIkTY7U665LEg9NlM3rr0wSAD6Zz+mwRRgATJjO5q1KEg1EkS5DM5KpNBwNLlMvmqUYTAT6Xy+WqQgcFS5LL5alMBgNJkcvkp0kGAj+YyuWqQgYFTZLK5ahOBwNKksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgYGTJLK5alNCANJksrkoUgGAz+XyuWqQgY=');
        this.audio.volume = 0.3;
    }

    setupEventListeners() {
        // Escutar eventos do sistema
        document.addEventListener('formSuccess', (event) => {
            this.handleFormSuccess(event.detail);
        });

        // Escutar novos contatos
        this.monitorNewContacts();
        
        // Escutar agendamentos
        this.monitorAppointments();
        
        // Escutar propostas
        this.monitorProposals();
    }

    createNotification(title, options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            body: options.body || '',
            icon: options.icon || '/img/logo.png',
            type: options.type || 'info',
            priority: options.priority || 'medium',
            timestamp: new Date().toISOString(),
            read: false,
            actions: options.actions || [],
            data: options.data || {},
            duration: options.duration || 5000
        };

        this.notifications.push(notification);
        this.showNotification(notification);
        this.playSound();
        this.saveToLocalStorage();

        return notification;
    }

    showNotification(notification) {
        // Notificação no navegador
        if (this.permission === 'granted') {
            this.showBrowserNotification(notification);
        }

        // Notificação na página
        this.showInPageNotification(notification);

        // Notificação no dashboard
        if (window.dashboard) {
            this.updateDashboardNotification(notification);
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && this.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                tag: notification.id.toString(),
                requireInteraction: notification.priority === 'high'
            });

            browserNotification.onclick = () => {
                this.handleNotificationClick(notification);
                window.focus();
                browserNotification.close();
            };

            // Auto-close após duração especificada
            if (notification.duration > 0) {
                setTimeout(() => {
                    browserNotification.close();
                }, notification.duration);
            }
        }
    }

    showInPageNotification(notification) {
        const notificationHTML = `
            <div id="notification-${notification.id}" class="notification-item fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-${this.getNotificationColor(notification.type)}-500 transform translate-x-full transition-transform duration-300">
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i class="fas ${this.getNotificationIcon(notification.type)} text-${this.getNotificationColor(notification.type)}-500"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <h4 class="text-sm font-medium text-gray-900 dark:text-white">${notification.title}</h4>
                            ${notification.body ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${notification.body}</p>` : ''}
                            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                ${this.getTimeAgo(notification.timestamp)}
                            </div>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                            <button onclick="notificationSystem.dismissNotification(${notification.id})" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    ${notification.actions.length > 0 ? `
                        <div class="mt-3 flex space-x-2">
                            ${notification.actions.map(action => `
                                <button onclick="notificationSystem.handleAction(${notification.id}, '${action.action}')" 
                                        class="px-3 py-1 text-xs bg-${this.getNotificationColor(notification.type)}-100 text-${this.getNotificationColor(notification.type)}-700 rounded hover:bg-${this.getNotificationColor(notification.type)}-200">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Remover notificações anteriores do mesmo tipo se for alta prioridade
        if (notification.priority === 'high') {
            this.clearNotificationType(notification.type);
        }

        document.body.insertAdjacentHTML('beforeend', notificationHTML);

        // Animação de entrada
        setTimeout(() => {
            const element = document.getElementById(`notification-${notification.id}`);
            if (element) {
                element.classList.remove('translate-x-full');
            }
        }, 100);

        // Auto-dismiss após duração
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismissNotification(notification.id);
            }, notification.duration);
        }
    }

    getNotificationColor(type) {
        const colors = {
            success: 'green',
            error: 'red',
            warning: 'yellow',
            info: 'blue',
            contact: 'blue',
            appointment: 'orange',
            proposal: 'purple',
            newsletter: 'green'
        };
        return colors[type] || 'blue';
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            contact: 'fa-envelope',
            appointment: 'fa-calendar-alt',
            proposal: 'fa-file-contract',
            newsletter: 'fa-newspaper'
        };
        return icons[type] || 'fa-info-circle';
    }

    dismissNotification(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.add('translate-x-full');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        // Marcar como lida
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }

        this.saveToLocalStorage();
    }

    clearNotificationType(type) {
        this.notifications
            .filter(n => n.type === type && !n.read)
            .forEach(n => this.dismissNotification(n.id));
    }

    handleNotificationClick(notification) {
        // Ação baseada no tipo de notificação
        switch (notification.type) {
            case 'contact':
                this.openContacts();
                break;
            case 'appointment':
                this.openAppointments();
                break;
            case 'proposal':
                this.openProposals();
                break;
            default:
                if (notification.data && notification.data.url) {
                    window.open(notification.data.url, '_blank');
                }
        }

        // Marcar como lida
        notification.read = true;
        this.saveToLocalStorage();
    }

    handleAction(notificationId, action) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.data && notification.data.actions) {
            const actionFunction = notification.data.actions[action];
            if (actionFunction) {
                actionFunction();
            }
        }
        this.dismissNotification(notificationId);
    }

    playSound() {
        if (this.audio) {
            this.audio.play().catch(error => {
                console.log('Erro ao tocar som:', error);
            });
        }
    }

    // Métodos de monitoramento
    startMonitoring() {
        // Monitorar novos registros em tempo real
        this.monitorNewRecords();
        
        // Monitorar status de agendamentos
        this.monitorAppointmentStatus();
        
        // Monitorar propostas pendentes
        this.monitorPendingProposals();
    }

    monitorNewContacts() {
        // Verificar novos contatos periodicamente
        setInterval(async () => {
            try {
                const response = await fetch('tables/contatos?filter=status:novo');
                const data = await response.json();
                
                if (data.total > 0) {
                    this.createNotification('Novo contato recebido!', {
                        body: `${data.total} novo(s) contato(s) aguardando resposta`,
                        type: 'contact',
                        priority: 'high',
                        actions: [
                            { text: 'Ver contatos', action: 'open_contacts' }
                        ],
                        data: {
                            count: data.total,
                            url: '/admin/dashboard.html#contatos'
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao monitorar contatos:', error);
            }
        }, 60000); // Verificar a cada minuto
    }

    monitorAppointments() {
        // Verificar agendamentos do dia
        setInterval(async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(`tables/agendamentos?filter=data_preferencial:${today}`);
                const data = await response.json();
                
                if (data.total > 0) {
                    this.createNotification('Agendamentos de hoje', {
                        body: `${data.total} agendamento(s) confirmado(s) para hoje`,
                        type: 'appointment',
                        priority: 'medium',
                        actions: [
                            { text: 'Ver agendamentos', action: 'open_appointments' }
                        ],
                        data: {
                            count: data.total,
                            date: today
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao monitorar agendamentos:', error);
            }
        }, 3600000); // Verificar a cada hora
    }

    monitorProposals() {
        // Verificar propostas pendentes
        setInterval(async () => {
            try {
                const response = await fetch('tables/propostas?filter=status:novo');
                const data = await response.json();
                
                if (data.total > 0) {
                    this.createNotification('Novas propostas', {
                        body: `${data.total} proposta(s) nova(s) aguardando análise`,
                        type: 'proposal',
                        priority: 'high',
                        actions: [
                            { text: 'Ver propostas', action: 'open_proposals' }
                        ],
                        data: {
                            count: data.total
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao monitorar propostas:', error);
            }
        }, 120000); // Verificar a cada 2 minutos
    }

    monitorSystemEvents() {
        // Monitorar eventos do sistema como novos formulários enviados
        document.addEventListener('newFormSubmission', (event) => {
            const { formType, data } = event.detail;
            
            this.createNotification('Novo formulário recebido', {
                body: `Um novo formulário de ${formType} foi enviado`,
                type: formType,
                priority: 'medium',
                data: { formType, data }
            });
        });

        // Monitorar erros do sistema
        window.addEventListener('error', (event) => {
            this.createNotification('Erro no sistema', {
                body: 'Um erro foi detectado no sistema',
                type: 'error',
                priority: 'high'
            });
        });
    }

    handleFormSuccess(data) {
        this.createNotification('Formulário enviado com sucesso!', {
            body: `Seu ${data.formName} foi recebido e será processado em breve`,
            type: 'success',
            priority: 'low',
            duration: 3000
        });

        // Disparar evento para outros componentes
        document.dispatchEvent(new CustomEvent('newFormSubmission', {
            detail: data
        }));
    }

    // Métodos auxiliares
    getTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)} dias`;
    }

    saveToLocalStorage() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            try {
                this.notifications = JSON.parse(stored);
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
            }
        }
    }

    createRandomNotification() {
        const types = ['contact', 'appointment', 'proposal', 'newsletter'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const messages = {
            contact: { title: 'Novo contato', body: 'Você tem um novo contato aguardando resposta' },
            appointment: { title: 'Lembrete de agendamento', body: 'Você tem um agendamento próximo' },
            proposal: { title: 'Proposta atualizada', body: 'O status de uma proposta foi alterado' },
            newsletter: { title: 'Newsletter', body: 'Você tem novas inscrições na newsletter' }
        };

        const message = messages[type];
        this.createNotification(message.title, {
            body: message.body,
            type: type,
            priority: 'low',
            duration: 4000
        });
    }

    updateDashboardNotification(notification) {
        if (window.dashboard) {
            // Atualizar badges no dashboard
            const badgeElement = document.getElementById(`${notification.type}-badge`);
            if (badgeElement) {
                const currentCount = parseInt(badgeElement.textContent) || 0;
                badgeElement.textContent = currentCount + 1;
            }
        }
    }

    openContacts() {
        if (window.dashboard) {
            window.dashboard.switchSection('contatos');
        } else {
            window.open('/admin/dashboard.html#contatos', '_blank');
        }
    }

    openAppointments() {
        if (window.dashboard) {
            window.dashboard.switchSection('agendamentos');
        } else {
            window.open('/admin/dashboard.html#agendamentos', '_blank');
        }
    }

    openProposals() {
        if (window.dashboard) {
            window.dashboard.switchSection('propostas');
        } else {
            window.open('/admin/dashboard.html#propostas', '_blank');
        }
    }

    // Métodos de monitoramento avançado
    async monitorNewRecords() {
        // Implementar lógica para monitorar novos registros
        // Isso pode envolver polling do servidor ou WebSocket real
    }

    async monitorAppointmentStatus() {
        // Monitorar mudanças de status de agendamentos
        // Enviar alertas para agendamentos próximos ou atrasados
    }

    async monitorPendingProposals() {
        // Monitorar propostas pendentes há muito tempo
        // Enviar lembretes para follow-up
    }
}

// Inicialização global
window.notificationSystem = new NotificationSystem();

// Adicionar estilos CSS
const notificationStyles = `
    <style>
        .notification-item {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .dark .notification-item {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .notification-badge {
            animation: pulse 2s infinite;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);