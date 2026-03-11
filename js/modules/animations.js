// js/modules/animations.js

export function initCounters() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.counter, 10);
                const suffix = el.dataset.suffix || '';
                let start = null;
                const step = ts => {
                    if (!start) start = ts;
                    const progress = Math.min((ts - start) / 2000, 1);
                    el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target) + suffix;
                    if (progress < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
                };
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-counter]').forEach(c => observer.observe(c));
}

class TypeWriter {
    constructor(el, textos) { this.el = el; this.textos = textos; this.index = 0; this.char = 0; this.modo = 'escrever'; this.loop(); }
    loop() {
        const txt = this.textos[this.index];
        if (this.modo === 'escrever') {
            this.el.textContent = txt.slice(0, ++this.char);
            if (this.char === txt.length) { this.modo = 'pausar'; setTimeout(() => { this.modo = 'apagar'; this.loop(); }, 2500); } 
            else setTimeout(() => this.loop(), 40 + Math.random() * 20);
        } else if (this.modo === 'apagar') {
            this.el.textContent = txt.slice(0, --this.char);
            if (this.char === 0) { this.modo = 'escrever'; this.index = (this.index + 1) % this.textos.length; setTimeout(() => this.loop(), 400); } 
            else setTimeout(() => this.loop(), 25);
        }
    }
}

export function initHeroTypewriter() {
    const el = document.getElementById('hero-texto-animado');
    if (el) new TypeWriter(el, ['Transforme seu negócio com tecnologia', 'Automação inteligente', 'Desenvolvimento Web Profissional']);
}

export function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { 
                entry.target.classList.add('revealed'); 
                observer.unobserve(entry.target); 
            } 
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal], .stagger-children').forEach(el => observer.observe(el));
}