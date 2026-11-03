const C = 'kanji-shell-v1';
const SHELL = ['./', 'index.html', 'firebase-config.js', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const cdn = ['www.gstatic.com', 'fonts.gstatic.com', 'fonts.googleapis.com'].includes(u.hostname);
  if (u.origin === location.origin) {
    // 앱 파일: 네트워크 우선, 오프라인이면 캐시
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(h => h || caches.match('index.html'))));
  } else if (cdn) {
    // 라이브러리·폰트: 캐시 우선
    e.respondWith(caches.match(e.request).then(h => h || fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); }
      return r;
    })));
  }
});
