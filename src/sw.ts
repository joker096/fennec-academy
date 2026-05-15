/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { WORDS_BY_LANG } from './data/gameData';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// Intercept widget template request to inject correct URL
registerRoute(
  ({ url }) => url.pathname.endsWith('widgets/card-template.json'),
  async ({ url }) => {
    const response = await fetch(url.href);
    const template = await response.json();
    const origin = url.origin;
    
    // Inject the correct origin into the OpenUrl action
    if (template.actions) {
      template.actions = template.actions.map((action: any) => {
        if (action.type === 'Action.OpenUrl' && action.url.includes('/flashcards')) {
          action.url = `${origin}/flashcards`;
        }
        return action;
      });
    }

    // Also update background image URL if it's hardcoded
    if (template.body && template.body[0].backgroundImage) {
      template.body[0].backgroundImage.url = `${origin}/perks/intelligence.webp`;
    }

    return new Response(JSON.stringify(template), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
);

// Intercept widget data request
registerRoute(
  ({ url }) => url.pathname.endsWith('widgets/card-data.json'),
  async () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Flatten all words for simplicity in the widget
    const allWords = Object.values(WORDS_BY_LANG).flat();
    const index = seed % allWords.length;
    const card = allWords[index];

    const data = {
      word: card.word,
      translation: card.translation,
      transcription: card.transcription || ''
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
);

// Handle widget interactions
self.addEventListener('widgetclick' as any, (event: any) => {
  if (event.verb === 'refresh') {
    // In a real app, we might update the data in a cache here
    // For now, we'll just let the browser re-fetch the data
    event.waitUntil((async () => {
      const widget = await (self as any).widgets.getById(event.widgetId);
      if (widget) {
        await (self as any).widgets.updateByTag('card-of-the-day', {
          data: 'widgets/card-data.json'
        });
      }
    })());
  }
});

// Default caching for other assets
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
