// sw.js - Service Worker Básico (Resolve o erro do App e permite instalação)
const CACHE_NAME = 'xefan-tech-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Modo "Network First" - Sempre tenta pegar a versão mais nova da internet
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});