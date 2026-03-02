/**
 * Form Manager - Gerenciamento de formulários com API REST
 * Autor: Xerfan Tech Lab
 * Versão: 1.0.0
 */

class FormManager {
    constructor() {
        this.forms = {
            contato: {
                endpoint: 'tables/contatos',
                fields: ['nome', 'email', 'telefone', 'assunto', 'mensagem'],
                rules: {
                    nome: { required: true, minLength: 3 },
                    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                    telefone: { required: true, pattern: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/ },
                    assunto: { required: true },
                    mensagem: { required: true, minLength: 10 }
                }
            },
            agendamento: {
                endpoint: 'tables/agendamentos',
                fields: ['nome', 'email', 'telefone', 'empresa', 'servico', 'data_preferencial', 'hora_preferencial', 'descricao_projeto'],
                rules: {
                    nome: { required: true, minLength: 3 },
                    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                    telefone: { required: true },
                    empresa: { required: false },
                    servico: { required: true },
                    data_preferencial: { required: true },
                    hora_preferencial: { required: true },
                    descricao_projeto: { required: true, minLength: 20 }
                }
            },
            newsletter: {
                endpoint: 'tables/newsletter',
                fields: ['email', 'nome', 'interesses'],
                rules: {
                    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                    nome: { required: false, minLength: 2 }
                }
            },
            proposta: {
                endpoint: 'tables/propostas',
                fields: ['nome', 'email', 'telefone', 'empresa', 'tipo_negocio', 'orcamento_referencia', 'descricao_projeto', 'prazo_estimado'],
                rules: {
                    nome: { required: true, minLength: 3 },
                    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                    telefone: { required: true },
                    empresa: { required: false },
                    tipo_negocio: { required: true },
                    orcamento_referencia: { required: true },
                    descricao_projeto: { required: true, minLength: 30 },
                    prazo_estimado: { required: false }
                      }
            }
        };

        this.init();
    }

    init() {
        this.setupFormSubmissions();
        this.setupRealTimeValidation();
        this.setupFormatters();
    }

