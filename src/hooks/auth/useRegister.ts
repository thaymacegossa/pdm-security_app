import { useCallback, useMemo, useState } from 'react';

import { auth } from '@config/firebaseConfig';
import { saveUserProfile } from '@services/firebase/user.service';
import { devLog } from '@utils/dev-log';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

type RegisterPayload = {
	email: string;
	password: string;
	name: string;
	cpf: string;
	phone: string;
	passwordEmerg?: string | null;
};

function mapRegisterError(error: unknown): string {
	if (!(error instanceof Error)) {
		return 'Nao foi possivel registrar. Tente novamente.';
	}

	const message = error.message;

	if (message.includes('auth/email-already-in-use')) {
		return 'Este email ja esta em uso. Tente outro email.';
	}

	if (message.includes('auth/invalid-email')) {
		return 'Email invalido. Revise o campo e tente novamente.';
	}

	if (message.includes('auth/weak-password')) {
		return 'Senha muito fraca. Use ao menos 6 caracteres.';
	}

	if (message.includes('Firebase nao esta inicializado') || message.includes('Firebase não está inicializado')) {
		return 'Firebase nao configurado. Defina as variaveis EXPO_PUBLIC_USE_FIREBASE e tente novamente.';
	}

	return message || 'Nao foi possivel registrar. Tente novamente.';
}

export function useRegister() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [cpf, setCpf] = useState('');
	const [phone, setPhone] = useState('');
	const [passwordEmerg, setPasswordEmerg] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const isFormValid = useMemo(() => {
		return (
			email.trim().length > 0 &&
			password.trim().length >= 6 &&
			name.trim().length > 0 &&
			cpf.trim().length > 0
		);
	}, [email, password, name, cpf]);

	const clearError = useCallback(() => {
		setErrorMessage(null);
	}, []);

	const register = useCallback(async (payload?: Partial<RegisterPayload>) => {
		if (!isFormValid || isLoading) {
			return null;
		}

		setIsLoading(true);
		setErrorMessage(null);

		const data: RegisterPayload = {
			email: payload?.email ?? email.trim(),
			password: payload?.password ?? password,
			name: payload?.name ?? name.trim(),
			cpf: payload?.cpf ?? cpf.trim(),
			phone: payload?.phone ?? phone.trim(),
			passwordEmerg: payload?.passwordEmerg ?? passwordEmerg ?? null,
		};

		try {
			if (!auth) {
				throw new Error('Firebase não está inicializado. Ative EXPO_PUBLIC_USE_FIREBASE=true e configure as variáveis de ambiente.');
			}

			const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
			const user = credential.user;

			try {
				await updateProfile(user, { displayName: data.name });
			} catch (err) {
				devLog('[useRegister] falha ao atualizar displayName', err);
			}

			await saveUserProfile(user.uid, {
				cpf: data.cpf,
				name: data.name,
				phone: data.phone,
				password_emerg: data.passwordEmerg ?? null,
			});

			devLog('[useRegister] usuario registrado', { userId: user.uid });
			return {
				userId: user.uid,
				token: await user.getIdToken(),
				displayName: user.displayName || data.name,
			};
		} catch (error) {
			setErrorMessage(mapRegisterError(error));
			devLog('[useRegister] erro', error);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [email, password, name, cpf, phone, passwordEmerg, isFormValid, isLoading]);

	return {
		email,
		setEmail,
		password,
		setPassword,
		name,
		setName,
		cpf,
		setCpf,
		phone,
		setPhone,
		passwordEmerg,
		setPasswordEmerg,
		errorMessage,
		isLoading,
		isFormValid,
		clearError,
		register,
	};
}
