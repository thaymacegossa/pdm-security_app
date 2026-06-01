import { deleteAlert, getAlert, saveAlert } from '@services/firebase/alert.service';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
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
  serverTimestamp: jest.fn(),
}));

const mockedCollection = collection as jest.MockedFunction<typeof collection>;
const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockedServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('alert.service', () => {
  beforeEach(() => {
    mockDb = {};
    jest.clearAllMocks();
    mockedCollection.mockReturnValue({ id: 'collection-ref' } as never);
    mockedDoc.mockReturnValue({ id: 'doc-ref' } as never);
    mockedServerTimestamp.mockReturnValue('ts' as never);
  });

  it('getAlert retorna alertas quando houver dados', async () => {
    mockedGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ actualAlert: true }) }],
    } as never);

    const result = await getAlert('uid-1');

    expect(result).toEqual([{ actualAlert: true }]);
  });

  it('getAlert retorna null quando vazio', async () => {
    mockedGetDocs.mockResolvedValue({ empty: true, docs: [] } as never);

    const result = await getAlert('uid-1');

    expect(result).toBeNull();
  });

  it('saveAlert adiciona alerta com startedAt', async () => {
    mockedAddDoc.mockResolvedValue({ id: '1' } as never);

    await saveAlert('uid-1', {
      actualAlert: true,
      geolocation: { latitude: -7.1, longitude: -34.84 },
      location: 'Cabedelo',
    });

    expect(mockedAddDoc).toHaveBeenCalledWith(
      { id: 'collection-ref' },
      {
        actualAlert: true,
        geolocation: { latitude: -7.1, longitude: -34.84 },
        location: 'Cabedelo',
        startedAt: 'ts',
      },
    );
  });

  it('deleteAlert remove alerta', async () => {
    mockedDeleteDoc.mockResolvedValue(undefined);

    await deleteAlert('uid-1', 'a1');

    expect(mockedDeleteDoc).toHaveBeenCalledWith({ id: 'doc-ref' });
  });

  it('falha quando db nao esta inicializado', async () => {
    mockDb = null;

    await expect(getAlert('uid-1')).rejects.toThrow('Firebase não está inicializado');
  });
});
