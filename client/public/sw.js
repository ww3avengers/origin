/*
  Minimal Service Worker for production-only registration.
  - No fetch interception (avoids caching pitfalls)
  - Immediate activation & control on update
  - Safe default for apps not relying on offline behavior
*/

/* global self */
const SW_VERSION = 'v1';

self.addEventListener('install', (event) => {
  // Activate updated SW immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients as soon as possible
  event.waitUntil(self.clients.claim());
});

// Intentionally no fetch handler: pass-through to network
// If you need offline caching later, implement a fetch strategy here.

self.addEventListener('message', (event) => {
  if (!event || !event.data) return;
  const { type } = event.data;
  if (type === 'SW_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }
});
