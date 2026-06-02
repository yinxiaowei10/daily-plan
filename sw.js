/**
 * DailyPlan Service Worker
 * PWA 离线支持
 */

const CACHE_NAME = 'dailyplan-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/storage.js',
  '/js/pomodoro.js',
  '/js/planner.js',
  '/js/export.js',
  '/js/sync.js',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});
