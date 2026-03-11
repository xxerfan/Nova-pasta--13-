import { listarServicosAtivos } from '../services/servicosService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa AOS se existir na página
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });

    const grid = document.getElementById('servicos-grid');
    const spinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const filterTabsContainer = document.getElementById('servicos-filters');
    const searchInput = document.getElementById('search-servicos');

    if(!grid) return; // Segurança

    // Chama nosso serviço que isolou o Firebase!
    listarServicosAtivos((snapshot) => {
        spinner.classList.add('hidden');
        grid.innerHTML = '';
        const categoriasUnicas = new Set();

        if (snapshot.empty) {
            noResults.classList.remove('hidden');
            grid.classList.add('hidden');
            if(filterTabsContainer) filterTabsContainer.innerHTML = '<button class="filter-tab active whitespace-nowrap" data-cat="all">Sem Serviços</button>';
            return;
        }

        grid.classList.remove('hidden');
        noResults.classList.add('hidden');

        snapshot.forEach((doc) => {
            const s = doc.data();
            if(s.categoria) categoriasUnicas.add(s.categoria);
            
            // Definição de Cores e Ícones
            let corGradiente = 'from-blue-500 to-blue-700'; 
            let icone = 'fa-tools'; 
            const catL = s.categoria.toLowerCase();
            if(catL.includes('computador') || catL.includes('manuten')) { corGradiente = 'from-blue-600 to-blue-800'; icone = 'fa-laptop'; } 
            else if(catL.includes('smart') || catL.includes('celular') || catL.includes('tablet')) { corGradiente = 'from-orange-500 to-orange-700'; icone = 'fa-mobile-alt'; } 
            else if(catL.includes('automação') || catL.includes('projeto')) { corGradiente = 'from-purple-600 to-purple-800'; icone = 'fa-robot'; } 
            else if(catL.includes('rede') || catL.includes('energia')) { corGradiente = 'from-teal-600 to-teal-800'; icone = 'fa-bolt'; }

            // Descrição e Preço
            let linhas = s.descricao ? s.descricao.split('\n').filter(l => l.trim() !== '') : [];
            let textoTopo = linhas.length > 0 ? linhas[0] : "Serviço especializado Xerfan Tech Lab.";
            let bulletsHtml = '<div class="h-4"></div>'; 
            
            if (linhas.length > 1) {
                bulletsHtml = `<ul class="space-y-3 mb-6 flex-1 mt-6">`;
                for (let i = 1; i < Math.min(linhas.length, 6); i++) {
                    bulletsHtml += `<li class="flex items-start gap-2 text-sm text-gray-300"><i class="fas fa-check text-orange-500 mt-1 shrink-0"></i> <span class="leading-snug">${linhas[i]}</span></li>`;
                }
                bulletsHtml += `</ul>`;
            } else {
                bulletsHtml = `<div class="mb-6 flex-1 mt-6 text-sm text-gray-400 italic">Clique para saber mais...</div>`;
            }

            let precoHtml = s.sob_orcamento 
                ? `<div class="text-xl font-black text-white">Sob Consulta</div>` 
                : `<div class="text-2xl font-black text-orange-500">R$ ${parseFloat(s.preco_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>`;

            const servicoJsonStr = encodeURIComponent(JSON.stringify(s));
            let btnWppTexto = s.sob_orcamento ? 'Consultar' : 'Agendar';
            let btnIcon = s.sob_orcamento ? 'fa-comment-dots' : 'fa-calendar-alt';

            // HTML do Card
            const cardHTML = `
            <div class="servico-item servico-card-pro bg-gray-800 rounded-3xl overflow-hidden flex flex-col h-full border border-gray-700/50 cursor-pointer" data-cat="${s.categoria}" data-name="${s.nome.toLowerCase()}" onclick="window.abrirDetalhesServico('${servicoJsonStr}')">
                <div class="bg-gradient-to-br ${corGradiente} p-6 flex flex-col gap-4 min-h-[160px]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl shrink-0 shadow-inner"><i class="fas ${icone}"></i></div>
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-white/70">${s.categoria}</span>
                            <h3 class="text-xl font-bold text-white leading-tight line-clamp-2" title="${s.nome}">${s.nome}</h3>
                        </div>
                    </div>
                    <p class="text-sm text-white/90 leading-snug line-clamp-3">${textoTopo}</p>
                </div>
                <div class="p-6 flex-1 flex flex-col bg-gray-800">
                    ${bulletsHtml}
                    <div class="flex items-end justify-between mt-auto pt-4 border-t border-gray-700/50">
                        <div><span class="text-xs text-gray-400 block mb-1">${s.sob_orcamento ? 'Valor:' : 'A partir de'}</span>${precoHtml}</div>
                        <button onclick="event.stopPropagation(); window.abrirDetalhesServico('${servicoJsonStr}')" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all">
                            <i class="far ${btnIcon}"></i> ${btnWppTexto}
                        </button>
                    </div>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Abas de Filtro
        if(filterTabsContainer) {
            filterTabsContainer.innerHTML = `<button class="filter-tab active whitespace-nowrap" data-cat="all">Todos os Serviços</button>`;
            categoriasUnicas.forEach(cat => { filterTabsContainer.innerHTML += `<button class="filter-tab whitespace-nowrap" data-cat="${cat}">⚙️ ${cat}</button>`; });
            
            document.querySelectorAll('.filter-tab').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    aplicarFiltros();
                });
            });
        }
    });

    function aplicarFiltros() {
        const catAtiva = document.querySelector('.filter-tab.active')?.dataset.cat || 'all';
        const termoBusca = searchInput?.value.toLowerCase() || '';
        const cartoes = document.querySelectorAll('.servico-item');
        let visiveis = 0;

        cartoes.forEach(cartao => {
            const matchCat = (catAtiva === 'all' || cartao.dataset.cat === catAtiva);
            const matchTermo = (termoBusca === '' || cartao.dataset.name.includes(termoBusca));
            if (matchCat && matchTermo) { cartao.style.display = 'flex'; visiveis++; } 
            else { cartao.style.display = 'none'; }
        });

        if (visiveis === 0 && cartoes.length > 0) noResults.classList.remove('hidden');
        else if (cartoes.length > 0) noResults.classList.add('hidden');
    }
    
    if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
});

// Funções Globais do Modal (Anexadas ao Window para funcionar com onclick HTML)
window.abrirDetalhesServico = function(jsonStr) {
    const s = JSON.parse(decodeURIComponent(jsonStr));
    const modal = document.getElementById('modal-detalhes');
    if(!modal) return;
    
    document.getElementById('detalhe-categoria').innerText = s.categoria;
    document.getElementById('detalhe-nome').innerText = s.nome;
    document.getElementById('detalhe-descricao').innerText = s.descricao && s.descricao.trim() !== "" ? s.descricao : "Para mais detalhes, entre em contato.";

    const elPreco = document.getElementById('detalhe-preco');
    if (s.sob_orcamento) { elPreco.innerHTML = `Sob Orçamento <span class="text-sm font-medium text-gray-400 block mt-1">Valores variam.</span>`; } 
    else { elPreco.innerText = `A partir de R$ ${parseFloat(s.preco_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`; }

    // Imagem
    const elImagem = document.getElementById('detalhe-imagem');
    const elIcone = document.getElementById('detalhe-icone');
    if (s.imagem && s.imagem.trim() !== "") {
        elImagem.style.backgroundImage = `url('${s.imagem}')`;
        elImagem.classList.remove('hidden');
        elIcone.classList.add('hidden');
    } else {
        elImagem.classList.add('hidden');
        elIcone.classList.remove('hidden');
    }

    // WPP Botão
    const elBtnWpp = document.getElementById('detalhe-wpp-btn');
    elBtnWpp.href = `https://wa.me/5521984197719?text=${encodeURIComponent(`Olá! Gostaria de agendar ou solicitar um orçamento para o serviço: ${s.nome}`)}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden'; 
};

window.fecharDetalhes = function() {
    const modal = document.getElementById('modal-detalhes');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
};