import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SlideToUnlock from '@/components/SlideToCall';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/src/store/auth-store';
import { logout } from '@services/auth/auth.service';

type RoutePath = '/' | '/contactsPage' | '/alertsPage';

function CustomHeader() {
  const { user, clear } = useAuthStore();
  const router = useRouter();

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

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={22} color="#f44336" />
      </Pressable>
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

function BottomNavigation() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const navigationItems = [
    { icon: 'home', label: 'Principal', path: '/' },
    { icon: 'address-book', label: 'Contatos', path: '/contactsPage' },
    { icon: 'exclamation-triangle', label: 'Alertas', path: '/alertsPage' },
  ];

  return (
    <View style={styles.bottomNavContainer}>
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.path}
          style={styles.navButton}
          onPress={() => router.push(item.path as RoutePath)}
        >
          <FontAwesome name={item.icon as any} size={24} color={tintColor} />
          <Text style={[styles.navLabel, { color: tintColor }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
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
  const { user, isLoading } = useAuthStore();

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
      <View style={styles.sliderContainer}>
        {isLoading ? (
          <Text style={styles.loadingSliderText}>Carregando usuário...</Text>
        ) : user ? (
          <SlideToUnlock user={user} />
        ) : (
          <Text style={styles.loadingSliderText}>Faça login para usar o slider</Text>
        )}
      </View>
      <BottomNavigation />
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
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },
  loadingSliderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomNavContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
