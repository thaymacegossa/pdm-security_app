// components/SlideToUnlock.tsx
import { alertTrigger, cancelAlert } from '@/src/hooks/alert/alert';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const THUMB_SIZE = 60;
const SLIDER_WIDTH = width - 60;
const MAX_TRANSLATE = SLIDER_WIDTH - THUMB_SIZE;

type AlertStatus = 'idle' | 'sending' | 'success' | 'error';

type SlideToCallProps = {
  user: {
    userId: string;
    name: string;
  } | null;
};

export default function SlideToCall({ user }: SlideToCallProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [unlocked, setUnlocked] = useState(false);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');
  const [alertLocation, setAlertLocation] = useState<string | null>(null);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const resetSlider = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setUnlocked(false);
    setAlertStatus('idle');
  };

  const handleEmergencyAlert = async () => {
    if (!user) {
      Alert.alert(
        'Erro',
        'Você precisa estar logada para solicitar ajuda.',
        [{ text: 'OK', onPress: resetSlider }]
      );
      return;
    }

    setAlertStatus('sending');

    try {
      const result = await alertTrigger(user.userId);

      if (result?.alertId && result.location) {
        const endereco =
          result.location.address ||
          `${result.location.latitude.toFixed(5)}, ${result.location.longitude.toFixed(5)}`;

        setActiveAlertId(result.alertId);
        setAlertLocation(endereco);
        setAlertStatus('success');

        Alert.alert(
          '✅ Alerta Enviado!',
          `Ajuda está a caminho!\n\n📍 Localização: ${endereco}\n\nUma equipe foi acionada com suas informações.`,
          [{ text: 'OK' }]
        );
      } else {
        setAlertStatus('error');
        Alert.alert(
          '❌ Erro',
          'Não foi possível enviar o alerta. Verifique sua conexão e permissões de localização.',
          [{ text: 'Tentar Novamente', onPress: resetSlider }]
        );
      }
    } catch (error) {
      setAlertStatus('error');
      Alert.alert(
        '❌ Erro',
        'Ocorreu um erro ao enviar o alerta. Tente novamente.',
        [{ text: 'OK', onPress: resetSlider }]
      );
      console.error('Erro no alerta:', error);
    }
  };

  const handleCancelAlert = async () => {
    if (!user || !activeAlertId) {
      return;
    }

    setAlertStatus('sending');

    try {
      await cancelAlert(user.userId, activeAlertId);

      setActiveAlertId(null);
      setAlertLocation(null);
      resetSlider();

      Alert.alert('Alerta cancelado', 'Seu alerta foi cancelado com sucesso.', [
        { text: 'OK' },
      ]);
    } catch (error) {
      setAlertStatus('error');
      Alert.alert(
        '❌ Erro',
        'Não foi possível cancelar o alerta. Tente novamente.',
        [{ text: 'OK' }]
      );
      console.error('Erro ao cancelar alerta:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !unlocked && alertStatus === 'idle',

      onPanResponderMove: (_, gestureState) => {
        if (alertStatus !== 'idle') return;

        const x = Math.max(0, Math.min(gestureState.dx, MAX_TRANSLATE));
        translateX.setValue(x);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (alertStatus !== 'idle') return;

        if (gestureState.dx > MAX_TRANSLATE * 0.85) {
          Animated.spring(translateX, {
            toValue: MAX_TRANSLATE,
            useNativeDriver: true,
          }).start();

          setUnlocked(true);
          handleEmergencyAlert();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getButtonText = () => {
    switch (alertStatus) {
      case 'sending':
        return 'Enviando alerta...';
      case 'success':
        return 'Alerta enviado!';
      case 'error':
        return 'Falha no envio';
      default:
        return unlocked ? 'Processando...' : 'Deslize para pedir ajuda';
    }
  };

  const getSliderBackgroundColor = () => {
    switch (alertStatus) {
      case 'sending':
        return '#ff9800';
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      default:
        return '#222';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.slider, { backgroundColor: getSliderBackgroundColor() }]}>
        <Text style={styles.text}>
          {alertStatus === 'sending' && <ActivityIndicator color="#fff" />}
          {' '}
          {getButtonText()}
        </Text>

        {alertStatus === 'idle' && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.thumb, { transform: [{ translateX }] }]}
          >
            <Text style={styles.arrow}>››</Text>
          </Animated.View>
        )}
      </View>

      {alertStatus === 'success' && alertLocation ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.locationText}>Localização enviada</Text>
          <Text style={styles.locationValue}>{alertLocation}</Text>

          <Pressable style={styles.cancelButton} onPress={handleCancelAlert}>
            <Text style={styles.cancelButtonText}>Cancelar alerta</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  slider: {
    width: SLIDER_WIDTH,
    height: THUMB_SIZE,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arrow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  detailsContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  locationText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '700',
  },
  locationValue: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#ff5252',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});