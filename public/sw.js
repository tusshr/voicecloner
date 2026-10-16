// Vocalis service worker. Keep it small.
// Build files (/_next/static/, names change on each build): cache first.
// Everything else (pages, the voice worker, icons): network first, cached copy only when offline.
// The voice model has its own cache (pocket-tts-models-v1). This file does not touch it.
// Change CACHE when this file changes, so old copies are deleted.
const CACHE = 'vocalis-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add('/')))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => key.startsWith('vocalis-') && key !== CACHE).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  const save = (response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)) }
    return response
  }

  if (new URL(request.url).pathname.startsWith('/_next/static/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then(save)))
    return
  }
  event.respondWith(fetch(request).then(save).catch(() =>
    caches.match(request).then((hit) => hit || (request.mode === 'navigate' ? caches.match('/') : Response.error()))))
})
