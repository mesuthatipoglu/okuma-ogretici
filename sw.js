/**
 * Türkçe Okuma Öğretici - Service Worker
 * Offline çalışma için tüm uygulama dosyalarını önbelleğe alır
 */

var CACHE_NAME = 'okuma-ogretici-v2.1.0-202610200030';

var ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'favicon.ico',
    'favicon.png',
    'css/main.css',
    'js/data.js',
    'js/utils.js',
    'js/audio.js',
    'js/progress.js',
    'js/svg-letters.js',
    'js/app.js',
    'js/games/base-game.js',
    'js/games/letter-learn.js',
    'js/games/first-letter.js',
    'js/games/balloon-pop.js',
    'js/games/letter-hunt.js',
    'js/games/letter-paint.js',
    'js/games/letter-match.js',
    'js/games/letter-sort.js',
    'js/games/syllable-train.js',
    'js/games/syllable-wheel.js',
    'js/games/syllable-match.js',
    'js/games/syllable-pop.js',
    'js/games/syllable-box.js',
    'js/games/missing-syllable.js',
    'js/games/word-puzzle.js',
    'js/games/word-match.js',
    'js/games/word-hunt.js',
    'js/games/word-memory.js',
    'js/games/number-learn.js',
    'js/games/number-count.js',
    'js/games/number-order.js',
    'js/games/number-pop.js',
    'js/games/sentence-train.js',
    'js/games/story-reader.js',
    'js/games/shadow-match.js',
    'js/games/odd-one-out.js',
    'assets/images/icons/icon.png',
    'assets/images/icons/icon-512.png',
    'assets/images/icons/icon-192.png',
    'assets/images/icons/icon-144.png',
    'assets/images/icons/icon-96.png',
    'assets/images/icons/icon-72.png',
    'assets/images/icons/icon-48.png',
    'assets/images/icons/icon-32.png',
    'assets/images/icons/icon-16.png',
    'assets/images/icons/favicon.png',
    'assets/images/icons/icon.svg'
];

// Yükleme: Tüm dosyaları tek tek önbelleğe al (biri başarısız olsa bile diğerleri kaydedilsin)
self.addEventListener('install', function (event) {
    console.log('[SW] Kuruluyor...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('[SW] Dosyalar önbelleğe alınıyor (' + ASSETS_TO_CACHE.length + ' dosya)...');
            return Promise.all(
                ASSETS_TO_CACHE.map(function (url) {
                    return cache.add(url).catch(function (err) {
                        console.warn('[SW] Dosya önbelleğe alınamadı (' + url + '):', err);
                    });
                })
            );
        }).then(function () {
            console.log('[SW] Tüm dosyalar önbelleğe alındı, skipWaiting yapılıyor.');
            return self.skipWaiting();
        })
    );
});

// Aktivasyon: Eski önbellekleri temizle ve istemcileri hemen sahiplen
self.addEventListener('activate', function (event) {
    console.log('[SW] Aktif ediliyor...');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (name) {
                    return name.startsWith('okuma-ogretici-') && name !== CACHE_NAME;
                }).map(function (name) {
                    console.log('[SW] Eski önbellek siliniyor:', name);
                    return caches.delete(name);
                })
            );
        }).then(function () {
            return self.clients.claim();
        }).then(function () {
            // Açık tüm sayfalara çevrimdışı hazır mesajı gönder
            return self.clients.matchAll({ includeUncontrolled: true });
        }).then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({ type: 'SW_OFFLINE_READY' });
            });
        })
    );
});

// Fetch: Önce önbelleğe bak (Cache-First), yoksa ağdan çek; ağ yoksa çevrimdışı fallback sağla
self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;

    var url = event.request.url;
    // Yalnızca http/https isteklerini işle (chrome-extension:// vb. hariç)
    if (!url.startsWith('http://') && !url.startsWith('https://')) return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(function (cachedResponse) {
            if (cachedResponse) {
                // Önbellekten hemen servis et (0ms gecikme, tam çevrimdışı)
                return cachedResponse;
            }

            // Önbellekte yoksa ağdan al ve önbelleğe kopyala
            return fetch(event.request).then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    var responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(function () {
                // Ağ hatası (sunucu kapalı veya internet yok)
                // Eğer sayfa geçişi / HTML isteğiyse index.html döndür
                if (event.request.mode === 'navigate' ||
                    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
                    return caches.match('index.html', { ignoreSearch: true })
                        .then(function (htmlRes) {
                            return htmlRes || caches.match('./', { ignoreSearch: true });
                        });
                }
                return new Response('Offline', { status: 503, statusText: 'Çevrimdışı' });
            });
        })
    );
});
