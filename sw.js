// 오프라인 사용을 위한 서비스 워커.
//  - index.html / sw.js / manifest : 인터넷이 되면 항상 새 파일을 받고(network-first), 안 되면 저장본 사용
//  - 그림(img/)              : 저장본을 먼저 쓰고 없을 때만 받음(cache-first)
// 그림 파일을 바꿨을 때만 VERSION 을 올리면 된다(코드 수정은 자동 반영).
const VERSION = 'wristgame-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './img/hand1.png', './img/hand2.png', './img/hand1_Lt.png', './img/hand2_Lt.png',
  './img/Pronation.png', './img/Pronation_Lt.png',
  './img/deviation1.png', './img/deviation2.png', './img/deviation1_Lt.png', './img/deviation2_Lt.png',
  './img/FE.png', './img/PS.png', './img/RU.png',
  './img/Flexion_dir.png', './img/Extension_dir.png', './img/Pronation_dir.png',
  './img/Supination_dir.png', './img/Ulna_dir.png', './img/Radial_dir.png',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isImg = /\/img\//.test(url.pathname);
  if (isImg) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {}); return resp; })));
  } else {
    e.respondWith(fetch(e.request).then(resp => {
      const copy = resp.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {}); return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  }
});
