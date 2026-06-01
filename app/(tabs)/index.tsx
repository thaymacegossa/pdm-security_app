// app/(tabs)/index.tsx
import AlertsCard from '@/components/AlertsCard';
import ContactsCard from '@/components/ContactsCard';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/src/store/auth-store';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';

export default function HomePage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.pageSubtitle}>Resumo rápido dos seus contatos e alertas.</Text>
        {user ? (
          <>
            <ContactsCard userId={user.userId} />
            <AlertsCard userId={user.userId} limit={3} />
          </>
        ) : (
          <Text style={styles.pageSubtitle}>Usuário não encontrado.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});
