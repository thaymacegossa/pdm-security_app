import { db } from '@config/firebaseConfig';
import { devLog } from '@utils/dev-log';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit as firestoreLimit,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
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
        const q = query(alertRef, orderBy('startedAt', 'desc'));
        const alertSnap = await getDocs(q);
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
    userName?: string;
}) {
    try {
        const database = requireDb();
        const alertRef = collection(database, "users", userId, "alerts");
        const docRef = await addDoc(alertRef, {
            ...alertData,
            startedAt: serverTimestamp(),
        });
        return docRef.id;
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

export function subscribeAlerts(
    userId: string,
    onChange: (alerts: any[] | null) => void,
    maxItems?: number
) {
    const database = requireDb();
    const alertsRef = collection(database, 'users', userId, 'alerts');
    const q = typeof maxItems === 'number'
        ? query(alertsRef, orderBy('startedAt', 'desc'), firestoreLimit(maxItems))
        : query(alertsRef, orderBy('startedAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
        try {
            if (!snapshot.empty) {
                onChange(snapshot.docs.map(d => d.data()));
            } else {
                onChange([]);
            }
        } catch (error) {
            devLog('[subscribeAlerts] erro ao processar snapshot', error);
            onChange(null);
        }
    }, (error) => {
        devLog('[subscribeAlerts] erro', error);
        onChange(null);
    });

    return unsub;
}
