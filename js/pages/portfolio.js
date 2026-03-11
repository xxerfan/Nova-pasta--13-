import { listarPortfolioRecente } from '../services/portfolioService.js';

// Mapas visuais para ícones e cores de gradiente
const icons = {
    "Desenvolvimento Web": 'fas fa-code', 
    "Automação Residencial": 'fas fa-robot', 
    "Infraestrutura e Redes": 'fas fa-server', 
    "Projetos AutoCAD / Elétrica": 'fas fa-drafting-compass'
};

const gradients = {
    "Desenvolvimento Web": 'from-blue-600 to-blue-800', 
    "Automação Residencial": 'from-purple-600 to-indigo-800',
    "Infraestrutura e Redes": 'from-cyan-600 to-blue-800', 
    "Projetos AutoCAD / Elétrica": 'from-orange-500 to-orange-700'
};

document.addEventListener('DOMContentLoaded', () => {
    if(typeof AOS !== 'undefined') AOS.init({ duration: 750, once: true, offset: 80 });

    const portfolioGrid = document.getElementById('portfolio-grid');
    if(!portfolioGrid) return;

    // Consome o serviço isolado
    listarPortfolioRecente(null, (snapshot) => {
        portfolioGrid.innerHTML = '';
        if (snapshot.empty) {
            portfolioGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-20">Nenhum projeto cadastrado.</p>';
            return;
        }

        snapshot.forEach((docSnap, index) => {
            const p = docSnap.data();
            const id = docSnap.id;
            const cat = p.categoria;
            const icone = icons[cat] || 'fas fa-briefcase';
            const gradiente = gradients[cat] || 'from-gray-600 to-gray-800';
            const dataAno = p.data_conclusao ? p.data_conclusao.split('-')[0] : new Date().getFullYear();

            const cardHTML = `
                <div class="portfolio-card card bg-gray-800 border-gray-700 card-body-no-padding rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-orange-500/20" 
                     data-pf="${cat}" 
                     data-aos="fade-up" 
                     data-aos-delay="${(index % 3) * 100}"
                     onclick="window.location.href='projeto.html?id=${id}'">
                    
                    <div class="relative overflow-hidden h-52 border-b border-gray-700 bg-gray-900">
                        <img src="${p.imagem}" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40" alt="${p.titulo}">
                        <div class="absolute inset-0 bg-gradient-to-br ${gradiente} opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div class="absolute inset-0 flex flex-col items-center justify-center p-6 backdrop-blur-[2px]">
                            <i class="${icone} text-4xl mb-3 text-white opacity-90 drop-shadow-md group-hover:scale-110 transition-transform"></i>
                            <p class="font-bold text-center text-white tracking-wide drop-shadow-lg">${p.titulo}</p>
                        </div>
                        <div class="overlay-details absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-5 flex flex-col justify-end">
                            <p class="text-gray-200 text-xs leading-relaxed line-clamp-3">${p.descricao}</p>
                            <div class="flex gap-2 mt-3">
                                <span class="bg-white/10 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">${p.cliente}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card-content-padding p-5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="badge ${cat.includes('Web') ? 'badge-blue' : 'badge-orange'} text-[10px]">${cat}</span>
                            <span class="text-[10px] text-gray-500 font-medium">${dataAno}</span>
                        </div>
                        <h3 class="font-bold text-white mb-1 text-sm line-clamp-1">${p.titulo}</h3>
                        <p class="text-gray-400 text-[11px] line-clamp-1">${p.cliente}</p>
                        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                            <div class="flex items-center gap-1 text-yellow-500 text-[10px]">★★★★★</div>
                            <span class="text-orange-500 hover:text-orange-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                Ver Detalhes <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
            portfolioGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        if(typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 200);
    });

    // Lógica dos Botões de Filtro
    document.getElementById('portfolio-filters')?.addEventListener('click', e => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.pf;
        document.querySelectorAll('#portfolio-grid > div[data-pf]').forEach(card => {
            card.style.display = (filter === 'all' || card.dataset.pf === filter) ? '' : 'none';
        });
        // Atualiza animações ao filtrar
        if(typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 50);
    });
});