import { listarProdutosAtivos } from '../services/produtosService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as animações se o AOS estiver carregado
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });

    const grid = document.getElementById('servicos-grid');
    const spinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const filterTabsContainer = document.getElementById('servicos-filters');
    const searchInput = document.getElementById('search-servicos');

    if(!grid) return; // Segurança

    // Chama o serviço isolado (passando null para trazer todos)
    listarProdutosAtivos(null, (snapshot) => {
        spinner.classList.add('hidden');
        grid.innerHTML = '';
        const categoriasUnicas = new Set();

        if (snapshot.empty) {
            noResults.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');

        snapshot.forEach((doc, index) => {
            const p = doc.data();
            if(p.categoria) categoriasUnicas.add(p.categoria);
            
            const precoF = parseFloat(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            const pJsonStr = encodeURIComponent(JSON.stringify(p));

            // Cartão de Produto
            const cardHTML = `
            <div class="servico-item bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1 flex flex-col cursor-pointer" data-cat="${p.categoria}" data-name="${p.nome.toLowerCase()}" onclick="window.abrirDetalhesProduto('${pJsonStr}')" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="relative h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                    ${p.imagem ? `<img src="${p.imagem}" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${p.nome}">` : `<i class="fas fa-box text-5xl text-gray-700"></i>`}
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <span class="inline-block px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-bold uppercase w-max mb-3">${p.categoria}</span>
                    <h3 class="font-bold text-white text-base mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">${p.nome}</h3>
                    <p class="text-2xl font-black text-orange-500 mt-auto">${p.sob_consulta ? '<span class="text-sm">Sob Consulta</span>' : 'R$ ' + precoF}</p>
                </div>
            </div>`;
            
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Gera as abas de filtro dinamicamente
        if (filterTabsContainer) {
            filterTabsContainer.innerHTML = `<button class="filter-tab active whitespace-nowrap" data-cat="all">Todos os Produtos</button>`;
            categoriasUnicas.forEach(cat => {
                filterTabsContainer.innerHTML += `<button class="filter-tab whitespace-nowrap" data-cat="${cat}">${cat}</button>`;
            });

            document.querySelectorAll('.filter-tab').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    aplicarFiltros();
                });
            });
        }
        aplicarFiltros();
        // Atualiza animações após injetar o HTML
        if(typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 200);
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

// Funções Globais do Modal da Loja
window.abrirDetalhesProduto = function(jsonStr) {
    const p = JSON.parse(decodeURIComponent(jsonStr));
    const modal = document.getElementById('modal-detalhes');
    if(!modal) return;
    
    document.getElementById('detalhe-categoria').innerText = p.categoria;
    document.getElementById('detalhe-nome').innerText = p.nome;
    document.getElementById('detalhe-descricao').innerText = p.descricao && p.descricao.trim() !== "" ? p.descricao : "Mais informações disponíveis no contacto.";

    const elPreco = document.getElementById('detalhe-preco');
    if (p.sob_consulta) { elPreco.innerHTML = `Sob Consulta`; } 
    else { elPreco.innerText = `R$ ${parseFloat(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`; }

    const elImagem = document.getElementById('detalhe-imagem');
    const elImagemBlur = document.getElementById('detalhe-imagem-blur');
    const elIcone = document.getElementById('detalhe-icone');

    if (p.imagem && p.imagem.trim() !== "") {
        elImagem.style.backgroundImage = `url('${p.imagem}')`;
        if(elImagemBlur) elImagemBlur.style.backgroundImage = `url('${p.imagem}')`;
        elImagem.classList.remove('hidden'); if(elImagemBlur) elImagemBlur.classList.remove('hidden');
        elIcone.classList.add('hidden');
    } else {
        elImagem.classList.add('hidden'); if(elImagemBlur) elImagemBlur.classList.add('hidden');
        elIcone.classList.remove('hidden');
    }

    const msgWpp = `Olá! Gostaria de saber mais sobre o produto: ${p.nome}`;
    document.getElementById('detalhe-wpp-btn').href = `https://wa.me/5521984197719?text=${encodeURIComponent(msgWpp)}`;

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

// Fecha o modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-detalhes');
    if (modal && !modal.classList.contains('hidden') && e.target === modal) {
        window.fecharDetalhes();
    }
});