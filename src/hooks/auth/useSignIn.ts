import { useCallback, useMemo, useState } from 'react';

import { useAuthStore } from '@/src/store/auth-store';
import { loginWithEmailOrCpf } from '@services/auth/auth.service';

type Credentials = {
	emailOuCpf: string;
	password: string;
};

function mapAuthError(error: unknown): string {
	if (!(error instanceof Error)) {
		return 'Nao foi possivel fazer login. Tente novamente.';
	}

	const message = error.message;

	if (message.includes('auth/invalid-credential')) {
		return 'Credenciais invalidas. Verifique CPF/email e senha.';
	}

	if (message.includes('auth/invalid-email')) {
		return 'Email invalido. Revise o campo e tente novamente.';
	}

	if (message.includes('auth/too-many-requests')) {
		return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
	}

	if (message.includes('CPF nao encontrado') || message.includes('CPF não encontrado')) {
		return 'CPF nao encontrado. Verifique os dados cadastrados.';
	}

	if (message.includes('Firebase nao esta inicializado') || message.includes('Firebase não está inicializado')) {
		return 'Firebase nao configurado. Defina as variaveis EXPO_PUBLIC_USE_FIREBASE e tente novamente.';
	}

	return message || 'Nao foi possivel fazer login. Tente novamente.';
}

export function useSignIn() {
	const { save: saveAuth } = useAuthStore();
	const [emailOuCpf, setEmailOuCpf] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const isFormValid = useMemo(() => {
		return emailOuCpf.trim().length > 0 && password.trim().length >= 6;
	}, [emailOuCpf, password]);

	const clearError = useCallback(() => {
		setErrorMessage(null);
	}, []);

	const signIn = useCallback(async () => {
		if (!isFormValid || isLoading) {
			return null;
		}

		setIsLoading(true);
		setErrorMessage(null);

		const credentials: Credentials = {
			emailOuCpf: emailOuCpf.trim(),
			password,
		};

		try {
			const response = await loginWithEmailOrCpf(credentials.emailOuCpf, credentials.password);
			await saveAuth(response.userId, response.displayName);
			return response;
		} catch (error) {
			setErrorMessage(mapAuthError(error));
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [emailOuCpf, isFormValid, isLoading, password, saveAuth]);

	return {
		emailOuCpf,
		setEmailOuCpf,
		password,
		setPassword,
		errorMessage,
		isLoading,
		isFormValid,
		clearError,
		signIn,
	};
}
