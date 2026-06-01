import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SlideToUnlock from '@/components/SlideToCall';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/src/store/auth-store';
import { logout } from '@services/auth/auth.service';

type RoutePath = '/' | '/contactsPage' | '/alertsPage';

function HeaderMenu({ visible, onClose, onNavigate, onLogout }: { visible: boolean; onClose: () => void; onNavigate: (path: RoutePath) => void; onLogout: () => void; }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Navegação</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => { onNavigate('/'); onClose(); }}>
            <Text style={styles.modalButtonText}>Página Principal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => { onNavigate('/contactsPage'); onClose(); }}>
            <Text style={styles.modalButtonText}>Contatos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => { onNavigate('/alertsPage'); onClose(); }}>
            <Text style={styles.modalButtonText}>Alertas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.logoutMenuButton]} onPress={() => { onLogout(); onClose(); }}>
            <Text style={[styles.modalButtonText, styles.logoutMenuText]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CustomHeader() {
  const { user, clear } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigate = (path: RoutePath) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }

    await clear();
    router.replace('/sign-in');
  };

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.headerTitle}>Security App</Text>
        {user && <Text style={styles.headerSubtitle}>Olá, {user.name}</Text>}
      </View>

      <Pressable style={styles.hamburgerButton} onPress={() => setMenuOpen(true)}>
        <FontAwesome name="bars" size={22} color="#111" />
      </Pressable>

      <HeaderMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </View>
  );
}

function CustomTabBar() {
  const { user, isLoading } = useAuthStore();

  return (
    <View style={styles.tabBarContainer}>
      {isLoading ? (
        <Text style={styles.loadingSliderText}>Carregando usuário...</Text>
      ) : user ? (
        <SlideToUnlock user={user} />
      ) : (
        <Text style={styles.loadingSliderText}>Faça login para usar o slider</Text>
      )}
    </View>
  );
}

// You can explore the built-in icon families on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.outerContainer}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          header: () => <CustomHeader />,
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Principal',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="contactsPage"
          options={{
            title: 'Contatos',
            tabBarIcon: ({ color }) => <TabBarIcon name="address-book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="alertsPage"
          options={{
            title: 'Alertas',
            tabBarIcon: ({ color }) => <TabBarIcon name="exclamation-triangle" color={color} />,
          }}
        />
      </Tabs>
      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 55,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  hamburgerButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loadingSliderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  modalButton: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  logoutMenuButton: {
    backgroundColor: '#f44336',
  },
  logoutMenuText: {
    color: '#fff',
  },
  modalButtonText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },
});
