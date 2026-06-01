import { useState } from 'react';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import SlideToUnlock from '@/components/SlideToCall';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Mulheres</Text>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <EditScreenInfo path="app/(tabs)/index.tsx" />

      <SlideToUnlock
        onUnlock={() => setShowMessage(true)}
      />

      {showMessage && (
        <Text style={styles.successMessage}>
          Pedido de ajuda encaminhado
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  successMessage: {
    marginTop: 20,
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
});