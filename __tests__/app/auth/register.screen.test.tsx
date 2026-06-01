import { fireEvent, render, waitFor } from '@testing-library/react-native';

import RegisterRoute from '@/app/(auth)/register';
import { useRegister } from '@/src/hooks/auth/useRegister';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    push: jest.fn(),
  },
}));

jest.mock('@/src/hooks/auth/useRegister', () => ({
  useRegister: jest.fn(),
}));

const mockedUseRegister = useRegister as jest.MockedFunction<typeof useRegister>;

type RegisterHookState = ReturnType<typeof useRegister>;

function buildRegisterState(overrides?: Partial<RegisterHookState>): RegisterHookState {
  return {
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    name: '',
    setName: jest.fn(),
    cpf: '',
    setCpf: jest.fn(),
    phone: '',
    setPhone: jest.fn(),
    passwordEmerg: null,
    setPasswordEmerg: jest.fn(),
    errorMessage: null,
    isLoading: false,
    isFormValid: false,
    clearError: jest.fn(),
    register: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('Tela de cadastro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza campos e textos principais', () => {
    mockedUseRegister.mockReturnValue(buildRegisterState());

    const { getAllByText, getByPlaceholderText } = render(<RegisterRoute />);

    expect(getAllByText('Registrar').length).toBeGreaterThan(0);
    expect(getByPlaceholderText('Digite seu nome')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu CPF')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu email')).toBeTruthy();
    expect(getByPlaceholderText('Crie uma senha (mínimo 6 caracteres)')).toBeTruthy();
  });

  it('atualiza campos e limpa erro ao digitar', () => {
    const state = buildRegisterState({ errorMessage: 'erro qualquer' });
    mockedUseRegister.mockReturnValue(state);

    const { getByPlaceholderText } = render(<RegisterRoute />);

    fireEvent.changeText(getByPlaceholderText('Digite seu nome'), 'Ana Silva');
    fireEvent.changeText(getByPlaceholderText('Digite seu CPF'), '11122233344');
    fireEvent.changeText(getByPlaceholderText('Digite seu email'), 'ana@email.com');
    fireEvent.changeText(getByPlaceholderText('(xx) xxxxx-xxxx'), '83999999999');
    fireEvent.changeText(getByPlaceholderText('Crie uma senha (mínimo 6 caracteres)'), '123456');
    fireEvent.changeText(getByPlaceholderText('Senha de emergência'), '9999');

    expect(state.setName).toHaveBeenCalledWith('Ana Silva');
    expect(state.setCpf).toHaveBeenCalledWith('11122233344');
    expect(state.setEmail).toHaveBeenCalledWith('ana@email.com');
    expect(state.setPhone).toHaveBeenCalledWith('83999999999');
    expect(state.setPassword).toHaveBeenCalledWith('123456');
    expect(state.setPasswordEmerg).toHaveBeenCalledWith('9999');
    expect(state.clearError).toHaveBeenCalledTimes(6);
  });

  it('navega para sign-in ao registrar com sucesso', async () => {
    const state = buildRegisterState({
      isFormValid: true,
      register: jest.fn().mockResolvedValue({ userId: 'u1' }),
    });
    mockedUseRegister.mockReturnValue(state);

    const { getAllByText } = render(<RegisterRoute />);

    fireEvent.press(getAllByText('Registrar')[1]);

    await waitFor(() => {
      expect(state.register).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('nao navega quando cadastro falha', async () => {
    const state = buildRegisterState({
      isFormValid: true,
      register: jest.fn().mockResolvedValue(null),
    });
    mockedUseRegister.mockReturnValue(state);

    const { getAllByText } = render(<RegisterRoute />);

    fireEvent.press(getAllByText('Registrar')[1]);

    await waitFor(() => {
      expect(state.register).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalledWith('/sign-in');
  });

  it('volta para sign-in ao clicar no botao de voltar', () => {
    mockedUseRegister.mockReturnValue(buildRegisterState());

    const { getByText } = render(<RegisterRoute />);

    fireEvent.press(getByText('←'));

    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });
});
