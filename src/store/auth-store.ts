import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

const AUTH_USER_KEY = 'auth_user';

type AuthUser = {
	userId: string;
	name: string;
};

type AuthState = {
	user: AuthUser | null;
	isLoading: boolean;
};

let authState: AuthState = {
	user: null,
	isLoading: true,
};

let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emitChange() {
	listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return authState;
}

export async function saveAuthUser(userId: string, name: string): Promise<void> {
	const payload = JSON.stringify({ userId, name });
	if (Platform.OS === 'web') {
		localStorage.setItem(AUTH_USER_KEY, payload);
	} else {
		try {
			await SecureStore.setItemAsync(AUTH_USER_KEY, payload);
		} catch {
			await AsyncStorage.setItem(AUTH_USER_KEY, payload);
		}
	}
}

export async function getAuthUser(): Promise<AuthUser | null> {
	const raw =
		Platform.OS === 'web'
			? localStorage.getItem(AUTH_USER_KEY)
			: await (async () => {
				try {
					return await SecureStore.getItemAsync(AUTH_USER_KEY);
				} catch {
					return await AsyncStorage.getItem(AUTH_USER_KEY);
				}
			})();
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

export async function clearAuthUser(): Promise<void> {
	if (Platform.OS === 'web') {
		localStorage.removeItem(AUTH_USER_KEY);
	} else {
		await Promise.allSettled([
			SecureStore.deleteItemAsync(AUTH_USER_KEY),
			AsyncStorage.removeItem(AUTH_USER_KEY),
		]);
	}
}

async function hydrateAuthState(): Promise<void> {
	if (hydrated) return;
	if (hydrationPromise) {
		await hydrationPromise;
		return;
	}

	hydrationPromise = (async () => {
		const stored = await getAuthUser();
		authState = {
			user: stored,
			isLoading: false,
		};
		hydrated = true;
		emitChange();
	})();

	await hydrationPromise;
}

export function useAuthStore() {
	const { user, isLoading } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	useEffect(() => {
		hydrateAuthState().catch(() => {
			authState = {
				user: null,
				isLoading: false,
			};
			emitChange();
		});
	}, []);

	const save = useCallback(async (userId: string, name: string) => {
		await saveAuthUser(userId, name);
		authState = {
			user: { userId, name },
			isLoading: false,
		};
		hydrated = true;
		emitChange();
	}, []);

	const clear = useCallback(async () => {
		await clearAuthUser();
		authState = {
			user: null,
			isLoading: false,
		};
		hydrated = true;
		emitChange();
	}, []);

	return { user, isLoading, save, clear };
}
