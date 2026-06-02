import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

function sanitizeEnvValue(value?: string): string | undefined {
    if (!value) return value;

    let sanitized = value.trim();

    while (sanitized.endsWith(',')) {
        sanitized = sanitized.slice(0, -1).trim();
    }

    if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
        sanitized = sanitized.slice(1, -1);
    }

    return sanitized;
}

const USE_FIREBASE = sanitizeEnvValue(process.env.EXPO_PUBLIC_USE_FIREBASE) === 'true';
const appStorage = createAsyncStorage('app');
const getReactNativePersistenceFn = (
    FirebaseAuth as { getReactNativePersistence?: (storage: unknown) => unknown }
).getReactNativePersistence;

let db: ReturnType<typeof getFirestore> | null = null;
let auth: Auth | null = null;

if (USE_FIREBASE) {
    const firebaseConfig = {
        apiKey: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
        authDomain: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
        projectId: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
        storageBucket: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
        messagingSenderId: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
        appId: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
        measurementId: sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID),
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

    db = getFirestore(app);

    if (Platform.OS === 'web') {
        auth = getAuth(app);
    } else {
        try {
            if (!getReactNativePersistenceFn) {
                auth = getAuth(app);
            } else {
                auth = initializeAuth(app, {
                    persistence: getReactNativePersistenceFn(appStorage) as never,
                });
            }
        } catch (error: unknown) {
            const authError = error as { code?: string };
            if (authError.code === 'auth/already-initialized') {
                auth = getAuth(app);
            } else {
                throw error;
            }
        }
    }
}

export { auth, db };

