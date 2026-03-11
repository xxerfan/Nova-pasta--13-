// js/modules/ui.js

export function initHeaderLogic() {
    const header = document.getElementById('main-header');
    const navWrapper = document.getElementById('nav-wrapper');
    const backTop = document.getElementById('back-to-top');
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    // Listener de Scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        if (scrollY > 60) {
            header?.classList.add('scrolled');
            navWrapper?.classList.add('py-0', 'bg-gray-900/95', 'shadow-md');
        } else {
            header?.classList.remove('scrolled');
            navWrapper?.classList.remove('py-0', 'bg-gray-900/95', 'shadow-md');
        }

        if (backTop) {
            if (scrollY > 400) {
                backTop.classList.remove('opacity-0', 'invisible');
                backTop.classList.add('opacity-100', 'visible');
            } else {
                backTop.classList.add('opacity-0', 'invisible');
                backTop.classList.remove('opacity-100', 'visible');
            }
        }
    }, { passive: true });

    // Voltar ao Topo
    backTop?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Toggle Menu Mobile
    let menuOpen = false;
    mobileBtn?.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
            mobileMenu?.classList.remove('hidden');
            if (menuIcon) menuIcon.className = 'fas fa-times text-base text-orange-500';
        } else {
            mobileMenu?.classList.add('hidden');
            if (menuIcon) menuIcon.className = 'fas fa-bars text-base';
        }
    });

    // Marcar Link Ativo Automaticamente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item-pro[data-page], .mobile-nav-item[data-page]').forEach(l => {
        if (l.getAttribute('data-page') === currentPage) l.classList.add('active');
    });
}