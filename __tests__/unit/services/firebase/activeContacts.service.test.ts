import {
    deleteActiveContacts,
    getActiveContacts,
    saveActiveContacts,
    updateActiveContacts,
} from '@services/firebase/activeContacts.service';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

let mockDb: unknown = {};

jest.mock('@config/firebaseConfig', () => ({
  get db() {
    return mockDb;
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockedServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('activeContacts.service', () => {
  beforeEach(() => {
    mockDb = {};
    jest.clearAllMocks();
    mockedCollection.mockReturnValue({ id: 'collection-ref' } as never);
    mockedDoc.mockReturnValue({ id: 'doc-ref' } as never);
    mockedServerTimestamp.mockReturnValue('ts' as never);
  });

  it('getActiveContacts retorna lista quando houver dados', async () => {
    mockedGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ name: 'Contato 1' }) }],
    } as never);

    const result = await getActiveContacts('uid-1');

    expect(result).toEqual([{ name: 'Contato 1' }]);
  });

  it('getActiveContacts retorna null quando colecao vazia', async () => {
    mockedGetDocs.mockResolvedValue({ empty: true, docs: [] } as never);

    const result = await getActiveContacts('uid-1');

    expect(result).toBeNull();
  });

  it('saveActiveContacts adiciona contato com timestamp', async () => {
    mockedAddDoc.mockResolvedValue({ id: '1' } as never);

    await saveActiveContacts('uid-1', {
      isActive: true,
      name: 'Contato',
      phone: '83999999999',
      relation: 'CP',
    });

    expect(mockedAddDoc).toHaveBeenCalledWith(
      { id: 'collection-ref' },
      {
        isActive: true,
        name: 'Contato',
        phone: '83999999999',
        relation: 'CP',
        lastUpdated: 'ts',
      },
    );
  });

  it('updateActiveContacts atualiza contato com timestamp', async () => {
    mockedUpdateDoc.mockResolvedValue(undefined);

    await updateActiveContacts('uid-1', 'c1', {
      isActive: true,
      name: 'Contato',
      phone: '83999999999',
      relation: 'CP',
    });

    expect(mockedUpdateDoc).toHaveBeenCalledWith(
      { id: 'doc-ref' },
      {
        isActive: true,
        name: 'Contato',
        phone: '83999999999',
        relation: 'CP',
        lastUpdated: 'ts',
      },
    );
  });

  it('deleteActiveContacts remove contato', async () => {
    mockedDeleteDoc.mockResolvedValue(undefined);

    await deleteActiveContacts('uid-1', 'c1');

    expect(mockedDeleteDoc).toHaveBeenCalledWith({ id: 'doc-ref' });
  });

  it('falha quando db nao esta inicializado', async () => {
    mockDb = null;

    await expect(getActiveContacts('uid-1')).rejects.toThrow('Firebase não está inicializado');
  });
});
