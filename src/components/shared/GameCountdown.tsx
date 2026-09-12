import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameCountdownProps {
  onFinish: () => void;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({ onFinish }) => {
  const [count, setCount] = useState<number | string>(3);
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    let step = 3;

    const runStep = () => {
      scale.value = 0.3;
      opacity.value = 0;

      scale.value = withSpring(1.2, { damping: 10, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 150 });

      if (step > 0) {
        setCount(step);
        audioService.play('countdownTick');
        hapticsService.light();
      } else if (step === 0) {
        setCount('GO!');
        audioService.play('countdownGo');
        hapticsService.heavy();
      } else {
        onFinish();
        return;
      }

      step -= 1;
      setTimeout(runStep, 800);
    };

    runStep();
  }, [onFinish]);

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.circle, animatedStyle]}>
        <Text style={[styles.countText, count === 'GO!' && styles.goText]}>
          {count}
        </Text>
      </Animated.View>
      <Text style={styles.subText}>GET READY</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderWidth: 3,
    borderColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  countText: {
    color: COLORS.textPrimary,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1,
  },
  goText: {
    color: COLORS.lime,
    fontSize: 48,
  },
  subText: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
  },
});
