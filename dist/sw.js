const CACHE_NAME = 'renkonet-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta
        if (response) {
          return response
        }

        return fetch(event.request).then(
          (response) => {
            // Verificar si recibimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // IMPORTANTE: Clonar la respuesta. Una respuesta es un stream
            // y porque queremos que el navegador consuma la respuesta
            // así como el cache la consuma, necesitamos clonarla
            // para que tengamos dos streams.
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          }
        )
      })
  )
})

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de RenkoNet',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('RenkoNet', options)
  )
})

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    // Abrir la aplicación
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
    event.notification.close()
  } else {
    // Click en la notificación principal
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Aquí puedes sincronizar datos cuando la conexión se restaure
  return fetch('/api/sync')
    .then((response) => response.json())
    .then((data) => {
      console.log('Sincronización completada:', data)
    })
    .catch((error) => {
      console.log('Error en sincronización:', error)
    })
}

