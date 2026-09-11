// Firebase Messaging Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyDAk7btG-dpz1dZiUVQbTBQJJHr07LPn-E',
  authDomain: 'device-streaming-3d1aacd5.firebaseapp.com',
  projectId: 'device-streaming-3d1aacd5',
  storageBucket: 'device-streaming-3d1aacd5.firebasestorage.app',
  messagingSenderId: '726097401892',
  appId: '1:726097401892:web:3271125037d83381d260b1',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Platform Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
    vibrate: [300, 100, 300],
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Generic Web Push fallback listener
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.notification?.title || data.data?.title || 'Platform Notification';
      const options = {
        body: data.notification?.body || data.data?.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        vibrate: [300, 100, 300],
        data: data.data || {},
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // already handled by messaging.onBackgroundMessage
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.actionUrl || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
