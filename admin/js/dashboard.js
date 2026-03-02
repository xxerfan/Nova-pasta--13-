/**
 * Dashboard - Sistema de gerenciamento administrativo
 * Autor: Xerfan Tech Lab
 * Versão: 1.0.0
 */

class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.charts = {};
        this.data = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Navegação lateral
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Toggle sidebar
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Filtros e busca
        this.setupFilters();
    }

    setupFilters() {
        // Filtros de contatos
        const contatosSearch = document.getElementById('contatos-search');
        const contatosFilter = document.getElementById('contatos-filter');
        
        if (contatosSearch) {
            contatosSearch.addEventListener('input', () => {
                this.loadContatos();
            });
        }
        
        if (contatosFilter) {
            contatosFilter.addEventListener('change', () => {
                this.loadContatos();
            });
        }

        // Filtros de agendamentos
        const agendamentosSearch = document.getElementById('agendamentos-search');
        const agendamentosFilter = document.getElementById('agendamentos-filter');
        
        if (agendamentosSearch) {
            agendamentosSearch.addEventListener('input', () => {
                this.loadAgendamentos();
            });
        }
        
        if (agendamentosFilter) {
            agendamentosFilter.addEventListener('change', () => {
                this.loadAgendamentos();
            });
        }

        // Filtros de propostas
        const propostasSearch = document.getElementById('propostas-search');
        const propostasFilter = document.getElementById('propostas-filter');
        
        if (propostasSearch) {
            propostasSearch.addEventListener('input', () => {
                this.loadPropostas();
            });
        }
        
        if (propostasFilter) {
            propostasFilter.addEventListener('change', () => {
                this.loadPropostas();
            });
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        sidebar.classList.toggle('collapsed');
        mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '80px' : '256px';
    }

    async switchSection(sectionName) {
        // Esconder seções anteriores
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar nova seção
        const newSection = document.getElementById(`${sectionName}-section`);
        if (newSection) {
            newSection.classList.remove('hidden');
            this.currentSection = sectionName;
            
            // Atualizar título da página
            const pageTitle = document.getElementById('page-title');
            const sectionTitles = {
                dashboard: 'Dashboard',
                contatos: 'Contatos',
                agendamentos: 'Agendamentos',
                propostas: 'Propostas',
                newsletter: 'Newsletter',
                avaliacoes: 'Avaliações',
                blog: 'Blog',
                    configuracoes: 'Configurações'
            };
            pageTitle.textContent = sectionTitles[sectionName] || 'Dashboard';

            // Carregar dados específicos da seção
            await this.loadSectionData(sectionName);
        }

        // Atualizar navegação ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900', 'dark:text-blue-300');
            item.classList.add('text-gray-700', 'dark:text-gray-300');
        });

        const activeNavItem = document.querySelector(`[href="#${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900', 'dark:text-blue-300');
            activeNavItem.classList.remove('text-gray-700', 'dark:text-gray-300');
        }
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadContatosSummary(),
                this.loadAgendamentosSummary(),
                this.loadPropostasSummary(),
                this.loadNewsletterSummary(),
                this.loadRecentActivity()
            ]);

            this.updateCharts();
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    }

    async loadContatosSummary() {
        try {
            const response = await fetch('tables/contatos?limit=1000');
            const data = await response.json();
            
            const total = data.total || 0;
            const novos = data.data.filter(item => item.status === 'novo').length || 0;
            
            document.getElementById('total-contatos').textContent = total;
            document.getElementById('contatos-badge').textContent = novos;
            
            // Calcular variação
            const variation = this.calculateVariation(data.data, 'data_contato');
            document.getElementById('contatos-variation').innerHTML = 
                `<span class="${variation >= 0 ? 'text-green-600' : 'text-red-600'}">
                    <i class="fas fa-${variation >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(variation)}%
                </span>`;

            this.data.contatos = data.data;
        } catch (error) {
            console.error('Erro ao carregar resumo de contatos:', error);
        }
    }

    async loadAgendamentosSummary() {
        try {
            const response = await fetch('tables/agendamentos?limit=1000');
            const data = await response.json();
            
            const total = data.total || 0;
            const pendentes = data.data.filter(item => item.status === 'pendente').length || 0;
            
            document.getElementById('total-agendamentos').textContent = total;
            document.getElementById('agendamentos-badge').textContent = pendentes;
            
            // Calcular variação
            const variation = this.calculateVariation(data.data, 'data_agendamento');
            document.getElementById('agendamentos-variation').innerHTML = 
                `<span class="${variation >= 0 ? 'text-green-600' : 'text-red-600'}">
                    <i class="fas fa-${variation >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(variation)}%
                </span>`;

            this.data.agendamentos = data.data;
        } catch (error) {
            console.error('Erro ao carregar resumo de agendamentos:', error);
        }
    }

    async loadPropostasSummary() {
        try {
            const response = await fetch('tables/propostas?limit=1000');
            const data = await response.json();
            
            const total = data.total || 0;
            const novas = data.data.filter(item => item.status === 'novo').length || 0;
            
            document.getElementById('total-propostas').textContent = total;
            document.getElementById('propostas-badge').textContent = novas;
            
            // Calcular variação
            const variation = this.calculateVariation(data.data, 'data_proposta');
            document.getElementById('propostas-variation').innerHTML = 
                `<span class="${variation >= 0 ? 'text-green-600' : 'text-red-600'}">
                    <i class="fas fa-${variation >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(variation)}%
                </span>`;

            this.data.propostas = data.data;
        } catch (error) {
            console.error('Erro ao carregar resumo de propostas:', error);
        }
    }

    async loadNewsletterSummary() {
        try {
            const response = await fetch('tables/newsletter?limit=1000');
            const data = await response.json();
            
            const total = data.total || 0;
            document.getElementById('total-newsletter').textContent = total;
            
            // Calcular variação
            const variation = this.calculateVariation(data.data, 'data_cadastro');
            document.getElementById('newsletter-variation').innerHTML = 
                `<span class="${variation >= 0 ? 'text-green-600' : 'text-red-600'}">
                    <i class="fas fa-${variation >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(variation)}%
                </span>`;

            this.data.newsletter = data.data;
        } catch (error) {
            console.error('Erro ao carregar resumo de newsletter:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activities = [];
            
            // Buscar dados de todas as tabelas para criar timeline
            const [contatos, agendamentos, propostas] = await Promise.all([
                this.fetchTableData('contatos', 5),
                this.fetchTableData('agendamentos', 5),
                this.fetchTableData('propostas', 5)
            ]);

            // Combinar e ordenar por data
            const allActivities = [
                ...contatos.map(item => ({ ...item, type: 'contato', date: item.data_contato })),
                ...agendamentos.map(item => ({ ...item, type: 'agendamento', date: item.data_agendamento })),
                ...propostas.map(item => ({ ...item, type: 'proposta', date: item.data_proposta }))
            ];

            allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentActivities = allActivities.slice(0, 10);

            this.renderRecentActivity(recentActivities);
        } catch (error) {
            console.error('Erro ao carregar atividades recentes:', error);
        }
    }

    async fetchTableData(table, limit = 100) {
        try {
            const response = await fetch(`tables/${table}?limit=${limit}`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error(`Erro ao buscar dados da tabela ${table}:`, error);
            return [];
        }
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-clock text-4xl mb-2"></i>
                    <p>Nenhuma atividade recente</p>
                </div>
            `;
            return;
        }

        const html = activities.map(activity => {
            const date = new Date(activity.date);
            const timeAgo = this.getTimeAgo(date);
            
            let icon = 'fas fa-question';
            let color = 'text-gray-500';
            let description = '';

            switch (activity.type) {
                case 'contato':
                    icon = 'fas fa-envelope';
                    color = 'text-blue-500';
                    description = `Novo contato de ${activity.nome}`;
                    break;
                case 'agendamento':
                    icon = 'fas fa-calendar-alt';
                    color = 'text-orange-500';
                    description = `Agendamento para ${activity.servico}`;
                    break;
                case 'proposta':
                    icon = 'fas fa-file-contract';
                    color = 'text-green-500';
                    description = `Proposta de ${activity.nome}`;
                    break;
            }

            return `
                <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <i class="${icon} ${color} text-lg"></i>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800 dark:text-white">${description}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">${timeAgo}</p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${date.toLocaleDateString('pt-BR')}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' anos';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' meses';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' dias';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' horas';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutos';
        
        return 'alguns segundos';
    }

    calculateVariation(data, dateField) {
        if (!data || data.length < 2) return 0;
        
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const lastMonthCount = data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= lastMonth && itemDate < thisMonth;
        }).length;
        
        const thisMonthCount = data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= thisMonth;
        }).length;
        
        if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
        
        return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
    }

    updateCharts() {
        this.updateContatosChart();
        this.updateAgendamentosChart();
    }

    updateContatosChart() {
        const ctx = document.getElementById('contatosChart');
        if (!ctx) return;

        const months = this.getLast12Months();
        const data = months.map(month => {
            if (!this.data.contatos) return 0;
            return this.data.contatos.filter(item => {
                const itemDate = new Date(item.data_contato);
                return itemDate.getMonth() === month.month && itemDate.getFullYear() === month.year;
            }).length;
        });

        if (this.charts.contatos) {
            this.charts.contatos.destroy();
        }

        this.charts.contatos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months.map(m => m.label),
                datasets: [{
                    label: 'Contatos',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateAgendamentosChart() {
        const ctx = document.getElementById('agendamentosChart');
        if (!ctx) return;

        const statusData = this.getAgendamentosByStatus();

        if (this.charts.agendamentos) {
            this.charts.agendamentos.destroy();
        }

        this.charts.agendamentos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: [
                        'rgb(251, 191, 36)', // pending
                        'rgb(34, 197, 94)',   // confirmed
                        'rgb(239, 68, 68)',   // cancelled
                        'rgb(59, 130, 246)'   // completed
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    getLast12Months() {
        const months = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: date.getMonth(),
                year: date.getFullYear(),
                label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            });
        }
        
        return months;
    }

    getAgendamentosByStatus() {
        if (!this.data.agendamentos) return {};

        const status = {};
        this.data.agendamentos.forEach(item => {
            const key = item.status || 'unknown';
            status[key] = (status[key] || 0) + 1;
        });

        return status;
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'contatos':
                await this.loadContatos();
                break;
            case 'agendamentos':
                await this.loadAgendamentos();
                break;
            case 'propostas':
                await this.loadPropostas();
                break;
            case 'newsletter':
                await this.loadNewsletter();
                break;
            case 'avaliacoes':
                await this.loadAvaliacoes();
                break;
            case 'blog':
                await this.loadBlog();
                break;
        }
    }

    async loadContatos() {
        const search = document.getElementById('contatos-search')?.value || '';
        const filter = document.getElementById('contatos-filter')?.value || '';
        
        let query = 'tables/contatos?limit=50';
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (filter) query += `&filter=status:${filter}`;

        try {
            const response = await fetch(query);
            const data = await response.json();
            this.renderContatosList(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
        }
    }

    renderContatosList(contatos) {
        const container = document.getElementById('contatos-list');
        
        if (contatos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-envelope text-4xl mb-2"></i>
                    <p>Nenhum contato encontrado</p>
                </div>
            `;
            return;
        }

        const html = contatos.map(contato => {
            const priorityClass = contato.prioridade ? `priority-${contato.prioridade}` : '';
            const statusClass = `status-${contato.status || 'new'}`;
            
            return `
                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 ${priorityClass}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <h4 class="font-semibold text-gray-800 dark:text-white">${contato.nome}</h4>
                                <span class="status-badge ${statusClass}">${this.getStatusLabel(contato.status)}</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-envelope mr-1"></i> ${contato.email}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <i class="fas fa-phone mr-1"></i> ${contato.telefone}
                            </p>
                            <p class="text-sm text-gray-700 dark:text-gray-300">${contato.assunto}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                ${new Date(contato.data_contato).toLocaleDateString('pt-BR')}
                            </p>
                            <div class="mt-2 space-x-1">
                                <button onclick="dashboard.marcarComoLido('${contato.id}', 'contatos')" 
                                        class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="dashboard.excluirItem('${contato.id}', 'contatos')" 
                                        class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadAgendamentos() {
        const search = document.getElementById('agendamentos-search')?.value || '';
        const filter = document.getElementById('agendamentos-filter')?.value || '';
        
        let query = 'tables/agendamentos?limit=50';
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (filter) query += `&filter=status:${filter}`;

        try {
            const response = await fetch(query);
            const data = await response.json();
            this.renderAgendamentosList(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }

    renderAgendamentosList(agendamentos) {
        const container = document.getElementById('agendamentos-list');
        
        if (agendamentos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-calendar-alt text-4xl mb-2"></i>
                    <p>Nenhum agendamento encontrado</p>
                </div>
            `;
            return;
        }

        const html = agendamentos.map(agendamento => {
            const data = new Date(agendamento.data_preferencial).toLocaleDateString('pt-BR');
            const hora = agendamento.hora_preferencial;
            const statusClass = `status-${agendamento.status || 'pending'}`;
            
            return `
                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <h4 class="font-semibold text-gray-800 dark:text-white">${agendamento.nome}</h4>
                                <span class="status-badge ${statusClass}">${this.getStatusLabel(agendamento.status)}</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-building mr-1"></i> ${agendamento.empresa || 'Pessoa Física'}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-calendar mr-1"></i> ${data} às ${hora}
                            </p>
                            <p class="text-sm text-gray-700 dark:text-gray-300">
                                <i class="fas fa-cogs mr-1"></i> ${this.getServiceLabel(agendamento.servico)}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                Agendado em: ${new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                            </p>
                            <div class="mt-2 space-x-1">
                                <button onclick="dashboard.confirmarAgendamento('${agendamento.id}')" 
                                        class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="dashboard.cancelarAgendamento('${agendamento.id}')" 
                                        class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadPropostas() {
        const search = document.getElementById('propostas-search')?.value || '';
        const filter = document.getElementById('propostas-filter')?.value || '';
        
        let query = 'tables/propostas?limit=50';
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (filter) query += `&filter=status:${filter}`;

        try {
            const response = await fetch(query);
            const data = await response.json();
            this.renderPropostasList(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
        }
    }

    renderPropostasList(propostas) {
        const container = document.getElementById('propostas-list');
        
        if (propostas.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-file-contract text-4xl mb-2"></i>
                    <p>Nenhuma proposta encontrada</p>
                </div>
            `;
            return;
        }

        const html = propostas.map(proposta => {
            const statusClass = `status-${proposta.status || 'new'}`;
            const orcamento = this.getOrcamentoLabel(proposta.orcamento_referencia);
            
            return `
                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <h4 class="font-semibold text-gray-800 dark:text-white">${proposta.nome}</h4>
                                <span class="status-badge ${statusClass}">${this.getStatusLabel(proposta.status)}</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-building mr-1"></i> ${proposta.empresa || 'Pessoa Física'}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-tag mr-1"></i> ${this.getTipoNegocioLabel(proposta.tipo_negocio)}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <i class="fas fa-money-bill mr-1"></i> ${orcamento}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                <i class="fas fa-clock mr-1"></i> Prazo: ${proposta.prazo_estimado || 'Não especificado'}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                Enviada em: ${new Date(proposta.data_proposta).toLocaleDateString('pt-BR')}
                            </p>
                            ${proposta.valor_proposta ? `
                                <p class="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                                    R$ ${parseFloat(proposta.valor_proposta).toLocaleString('pt-BR')}
                                </p>
                            ` : ''}
                            <div class="mt-2 space-x-1">
                                <button onclick="dashboard.verProposta('${proposta.id}')" 
                                        class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="dashboard.enviarProposta('${proposta.id}')" 
                                        class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Métodos auxiliares
    getStatusLabel(status) {
        const labels = {
            novo: 'Novo',
            em_atendimento: 'Em Atendimento',
            respondido: 'Respondido',
            finalizado: 'Finalizado',
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            cancelado: 'Cancelado',
            realizado: 'Realizado',
            analise: 'Em Análise',
            proposta_enviada: 'Proposta Enviada',
            aceito: 'Aceito',
            negociacao: 'Em Negociação'
        };
        return labels[status] || status;
    }

    getServiceLabel(service) {
        const labels = {
            manutencao: 'Manutenção',
            automacao: 'Automação',
            desenvolvimento_web: 'Desenvolvimento Web',
            infraestrutura: 'Infraestrutura',
            consultoria: 'Consultoria',
            outro: 'Outro'
        };
        return labels[service] || service;
    }

    getTipoNegocioLabel(tipo) {
        const labels = {
            novo_site: 'Novo Site',
            reforma_site: 'Reforma de Site',
            sistema_web: 'Sistema Web',
            ecommerce: 'E-commerce',
            app: 'Aplicativo',
            outro: 'Outro'
        };
        return labels[tipo] || tipo;
    }

    getOrcamentoLabel(orcamento) {
        const labels = {
            ate_1000: 'Até R$ 1.000',
            '1000_5000': 'R$ 1.000 a R$ 5.000',
            '5000_10000': 'R$ 5.000 a R$ 10.000',
            acima_10000: 'Acima de R$ 10.000',
            sem_restricao: 'Sem restrição'
        };
        return labels[orcamento] || orcamento;
    }

    // Métodos de ação
    async marcarComoLido(id, table) {
        try {
            await fetch(`tables/${table}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'finalizado' })
            });
            this.showToast('Marcado como lido com sucesso!', 'success');
            this.loadSectionData(this.currentSection);
        } catch (error) {
            this.showToast('Erro ao marcar como lido', 'error');
        }
    }

    async excluirItem(id, table) {
        if (confirm('Deseja realmente excluir este item?')) {
            try {
                await fetch(`tables/${table}/${id}`, {
                    method: 'DELETE'
                });
                this.showToast('Item excluído com sucesso!', 'success');
                this.loadSectionData(this.currentSection);
            } catch (error) {
                this.showToast('Erro ao excluir item', 'error');
            }
        }
    }

    async confirmarAgendamento(id) {
        try {
            await fetch(`tables/agendamentos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmado' })
            });
            this.showToast('Agendamento confirmado com sucesso!', 'success');
            this.loadAgendamentos();
        } catch (error) {
            this.showToast('Erro ao confirmar agendamento', 'error');
        }
    }

    async cancelarAgendamento(id) {
        if (confirm('Deseja realmente cancelar este agendamento?')) {
            try {
                await fetch(`tables/agendamentos/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelado' })
                });
                this.showToast('Agendamento cancelado com sucesso!', 'success');
                this.loadAgendamentos();
            } catch (error) {
                this.showToast('Erro ao cancelar agendamento', 'error');
            }
        }
    }

    verProposta(id) {
        // Implementar visualização detalhada da proposta
        alert(`Visualizar proposta ${id} - funcionalidade em desenvolvimento`);
    }

    enviarProposta(id) {
        // Implementar envio de proposta
        alert(`Enviar proposta ${id} - funcionalidade em desenvolvimento`);
    }

    showToast(message, type = 'info') {
        // Criar container de notificações se não existir
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border-l-4 transition-all duration-300 transform`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const colors = {
            success: 'border-green-500',
            error: 'border-red-500',
            warning: 'border-yellow-500',
            info: 'border-blue-500'
        };

        toast.className += ` ${colors[type]}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${icons[type]} text-xl mr-3 text-gray-700 dark:text-gray-300"></i>
                <p class="text-gray-700 dark:text-gray-300">${message}</p>
                <button class="ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onclick="this.closest('.toast').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Auto-remove após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    startRealTimeUpdates() {
        // Atualizar dados a cada 30 segundos
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboardData();
            } else {
                this.loadSectionData(this.currentSection);
            }
        }, 30000);
    }
}

// Inicialização global
window.dashboard = new Dashboard();

// Funções globais para botões
window.confirmarAgendamento = function(id) {
    dashboard.confirmarAgendamento(id);
};

window.cancelarAgendamento = function(id) {
    dashboard.cancelarAgendamento(id);
};

window.verProposta = function(id) {
    dashboard.verProposta(id);
};

window.enviarProposta = function(id) {
    dashboard.enviarProposta(id);
};

window.marcarComoLido = function(id, table) {
    dashboard.marcarComoLido(id, table);
};

window.excluirItem = function(id, table) {
    dashboard.excluirItem(id, table);
};