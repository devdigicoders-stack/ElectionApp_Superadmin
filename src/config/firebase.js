import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import apiClient from '../services/apiClient';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDAk7btG-dpz1dZiUVQbTBQJJHr07LPn-E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'device-streaming-3d1aacd5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'device-streaming-3d1aacd5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'device-streaming-3d1aacd5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '726097401892',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:726097401892:web:3271125037d83381d260b1',
};

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

let messagingInstance = null;

export async function getFirebaseMessaging() {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messagingInstance = getMessaging(firebaseApp);
      return messagingInstance;
    }
  } catch (err) {
    console.warn('Firebase Messaging is not supported in this browser environment:', err);
  }
  return null;
}

/**
 * Request notification permission from browser, obtain FCM Web Token,
 * and register it with the backend for real-time notifications.
 */
export async function requestNotificationPermissionAndGetToken() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, error: 'Notifications not supported by this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied or dismissed.' };
    }

    // Register service worker if not already registered
    let swRegistration;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { success: false, error: 'Firebase messaging instance unavailable.' };
    }

    // Retrieve FCM Web Token with VAPID Key support
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
      ...(vapidKey ? { vapidKey } : {}),
    });

    if (token) {
      localStorage.setItem('fcm_web_token', token);
      // Register with backend
      try {
        await apiClient.post('/super-admin/notifications/register-fcm-token', { token });
      } catch (e) {
        console.warn('Could not register FCM token with backend:', e);
      }
      return { success: true, token };
    } else {
      return { success: false, error: 'Failed to retrieve FCM token.' };
    }
  } catch (err) {
    console.error('Error requesting FCM notification permission:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Listen for foreground push messages
 */
export function onForegroundMessage(callback) {
  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        if (callback) callback(payload);
      });
    }
  });
}
