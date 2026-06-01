import { act, renderHook } from '@testing-library/react-native';

import { useRegister } from '@/src/hooks/useRegister';
import { saveUserProfile } from '@services/firebase/user.service';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

let mockAuth: unknown = {};

jest.mock('@config/firebaseConfig', () => ({
  get auth() {
    return mockAuth;
  },
}));

jest.mock('@services/firebase/user.service', () => ({
  saveUserProfile: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

const mockedCreateUser =
  createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockedUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockedSaveUserProfile = saveUserProfile as jest.MockedFunction<typeof saveUserProfile>;

describe('useRegister', () => {
  beforeEach(() => {
    mockAuth = {};
    jest.clearAllMocks();
  });

  it('nao registra quando formulario e invalido', async () => {
    const { result } = renderHook(() => useRegister());

    let response: unknown;
    await act(async () => {
      response = await result.current.register();
    });

    expect(response).toBeNull();
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });

  it('registra usuario e salva perfil com sucesso', async () => {
    const getIdToken = jest.fn().mockResolvedValue('token-123');
    const firebaseUser = {
      uid: 'uid-123',
      displayName: 'Ana',
      getIdToken,
    } as never;

    mockedCreateUser.mockResolvedValue({ user: firebaseUser } as never);
    mockedUpdateProfile.mockResolvedValue(undefined);
    mockedSaveUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setEmail('ana@email.com');
      result.current.setPassword('123456');
      result.current.setName('Ana');
      result.current.setCpf('11122233344');
      result.current.setPhone('83999999999');
      result.current.setPasswordEmerg('1234');
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.register();
    });

    expect(mockedCreateUser).toHaveBeenCalledWith(mockAuth, 'ana@email.com', '123456');
    expect(mockedUpdateProfile).toHaveBeenCalledWith(firebaseUser, { displayName: 'Ana' });
    expect(mockedSaveUserProfile).toHaveBeenCalledWith('uid-123', {
      cpf: '11122233344',
      name: 'Ana',
      phone: '83999999999',
      password_emerg: '1234',
    });
    expect(response).toEqual({
      userId: 'uid-123',
      token: 'token-123',
      displayName: 'Ana',
    });
  });

  it('mapeia erro de email ja existente', async () => {
    mockedCreateUser.mockRejectedValue(new Error('auth/email-already-in-use'));

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setEmail('ana@email.com');
      result.current.setPassword('123456');
      result.current.setName('Ana');
      result.current.setCpf('11122233344');
    });

    await act(async () => {
      await result.current.register();
    });

    expect(result.current.errorMessage).toBe('Este email ja esta em uso. Tente outro email.');
  });

  it('retorna mensagem para firebase nao inicializado', async () => {
    mockAuth = null;

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setEmail('ana@email.com');
      result.current.setPassword('123456');
      result.current.setName('Ana');
      result.current.setCpf('11122233344');
    });

    await act(async () => {
      await result.current.register();
    });

    expect(result.current.errorMessage).toBe(
      'Firebase nao configurado. Defina as variaveis EXPO_PUBLIC_USE_FIREBASE e tente novamente.',
    );
  });
});
