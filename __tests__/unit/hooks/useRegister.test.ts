import { act, renderHook } from '@testing-library/react-native';

import { useRegister } from '@/src/hooks/auth/useRegister';
import { saveUserProfile } from '@services/firebase/user.service';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

let mockAuth: unknown = {};

jest.mock('@/src/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    save: jest.fn().mockResolvedValue(undefined),
  })),
}));

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

  it('mapeia erro de invalid-email', async () => {
    mockedCreateUser.mockRejectedValue(new Error('auth/invalid-email'));

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setEmail('email-invalido');
      result.current.setPassword('123456');
      result.current.setName('Ana');
      result.current.setCpf('11122233344');
    });

    await act(async () => {
      await result.current.register();
    });

    expect(result.current.errorMessage).toBe('Email invalido. Revise o campo e tente novamente.');
  });

  it('mapeia erro de weak-password', async () => {
    mockedCreateUser.mockRejectedValue(new Error('auth/weak-password'));

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

    expect(result.current.errorMessage).toBe('Senha muito fraca. Use ao menos 6 caracteres.');
  });

  it('retorna mensagem generica quando erro nao e instancia de Error', async () => {
    mockedCreateUser.mockRejectedValue({ code: 'unknown' });

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

    expect(result.current.errorMessage).toBe('Nao foi possivel registrar. Tente novamente.');
  });

  it('continua mesmo quando updateProfile falha', async () => {
    const getIdToken = jest.fn().mockResolvedValue('token-123');
    const firebaseUser = {
      uid: 'uid-123',
      displayName: null,
      getIdToken,
    } as never;

    mockedCreateUser.mockResolvedValue({ user: firebaseUser } as never);
    mockedUpdateProfile.mockRejectedValue(new Error('Erro ao atualizar displayName'));
    mockedSaveUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setEmail('ana@email.com');
      result.current.setPassword('123456');
      result.current.setName('Ana');
      result.current.setCpf('11122233344');
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.register();
    });

    expect(mockedUpdateProfile).toHaveBeenCalled();
    expect(mockedSaveUserProfile).toHaveBeenCalled();
    expect(response).toEqual({
      userId: 'uid-123',
      token: 'token-123',
      displayName: 'Ana',
    });
  });

  it('limpa erro com clearError', async () => {
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

    act(() => {
      result.current.clearError();
    });

    expect(result.current.errorMessage).toBeNull();
  });

  it('retorna null quando formulario invalido', async () => {
    const { result } = renderHook(() => useRegister());

    // Não preenche o formulário

    let response: unknown;
    await act(async () => {
      response = await result.current.register();
    });

    expect(response).toBeNull();
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });
});
