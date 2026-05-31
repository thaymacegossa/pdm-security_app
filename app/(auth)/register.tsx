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

import { useRegister } from '@/src/hooks/useRegister';

export default function RegisterRoute() {
    const {
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
        clearError,
        isFormValid,
        isLoading,
        register,
    } = useRegister();

    const handleSubmit = useCallback(async () => {
        const result = await register();

        if (result) {
            router.replace('/sign-in');
        }
    }, [register]);

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Pressable style={styles.root} onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.card}>
                    <Text style={styles.title}>Registrar</Text>
                    <Text style={styles.subtitle}>Crie sua conta preenchendo os dados abaixo</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Nome completo</Text>
                        <TextInput
                            value={name}
                            onChangeText={(value) => {
                                setName(value);
                                if (errorMessage) clearError();
                            }}
                            placeholder="Digite seu nome"
                            placeholderTextColor="#7a7a80"
                            autoCapitalize="words"
                            autoCorrect={false}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>CPF</Text>
                        <TextInput
                            value={cpf}
                            onChangeText={(value) => {
                                setCpf(value);
                                if (errorMessage) clearError();
                            }}
                            placeholder="Digite seu CPF"
                            placeholderTextColor="#7a7a80"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                if (errorMessage) clearError();
                            }}
                            placeholder="Digite seu email"
                            placeholderTextColor="#7a7a80"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Telefone (opcional)</Text>
                        <TextInput
                            value={phone}
                            onChangeText={(value) => {
                                setPhone(value);
                                if (errorMessage) clearError();
                            }}
                            placeholder="(xx) xxxxx-xxxx"
                            placeholderTextColor="#7a7a80"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="phone-pad"
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
                            placeholder="Crie uma senha (mínimo 6 caracteres)"
                            placeholderTextColor="#7a7a80"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Senha de emergência (opcional)</Text>
                        <TextInput
                            value={passwordEmerg ?? ''}
                            onChangeText={(value) => {
                                setPasswordEmerg(value || null);
                                if (errorMessage) clearError();
                            }}
                            placeholder="Senha de emergência"
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
                            <Text style={styles.buttonText}>Registrar</Text>
                        )}
                    </Pressable>

                </View>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f5f7fa',
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
        color: '#121316',
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
        color: '#1f2430',
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
        backgroundColor: '#065f46',
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
});
