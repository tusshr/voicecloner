// Vocalis service worker. Keep it small.
// Pages: network first, cached copy when offline. Build files: cache first (their names change on each build).
// The voice model has its own cache (pocket-tts-models-v1). This file does not touch it.
const CACHE = 'vocalis-v0.5.0'

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

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(save).catch(() =>
      caches.match(request).then((hit) => hit || caches.match('/'))))
    return
  }
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then(save)))
})
