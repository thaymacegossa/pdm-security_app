import { db } from '@config/firebaseConfig';
import { devLog } from '@utils/dev-log';
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.',
    );
  }
  return db;
}

export async function saveUserProfile(userId: string, profile: { 
    cpf: string;
    name: string;
    phone: string;
    password_emerg: string | null;
}) {
    try {
        const database = requireDb();
        const userRef = doc(database, "users", userId);
        await setDoc(
            userRef, 
            {
                ...profile,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            },
            { merge: true },
        );
        devLog('[saveUserProfile] perfil salvo', { userId });
    } catch (error) {
        devLog('[saveUserProfile] erro', error);
        throw error;
    }
}

export async function getUserProfile(userId: string) {
    try {
        const database = requireDb();
        const userRef = doc(database, "users", userId);
        const snap = await getDoc(userRef);
        return snap.exists() ? snap.data() : null;
    } catch (error) {
    devLog("[getUserProfile] erro", error);
    throw error;
    }
}
