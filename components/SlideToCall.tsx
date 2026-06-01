import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const THUMB_SIZE = 60;
const SLIDER_WIDTH = width - 60;
const MAX_TRANSLATE = SLIDER_WIDTH - THUMB_SIZE;

export default function SlideToUnlock({
  onUnlock,
}: {
  onUnlock?: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [unlocked, setUnlocked] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !unlocked,

      onPanResponderMove: (_, gestureState) => {
        const x = Math.max(
          0,
          Math.min(gestureState.dx, MAX_TRANSLATE)
        );

        translateX.setValue(x);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > MAX_TRANSLATE * 0.85) {
          Animated.spring(translateX, {
            toValue: MAX_TRANSLATE,
            useNativeDriver: true,
          }).start();

          setUnlocked(true);
          onUnlock?.();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.slider}>
      <Text style={styles.text}>
        Deslize para pedir ajuda
      </Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Text style={styles.arrow}>››</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: SLIDER_WIDTH,
    height: THUMB_SIZE,
    borderRadius: 30,
    backgroundColor: '#222',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#aaa',
    fontSize: 16,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});