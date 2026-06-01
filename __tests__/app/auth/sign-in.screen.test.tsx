import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SignInRoute from '@/app/(auth)/sign-in';
import { useSignIn } from '@/src/hooks/useSignIn';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

jest.mock('@/src/hooks/useSignIn', () => ({
  useSignIn: jest.fn(),
}));

const mockedUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;

type SignInHookState = ReturnType<typeof useSignIn>;

function buildSignInState(overrides?: Partial<SignInHookState>): SignInHookState {
  return {
    emailOuCpf: '',
    setEmailOuCpf: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    errorMessage: null,
    isLoading: false,
    isFormValid: false,
    clearError: jest.fn(),
    signIn: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('Tela de login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza campos e textos principais', () => {
    mockedUseSignIn.mockReturnValue(buildSignInState());

    const { getAllByText, getByPlaceholderText } = render(<SignInRoute />);

    expect(getAllByText('Entrar').length).toBeGreaterThan(0);
    expect(getAllByText('Cadastrar-se').length).toBeGreaterThan(0);
    expect(getByPlaceholderText('Digite seu CPF ou email')).toBeTruthy();
    expect(getByPlaceholderText('Digite sua senha')).toBeTruthy();
  });

  it('atualiza campos e limpa erro ao digitar', () => {
    const state = buildSignInState({ errorMessage: 'erro qualquer' });
    mockedUseSignIn.mockReturnValue(state);

    const { getByPlaceholderText } = render(<SignInRoute />);

    fireEvent.changeText(getByPlaceholderText('Digite seu CPF ou email'), 'ana@email.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), '123456');

    expect(state.setEmailOuCpf).toHaveBeenCalledWith('ana@email.com');
    expect(state.setPassword).toHaveBeenCalledWith('123456');
    expect(state.clearError).toHaveBeenCalledTimes(2);
  });

  it('navega para tabs quando login retorna sucesso', async () => {
    const state = buildSignInState({
      isFormValid: true,
      signIn: jest.fn().mockResolvedValue({ userId: 'u1' }),
    });
    mockedUseSignIn.mockReturnValue(state);

    const { getAllByText } = render(<SignInRoute />);

    fireEvent.press(getAllByText('Entrar')[1]);

    await waitFor(() => {
      expect(state.signIn).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('nao navega para tabs quando login falha', async () => {
    const state = buildSignInState({
      isFormValid: true,
      signIn: jest.fn().mockResolvedValue(null),
    });
    mockedUseSignIn.mockReturnValue(state);

    const { getAllByText } = render(<SignInRoute />);

    fireEvent.press(getAllByText('Entrar')[1]);

    await waitFor(() => {
      expect(state.signIn).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
  });

  it('vai para tela de cadastro ao clicar em Cadastrar-se', () => {
    mockedUseSignIn.mockReturnValue(buildSignInState());

    const { getAllByText } = render(<SignInRoute />);

    fireEvent.press(getAllByText('Cadastrar-se')[0]);

    expect(mockPush).toHaveBeenCalledWith('/register');
  });
});
