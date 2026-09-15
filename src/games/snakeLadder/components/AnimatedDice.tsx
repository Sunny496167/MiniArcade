import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { COLORS } from '../../../constants/theme';
import { hapticsService } from '../../../services/hapticsService';

interface Props {
  value: number | null;
  isRolling: boolean;
}

export function AnimatedDice({ value, isRolling }: Props) {
  const [displayValue, setDisplayValue] = useState(value || 1);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRolling) {
      // Rapidly cycle numbers while rolling
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        hapticsService.selection();
      }, 80);

      // Spin animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 300, easing: Easing.linear }),
        -1,
        false
      );
      
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1.0, { duration: 200 })
      );

      return () => {
        clearInterval(interval);
      };
    } else {
      // Settle on final value
      if (value) setDisplayValue(value);
      rotation.value = 0;
      scale.value = withTiming(1, { duration: 150 });
      if (value) {
        hapticsService.heavy();
      }
    }
  }, [isRolling, value]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ]
    };
  });

  if (!value && !isRolling) return null;

  return (
    <Animated.View style={[styles.die, animatedStyle]}>
      <Text style={styles.dieText}>{displayValue}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  die: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.amber,
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  dieText: {
    color: COLORS.bgPrimary,
    fontWeight: '900',
    fontSize: 20,
  }
});
