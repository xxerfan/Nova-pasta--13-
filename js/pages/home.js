import { listarServicosDestaque } from '../services/servicosService.js';
import { listarPortfolioRecente } from '../services/portfolioService.js';
import { listarProdutosAtivos } from '../services/produtosService.js';
import { listarArtigosRecentes } from '../services/blogService.js';
import { registrarVisitaSite } from '../services/analyticsService.js';

// Função de Debounce global para o AOS.refresh()
let aosTimer = null;
function refreshAOSDebounced() {
    clearTimeout(aosTimer);
    aosTimer = setTimeout(() => {
        if(typeof AOS !== 'undefined') AOS.refresh();
    }, 250);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Registar visita
    registrarVisitaSite();

    // 2. Carregar 3 Serviços em Destaque
    listarServicosDestaque(3, (snapshot) => {
        const grid = document.getElementById('home-servicos-grid');
        if(!grid) return;
        grid.innerHTML = '';
        
        if (snapshot.empty) { 
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Nenhum serviço em destaque.</p>'; 
            return; 
        }

        snapshot.forEach((doc, index) => {
            const s = doc.data();
            let corGradiente = 'from-gray-600 to-gray-800'; 
            let icone = 'fa-tools'; 
            const catL = s.categoria ? s.categoria.toLowerCase() : "";
            
            if(catL.includes('computador') || catL.includes('manuten')) { corGradiente = 'from-blue-600 to-blue-800'; icone = 'fa-laptop'; }
            else if(catL.includes('smart') || catL.includes('celular')) { corGradiente = 'from-orange-500 to-orange-700'; icone = 'fa-mobile-alt'; }
            else if(catL.includes('automação') || catL.includes('projeto')) { corGradiente = 'from-purple-600 to-purple-800'; icone = 'fa-robot'; }
            
            let linhas = s.descricao ? s.descricao.split('\n').filter(l => l.trim() !== '') : [];
            let textoTopo = linhas.length > 0 ? linhas[0] : "Serviço especializado.";
            
            const cardHTML = `
            <div class="servico-item servico-card-pro bg-gray-800 rounded-3xl overflow-hidden flex flex-col h-full border border-gray-700/50 cursor-pointer hover:border-orange-500/50 transition-colors" onclick="window.location.href='servicos.html'" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="bg-gradient-to-br ${corGradiente} p-6 flex flex-col gap-4 min-h-[160px]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl shrink-0"><i class="fas ${icone}"></i></div>
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-white/70">${s.categoria}</span>
                            <h3 class="text-xl font-bold text-white leading-tight line-clamp-2">${s.nome}</h3>
                        </div>
                    </div>
                    <p class="text-sm text-white/90 leading-snug line-clamp-2">${textoTopo}</p>
                </div>
                <div class="p-6 flex-1 flex flex-col bg-gray-800 text-center">
                     <div class="text-2xl font-black text-orange-500 mt-4">${s.sob_orcamento ? 'Sob Consulta' : 'R$ ' + parseFloat(s.preco_base || 0).toLocaleString('pt-BR')}</div>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        refreshAOSDebounced();
    });

    // 3. Carregar 3 Projetos do Portfólio
    listarPortfolioRecente(3, (snapshot) => {
        const grid = document.getElementById('home-portfolio-grid');
        if(!grid) return;
        grid.innerHTML = '';
        
        if (snapshot.empty) { 
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Nenhum projeto cadastrado.</p>'; 
            return; 
        }

        snapshot.forEach((docSnap, index) => {
            const p = docSnap.data();
            const cardHTML = `
            <div class="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700/50 group cursor-pointer hover:border-orange-500/50 transition-all shadow-md" onclick="window.location.href='projeto.html?id=${docSnap.id}'" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="relative h-48 overflow-hidden">
                    <img src="${p.imagem}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt="${p.titulo}">
                    <div class="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">${p.categoria}</div>
                </div>
                <div class="p-6 bg-gray-800">
                    <h3 class="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">${p.titulo}</h3>
                    <div class="flex items-center text-blue-400 text-sm font-bold mt-4">
                        Ver Detalhes do Projeto <i class="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
                    </div>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        refreshAOSDebounced();
    });

    // 4. Carregar 4 Produtos na Loja
    listarProdutosAtivos(4, (snapshot) => {
        const grid = document.getElementById('home-produtos-grid');
        if(!grid) return;
        grid.innerHTML = '';
        
        if (snapshot.empty) { 
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Nenhum produto cadastrado.</p>'; 
            return; 
        }

        snapshot.forEach((docSnap, index) => {
            const p = docSnap.data();
            const precoF = parseFloat(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            const cardHTML = `
            <div class="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1 flex flex-col cursor-pointer" onclick="window.location.href='produtos.html'" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="relative h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                    ${p.imagem ? `<img src="${p.imagem}" loading="lazy" class="absolute inset-0 w-full h-full object-cover" alt="${p.nome}">` : `<i class="fas fa-box text-5xl text-gray-700"></i>`}
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <span class="inline-block px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-bold uppercase w-max mb-3">${p.categoria}</span>
                    <h3 class="font-bold text-white text-base mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">${p.nome}</h3>
                    <p class="text-2xl font-black text-orange-500 mt-auto">${p.sob_consulta ? '<span class="text-sm">Sob Consulta</span>' : 'R$ ' + precoF}</p>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        refreshAOSDebounced();
    });

    // 5. Carregar Últimos 3 Artigos do Blog
    listarArtigosRecentes(3, (snapshot) => {
        const grid = document.getElementById('home-blog-grid');
        if(!grid) return;
        grid.innerHTML = '';
        
        if (snapshot.empty) { 
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Nenhum artigo publicado.</p>'; 
            return; 
        }

        snapshot.forEach((docSnap, index) => {
            const post = docSnap.data();
            const dataBr = new Date(post.data).toLocaleDateString('pt-BR');
            const cardHTML = `
            <div class="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700/50 group cursor-pointer hover:-translate-y-2 transition-transform shadow-md flex flex-col" onclick="window.location.href='post.html?id=${docSnap.id}'" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="h-48 overflow-hidden bg-gray-900 shrink-0">
                    <img src="${post.imagem}" loading="lazy" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="${post.titulo}">
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">${dataBr}</span>
                    <h3 class="text-lg font-bold text-white mt-2 mb-4 line-clamp-2 group-hover:text-orange-400 transition-colors">${post.titulo}</h3>
                    <div class="text-green-500 text-sm font-bold flex items-center gap-2 mt-auto">
                        Ler Artigo <i class="fas fa-long-arrow-alt-right group-hover:translate-x-2 transition-transform"></i>
                    </div>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        refreshAOSDebounced();
    });
});