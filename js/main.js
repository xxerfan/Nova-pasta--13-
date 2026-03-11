// js/main.js
import { initHeaderLogic } from './modules/ui.js';
import { initCounters, initHeroTypewriter, initScrollReveal } from './modules/animations.js';

/**
 * Função Global para Carregar Componentes (Header, Footer, Chat)
 */
window.loadComponent = function(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return Promise.resolve();

    return fetch(componentPath)
        .then(res => res.text())
        .then(html => {
            element.innerHTML = html;
            
            // Inicializa a lógica do header assim que ele for injetado na tela
            if (elementId === 'header') {
                initHeaderLogic();
            }
        })
        .catch(err => console.warn(`Erro no componente: ${componentPath}`, err));
}

// Inicialização Global
document.addEventListener('DOMContentLoaded', () => {
    // Liga as animações gerais
    initCounters();
    initHeroTypewriter();
    initScrollReveal();

    // Regista o Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/sw.js').catch(err => console.log('SW Falhou', err));
    }
});