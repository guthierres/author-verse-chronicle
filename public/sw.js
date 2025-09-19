// Simple service worker to prevent 404 errors
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Don't cache anything for now to prevent routing issues
self.addEventListener('fetch', (event) => {
  // Let all requests pass through
  return;
});