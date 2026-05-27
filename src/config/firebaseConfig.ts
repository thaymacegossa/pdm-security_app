import { getAnalytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const USE_FIREBASE = process.env.EXPO_PUBLIC_USE_FIREBASE === 'true';

let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (USE_FIREBASE) {
    const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    let app;
    try {
        const apps = getApps();
        app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }

    try {
        getAnalytics(app);
    } catch (error) {
        console.warn('Firebase analytics initialization warning:', error);
    }

    db = getFirestore(app);
    auth = getAuth(app);
}

export { auth, db };
