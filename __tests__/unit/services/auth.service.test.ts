import { getEmailByCpf, loginWithEmailOrCpf, logout } from '@services/auth/auth.service';
import { getUserProfile } from '@services/firebase/user.service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

let mockAuth: unknown = {
  signOut: jest.fn().mockResolvedValue(undefined),
};
let mockDb: unknown = {};

jest.mock('@config/firebaseConfig', () => ({
  get auth() {
    return mockAuth;
  },
  get db() {
    return mockDb;
  },
}));

jest.mock('@services/firebase/user.service', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  where: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
}));

const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockedSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedWhere = where as jest.MockedFunction<typeof where>;
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('auth.service', () => {
  beforeEach(() => {
    mockAuth = {
      signOut: jest.fn().mockResolvedValue(undefined),
    };
    mockDb = {};
    jest.clearAllMocks();
    mockedCollection.mockReturnValue({} as never);
    mockedWhere.mockReturnValue({} as never);
    mockedQuery.mockReturnValue({} as never);
  });

  it('getEmailByCpf retorna email encontrado', async () => {
    mockedGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ email: 'ana@email.com' }) }],
    } as never);

    const email = await getEmailByCpf('11122233344');

    expect(email).toBe('ana@email.com');
  });

  it('getEmailByCpf falha quando cpf nao existe', async () => {
    mockedGetDocs.mockResolvedValue({
      empty: true,
      docs: [],
    } as never);

    await expect(getEmailByCpf('00000000000')).rejects.toThrow('CPF não encontrado');
  });

  it('loginWithEmailOrCpf autentica via email direto', async () => {
    const user = {
      uid: 'uid-1',
      displayName: null,
      getIdToken: jest.fn().mockResolvedValue('token-1'),
    };

    mockedSignIn.mockResolvedValue({ user } as never);
    mockedGetUserProfile.mockResolvedValue({ name: 'Ana' } as never);

    const response = await loginWithEmailOrCpf('ana@email.com', '123456');

    expect(mockedGetDocs).not.toHaveBeenCalled();
    expect(mockedSignIn).toHaveBeenCalledWith(mockAuth, 'ana@email.com', '123456');
    expect(response).toEqual({
      token: 'token-1',
      userId: 'uid-1',
      displayName: 'Ana',
      riskLevel: 'standard',
    });
  });

  it('loginWithEmailOrCpf usa cpf para buscar email', async () => {
    mockedGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ email: 'cpf@email.com' }) }],
    } as never);

    const user = {
      uid: 'uid-2',
      displayName: 'Perfil Firebase',
      getIdToken: jest.fn().mockResolvedValue('token-2'),
    };

    mockedSignIn.mockResolvedValue({ user } as never);
    mockedGetUserProfile.mockResolvedValue(null as never);

    const response = await loginWithEmailOrCpf('11122233344', '123456');

    expect(mockedSignIn).toHaveBeenCalledWith(mockAuth, 'cpf@email.com', '123456');
    expect(response.displayName).toBe('Perfil Firebase');
  });

  it('logout executa signOut', async () => {
    await logout();

    expect((mockAuth as { signOut: jest.Mock }).signOut).toHaveBeenCalled();
  });

  it('falha quando firebase auth nao esta inicializado', async () => {
    mockAuth = null;

    await expect(logout()).rejects.toThrow('Firebase não está inicializado');
  });

  it('falha quando firebase db nao esta inicializado', async () => {
    mockDb = null;

    await expect(getEmailByCpf('11122233344')).rejects.toThrow('Firebase não está inicializado');
  });
});
