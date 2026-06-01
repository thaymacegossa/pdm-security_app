import { db } from '@config/firebaseConfig';
import { devLog } from '@utils/dev-log';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp
} from "firebase/firestore";


/*
COLECION: alerts
UserId - string
AlertId - string (gerado automaticamente)
actualAlert - boolean
geolocation - geopoint | [7.0948° S, 34.84934° W]
location - string | EX:"Lot. Morada Nova, Cabedelo - PB, 58310-000"
startedAt - timestamp
*/

function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.',
    );
  }
  return db;
}

export async function getAlert(userId: string) {
    try {
        const database = requireDb();
        const alertRef = collection(database, "users", userId, "alerts");
        const alertSnap = await getDocs(alertRef);
        if (!alertSnap.empty) {
            return alertSnap.docs.map(doc => doc.data());
        } else {
            return null;
        }
    } catch (error) {
        devLog("[getAlert] erro", error);
        throw error;
    }
}

export async function saveAlert(userId: string, alertData: {
    actualAlert: boolean;
    geolocation: { latitude: number; longitude: number };
    location: string;
}) {
    try {
        const database = requireDb();
        const alertRef = collection(database, "users", userId, "alerts");
        await addDoc(alertRef, {
            ...alertData,
            startedAt: serverTimestamp(),
        });
    } catch (error) {
        devLog("[saveAlert] erro", error);
        throw error;
    }
}

export async function deleteAlert(userId: string, alertId: string) {
    try {
        const database = requireDb();
        const alertRef = doc(database, "users", userId, "alerts", alertId);
        await deleteDoc(alertRef);
    } catch (error) {
        devLog("[deleteAlert] erro", error);
        throw error;
    }
}
