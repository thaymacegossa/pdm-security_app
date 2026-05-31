

import { router } from 'expo-router';
import { useCallback } from 'react';
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useSignIn } from '@/src/hooks/useSignIn';

export default function SignInRoute() {
	const {
		emailOuCpf,
		setEmailOuCpf,
		password,
		setPassword,
		errorMessage,
		clearError,
		isFormValid,
		isLoading,
		signIn,
	} = useSignIn();

	const handleSubmit = useCallback(async () => {
		const result = await signIn();

		if (result) {
			router.replace('/(tabs)');
		}
	}, [signIn]);

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<Pressable style={styles.root} onPress={Keyboard.dismiss} accessible={false}>
				<View style={styles.card}>
				<Text style={styles.title}>Entrar</Text>
				<Text style={styles.subtitle}>Acesse com CPF ou email e sua senha</Text>

				<View style={styles.fieldGroup}>
					<Text style={styles.label}>CPF ou email</Text>
					<TextInput
						value={emailOuCpf}
						onChangeText={(value) => {
							setEmailOuCpf(value);
							if (errorMessage) clearError();
						}}
						placeholder="Digite seu CPF ou email"
						placeholderTextColor="#7a7a80"
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="default"
						style={styles.input}
					/>
				</View>

				<View style={styles.fieldGroup}>
					<Text style={styles.label}>Senha</Text>
					<TextInput
						value={password}
						onChangeText={(value) => {
							setPassword(value);
							if (errorMessage) clearError();
						}}
						placeholder="Digite sua senha"
						placeholderTextColor="#7a7a80"
						secureTextEntry
						autoCapitalize="none"
						autoCorrect={false}
						style={styles.input}
					/>
				</View>

				{errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

				<Pressable
					onPress={handleSubmit}
					disabled={!isFormValid || isLoading}
					style={({ pressed }) => [
						styles.button,
						(!isFormValid || isLoading) && styles.buttonDisabled,
						pressed && isFormValid && !isLoading ? styles.buttonPressed : null,
					]}
				>
					{isLoading ? (
						<ActivityIndicator color="#ffffff" />
					) : (
						<Text style={styles.buttonText}>Entrar</Text>
					)}
				</Pressable>

				<Pressable onPress={() => router.push('/register')} style={styles.signUpLink}>
					<Text style={styles.signUpText}>Cadastrar-se</Text>
				</Pressable>

			</View>
		</Pressable>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: Colors.light.background,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.08,
		shadowRadius: 18,
		elevation: 4,
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		color: Colors.light.text,
	},
	subtitle: {
		marginTop: 6,
		marginBottom: 20,
		fontSize: 14,
		color: '#4d525b',
	},
	fieldGroup: {
		marginBottom: 14,
	},
	label: {
		fontSize: 13,
		fontWeight: '600',
		color: Colors.light.text,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#d9dde5',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 15,
		color: '#111827',
		backgroundColor: '#fbfcfe',
	},
	errorText: {
		color: '#b42318',
		marginTop: 4,
		marginBottom: 12,
		fontSize: 13,
		fontWeight: '500',
	},
	button: {
		marginTop: 4,
		backgroundColor: Colors.light.tint,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 48,
	},
	buttonDisabled: {
		backgroundColor: '#8ea39c',
	},
	buttonPressed: {
		opacity: 0.88,
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
	},
	// link para registrar
	signUpLink: {
		marginTop: 12,
		alignItems: 'center',
	},
	signUpText: {
		color: Colors.light.tint,
		fontSize: 13,
		fontWeight: '600'
	}
});