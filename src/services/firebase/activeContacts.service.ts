import { db } from '@config/firebaseConfig';
import { devLog } from '@utils/dev-log';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

/*
COLECION: activeContacts
UserId - string
ActiveContactId - string (gerado automaticamente)
isActive - boolean
lastUpdated - timestamp
name - string
phone - string
relation - string | EX: "CP"
*/

function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.',
    );
  }
  return db;
}

export async function getActiveContacts(userId: string) {
    try {
        const database = requireDb();
        const activeContactsRef = collection(database, "users", userId, "activeContacts");

        const snap = await getDocs(activeContactsRef);
        return snap.empty ? null : snap.docs.map(doc => doc.data());
    } catch (error) {
        devLog("[getActiveContacts] erro", error);
        throw error;
    }
}

export async function saveActiveContacts(userId: string, contact: {
    isActive: boolean;
    name: string;
    phone: string;
    relation: string;
}) {
    try {
        const database = requireDb();
        const activeContactsRef = collection(database, "users", userId, "activeContacts");
        await addDoc(activeContactsRef, {
            ...contact,
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        devLog("[saveActiveContacts] erro", error);
        throw error;
    }
}

export async function deleteActiveContacts(userId: string, contactId: string) {
    try {
        const database = requireDb();
        const activeContactsRef = doc(database, "users", userId, "activeContacts", contactId);
        await deleteDoc(activeContactsRef);
    } catch (error) {
        devLog("[deleteActiveContacts] erro", error);
        throw error;
    }
}

export async function updateActiveContacts(userId: string, contactId: string, contact: {
    isActive: boolean;
    name: string;
    phone: string;
    relation: string;
}) {
    try {
        const database = requireDb();
        const activeContactsRef = doc(database, "users", userId, "activeContacts", contactId);
        await updateDoc(activeContactsRef, {
            ...contact,
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        devLog("[updateActiveContacts] erro", error);
        throw error;
    }
}
