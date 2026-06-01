import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

const AUTH_USER_KEY = 'auth_user';

type AuthUser = {
	userId: string;
	name: string;
};

export async function saveAuthUser(userId: string, name: string): Promise<void> {
	const payload = JSON.stringify({ userId, name });
	await SecureStore.setItemAsync(AUTH_USER_KEY, payload);
}

export async function getAuthUser(): Promise<AuthUser | null> {
	const raw = await SecureStore.getItemAsync(AUTH_USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

export async function clearAuthUser(): Promise<void> {
	await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}

export function useAuthStore() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getAuthUser().then((stored) => {
			setUser(stored);
			setIsLoading(false);
		});
	}, []);

	const save = useCallback(async (userId: string, name: string) => {
		await saveAuthUser(userId, name);
		setUser({ userId, name });
	}, []);

	const clear = useCallback(async () => {
		await clearAuthUser();
		setUser(null);
	}, []);

	return { user, isLoading, save, clear };
}
