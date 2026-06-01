import { getUserProfile, saveUserProfile } from '@services/firebase/user.service';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

let mockDb: unknown = {};

jest.mock('@config/firebaseConfig', () => ({
  get db() {
    return mockDb;
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockedServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('user.service', () => {
  beforeEach(() => {
    mockDb = {};
    jest.clearAllMocks();
    mockedDoc.mockReturnValue({ id: 'doc-ref' } as never);
    mockedServerTimestamp.mockReturnValue('timestamp' as never);
  });

  it('saveUserProfile salva perfil com merge', async () => {
    mockedSetDoc.mockResolvedValue(undefined);

    await saveUserProfile('uid-1', {
      cpf: '11122233344',
      name: 'Ana',
      phone: '83999999999',
      password_emerg: null,
    });

    expect(mockedSetDoc).toHaveBeenCalledWith(
      { id: 'doc-ref' },
      {
        cpf: '11122233344',
        name: 'Ana',
        phone: '83999999999',
        password_emerg: null,
        updatedAt: 'timestamp',
        createdAt: 'timestamp',
      },
      { merge: true },
    );
  });

  it('getUserProfile retorna dados quando documento existe', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Ana' }),
    } as never);

    const profile = await getUserProfile('uid-1');

    expect(profile).toEqual({ name: 'Ana' });
  });

  it('getUserProfile retorna null quando documento nao existe', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
    } as never);

    const profile = await getUserProfile('uid-1');

    expect(profile).toBeNull();
  });

  it('falha quando db nao esta inicializado', async () => {
    mockDb = null;

    await expect(
      saveUserProfile('uid-1', {
        cpf: '11122233344',
        name: 'Ana',
        phone: '83999999999',
        password_emerg: null,
      }),
    ).rejects.toThrow('Firebase não está inicializado');
  });
});
