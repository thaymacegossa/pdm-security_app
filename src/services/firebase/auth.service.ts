import { auth, db } from '@config/firebaseConfig';
import { devLog } from '@utils/dev-log';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getUserProfile } from './user.service';

function requireAuth() {
  if (!auth) {
    throw new Error(
      'Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.',
    );
  }
  return auth;
}

function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.',
    );
  }
  return db;
}

export type FirebaseLoginResponse = {
  token: string;
  userId: string;
  displayName: string;
  riskLevel: 'standard' | 'elevated';
};

export async function getEmailByCpf(cpf: string): Promise<string> {
  try {
    const database = requireDb();
    const q = query(collection(database, 'users'), where('cpf', '==', cpf));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('CPF não encontrado');
    }
    const data = snapshot.docs[0].data();
    if (!data.email) {
      throw new Error('Email não cadastrado para este usuário');
    }
    return data.email as string;
  } catch (error) {
    devLog('[getEmailByCpf] erro ao buscar CPF', error);
    throw error;
  }
}

export async function loginWithEmailOrCpf(
  emailOuCpf: string,
  password: string,
): Promise<FirebaseLoginResponse> {
  try {
    const email = emailOuCpf.includes('@')
      ? emailOuCpf
      : await getEmailByCpf(emailOuCpf);

    devLog('[loginWithEmailOrCpf] autenticando com', { email });

    const authClient = requireAuth();
    const credential = await signInWithEmailAndPassword(authClient, email, password);
    const user = credential.user;

    const profile = await getUserProfile(user.uid);

    const response: FirebaseLoginResponse = {
      token: await user.getIdToken(),
      userId: user.uid,
      displayName: profile?.name || user.displayName || 'Usuário',
      riskLevel: 'standard',
    };

    devLog('[loginWithEmailOrCpf] login bem-sucedido', { userId: user.uid });
    return response;
  } catch (error) {
    devLog('[loginWithEmailOrCpf] erro', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const authClient = requireAuth();
    await authClient.signOut();
    devLog('[logout] usuário desconectado');
  } catch (error) {
    devLog('[logout] erro', error);
    throw error;
  }
}
