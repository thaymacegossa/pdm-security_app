import { act, renderHook } from '@testing-library/react-native';

import { useSignIn } from '@/src/hooks/useSignIn';
import { loginWithEmailOrCpf } from '@services/auth/auth.service';

jest.mock('@services/auth/auth.service', () => ({
  loginWithEmailOrCpf: jest.fn(),
}));

const mockedLogin = loginWithEmailOrCpf as jest.MockedFunction<typeof loginWithEmailOrCpf>;

describe('useSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nao tenta autenticar quando o formulario e invalido', async () => {
    const { result } = renderHook(() => useSignIn());

    let response: unknown;
    await act(async () => {
      response = await result.current.signIn();
    });

    expect(response).toBeNull();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('autentica com sucesso quando o formulario e valido', async () => {
    mockedLogin.mockResolvedValue({
      token: 'token-1',
      userId: 'uid-1',
      displayName: 'Ana',
      riskLevel: 'standard',
    });

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('ana@email.com');
      result.current.setPassword('123456');
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.signIn();
    });

    expect(mockedLogin).toHaveBeenCalledWith('ana@email.com', '123456');
    expect(response).toEqual({
      token: 'token-1',
      userId: 'uid-1',
      displayName: 'Ana',
      riskLevel: 'standard',
    });
    expect(result.current.errorMessage).toBeNull();
  });

  it('mapeia erro de credencial invalida', async () => {
    mockedLogin.mockRejectedValue(new Error('auth/invalid-credential'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('11122233344');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe('Credenciais invalidas. Verifique CPF/email e senha.');
  });

  it('mapeia erro de email invalido', async () => {
    mockedLogin.mockRejectedValue(new Error('auth/invalid-email'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('email-invalido');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe('Email invalido. Revise o campo e tente novamente.');
  });

  it('mapeia erro de cpf nao encontrado', async () => {
    mockedLogin.mockRejectedValue(new Error('CPF não encontrado'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('11122233344');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe('CPF nao encontrado. Verifique os dados cadastrados.');
  });

  it('mapeia erro de firebase nao inicializado', async () => {
    mockedLogin.mockRejectedValue(new Error('Firebase não está inicializado'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('11122233344');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe(
      'Firebase nao configurado. Defina as variaveis EXPO_PUBLIC_USE_FIREBASE e tente novamente.',
    );
  });

  it('retorna mensagem generica quando erro nao e instancia de Error', async () => {
    mockedLogin.mockRejectedValue({ code: 'unknown' });

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('ana@email.com');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe('Nao foi possivel fazer login. Tente novamente.');
  });

  it('limpa erro com clearError', async () => {
    mockedLogin.mockRejectedValue(new Error('auth/too-many-requests'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmailOuCpf('ana@email.com');
      result.current.setPassword('123456');
    });

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.errorMessage).toBe(
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    );

    act(() => {
      result.current.clearError();
    });

    expect(result.current.errorMessage).toBeNull();
  });
});
