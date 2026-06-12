# Skill: Progressive Web Apps & Browser APIs

## When to Use
Building offline-capable web apps, caching assets, handling background sync, push notifications, or leveraging advanced browser capabilities (File System Access, Badging, Web Share).

## Service Workers

### Registration
```ts
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}
```

### Service Worker (sw.js)
```ts
/// <reference lib="webworker" />

const CACHE_NAME = 'planner-v1';
const ASSETS = ['/', '/index.html', '/main.js', '/styles.css'];

// Install: cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;
      return fetch(e.request).then((fetchResponse) => {
        // Cache API responses for offline
        if (e.request.url.includes('/api/')) {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return fetchResponse;
      });
    })
  );
});
```

### Caching Strategies
| Strategy | When to Use | Code Pattern |
|----------|-------------|--------------|
| **Cache-first** | Static assets | `caches.match() ?? fetch()` |
| **Network-first** | Fresh API data | `fetch().catch(() => caches.match())` |
| **Stale-while-revalidate** | Balanced | Return cache immediately, update in background |

```ts
// Stale-while-revalidate
async function staleWhileRevalidate(request: Request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const networkFetch = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || networkFetch;
}
```

## Web App Manifest
```json
// public/manifest.json
{
  "name": "Planner App",
  "short_name": "Planner",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```html
<!-- index.html -->
<link rel="manifest" href="/manifest.json" />
```

## Web Workers (CPU-intensive tasks)
```ts
// worker.ts
self.onmessage = (e: MessageEvent) => {
  const { data } = e;
  const result = heavyComputation(data);
  self.postMessage(result);
};

function heavyComputation(data: number[]) {
  return data.reduce((a, b) => a + b, 0);
}
```

```ts
// main.tsx
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});

worker.postMessage([1, 2, 3, 4, 5]);
worker.onmessage = (e) => console.log('Result:', e.data);
```

## Push Notifications
```ts
// Request permission
async function subscribePush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;
  
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  
  // Send subscription to server
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}
```

## Background Sync
```ts
// Queue action when offline
async function scheduleSync(tag: string) {
  const registration = await navigator.serviceWorker.ready;
  if ('sync' in registration) {
    await (registration as any).sync.register(tag);
  }
}

// In service worker
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-tasks') {
    e.waitUntil(syncTasksToServer());
  }
});
```

## Modern Browser APIs

### Web Share API
```ts
async function share(data: ShareData) {
  if (navigator.share) {
    await navigator.share(data);
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(data.url || '');
  }
}

share({ title: 'My Task', text: 'Check this out', url: window.location.href });
```

### File System Access API
```ts
async function saveFile(data: string, filename: string) {
  const handle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  });
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}
```

### Badging API (App icon badge)
```ts
if ('setAppBadge' in navigator) {
  await (navigator as any).setAppBadge(5);
}
```

### Wake Lock (prevent screen sleep)
```ts
let wakeLock: WakeLockSentinel | null = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    wakeLock = await navigator.wakeLock.request('screen');
  }
}
```

## Checklist
- [ ] Service worker registered and caching assets.
- [ ] Manifest.json present with correct icons and theme colors.
- [ ] App works offline (test in DevTools → Application → Service Workers → Offline).
- [ ] Background sync handles queued actions when connectivity returns.
- [ ] Push notifications implemented with permission handling.
- [ ] Heavy computations offloaded to Web Workers.
- [ ] Install prompt handled gracefully (don't show immediately on page load).
- [ ] Lighthouse PWA audit passes (90+ score).