    setupFormSubmissions() {
        Object.keys(this.forms).forEach(formName => {
            const form = document.querySelector(`#form-${formName}`);
            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e, formName));
            }
        });
    }

    setupRealTimeValidation() {
        Object.keys(this.forms).forEach(formName => {
            const form = document.querySelector(`#form-${formName}`);
            if (form) {
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input, formName));
                    input.addEventListener('input', () => this.clearError(input));
                });
            }
        });
    }

    setupFormatters() {
        document.querySelectorAll('input[data-format]").forEach(input => {
            const format = input.getAttribute('data-format');
            input.addEventListener('input', (e) => {
                e.target.value = this.formatInput(e.target.value, format);
            });
        });
    }

    formatInput(value, format) {
        switch (format) {
            case 'phone':
                return this.formatPhone(value);
            case 'cep':
                return this.formatCEP(value);
            case 'cnpj':
                return this.formatCNPJ(value);
            case 'cpf':
                return this.formatCPF(value);
            default:
                return value;
        }
    }

    formatPhone(value) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }

    formatCEP(value) {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }

    formatCNPJ(value) {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    formatCPF(value) {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    async handleSubmit(event, formName) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validação completa do formulário
        const validation = this.validateForm(data, formName);
        
        if (!validation.valid) {
            this.showErrors(validation.errors, formName);
            return;
        }

        // Adiciona metadados
        const enrichedData = {
            ...data,
            data_cadastro: new Date().toISOString(),
            status: this.getInitialStatus(formName),
            origem: this.getOrigin()
        };

        try {
            this.showLoading(formName);
            
            const response = await fetch(this.forms[formName].endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrichedData)
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar dados');
            }

            const result = await response.json();
            this.handleSuccess(formName, result);
            
        } catch (error) {
            this.handleError(formName, error);
        } finally {
            this.hideLoading(formName);
        }
    }

    validateForm(data, formName) {
        const rules = this.forms[formName].rules;
        const errors = {};

        Object.keys(rules).forEach(field => {
            const rule = rules[field];
            const value = data[field];

            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = 'Este campo é obrigatório';
                return;
            }

            if (value && rule.minLength && value.length < rule.minLength) {
                errors[field] = `Mínimo de ${rule.minLength} caracteres`;
            }

            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = this.getPatternError(field);
            }
        });

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }

    validateField(field, formName) {
        const fieldName = field.name;
        const rules = this.forms[formName].rules[fieldName];
        
        if (!rules) return true;

        const value = field.value;
        let error = null;

        if (rules.required && (!value || value.trim() === '')) {
            error = 'Este campo é obrigatório';
        } else if (value && rules.minLength && value.length < rules.minLength) {
            error = `Mínimo de ${rules.minLength} caracteres`;
        } else if (value && rules.pattern && !rules.pattern.test(value)) {
            error = this.getPatternError(fieldName);
        }

        if (error) {
            this.showFieldError(field, error);
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    getPatternError(fieldName) {
        const errors = {
            email: 'Digite um e-mail válido',
            telefone: 'Digite um telefone válido',
            cep: 'Digite um CEP válido',
            cnpj: 'Digite um CNPJ válido',
            cpf: 'Digite um CPF válido'
        };
        return errors[fieldName] || 'Formato inválido';
    }

    getInitialStatus(formName) {
        const statuses = {
            contato: 'novo',
            agendamento: 'pendente',
            newsletter: 'ativo',
            proposta: 'novo'
        };
        return statuses[formName] || 'novo';
    }

    getOrigin() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('utm_source') || 'website';
    }

    showErrors(errors, formName) {
        const form = document.querySelector(`#form-${formName}`);
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name=${fieldName}]`);
            if (field) {
                this.showFieldError(field, errors[fieldName]);
            }
        });

        // Mostrar mensagem geral de erro
        this.showToast('Por favor, corrija os erros indicados', 'error');
    }

    showFieldError(field, error) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-sm mt-1';
        errorDiv.textContent = error;
        
        field.classList.add('border-red-500');
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    clearError(input) {
        input.classList.remove('border-red-500');
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showLoading(formName) {
        const submitBtn = document.querySelector(`#form-${formName} button[type="submit"]`);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
        }
    }

    hideLoading(formName) {
        const submitBtn = document.querySelector(`#form-${formName} button[type="submit"]`);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Enviar';
        }
    }

    async handleSuccess(formName, result) {
        const form = document.querySelector(`#form-${formName}`);
        
        // Resetar formulário
        form.reset();
        
        // Limpar erros
        form.querySelectorAll('.field-error').forEach(error => error.remove());
        form.querySelectorAll('.border-red-500').forEach(field => field.classList.remove('border-red-500'));

        // Mostrar mensagem de sucesso
        const messages = {
            contato: 'Obrigado pelo contato! Entraremos em breve.',
            agendamento: 'Agendamento realizado com sucesso! Confira seu e-mail.',
            newsletter: 'Newsletter cadastrada com sucesso!',
            proposta: 'Proposta enviada com sucesso! Entraremos em contato em breve.'
        };

        this.showToast(messages[formName] || 'Dados enviados com sucesso!', 'success');

        // Evento personalizado
        window.dispatchEvent(new CustomEvent('formSuccess', {
            detail: { formName, result }
        }));

        // Analytics/Tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'form',
                'event_label': formName
            });
        }
    }

    handleError(formName, error) {
        console.error(`Erro no formulário ${formName}:`, error);
        
        const messages = {
            contato: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
            agendamento: 'Erro ao agendar. Por favor, entre em contato diretamente.',
            newsletter: 'Erro ao cadastrar newsletter. Tente novamente mais tarde.',
            proposta: 'Erro ao enviar proposta. Tente novamente mais tarde.'
        };

        this.showToast(messages[formName] || 'Erro ao processar formulário. Tente novamente.', 'error');
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

    // Métodos auxiliares para analytics
    trackEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    // Validação de CPF e CNPJ
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;

        if (/^\d{11}$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14) return false;

        if (/^\d{14}$/.test(cnpj)) return false;

        let size = 12;
        let numbers = cnpj.substring(0, size);
        let computed = this.calculateCNJPDigit(numbers, size);

        if (computed !== cnpj.substring(size, size + 1)) return false;

        size = 13;
        numbers = cnpj.substring(0, size);
        computed = this.calculateCNJPDigit(numbers, size);

        return computed === cnpj.substring(size, size + 1);
    }

    calculateCNJPDigit(numbers, size) {
        let sum = 0;
        let pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return result.toString();
    }
}

// Inicialização global
window.FormManager = FormManager;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FormManager();
    });
} else {
    new FormManager();
}