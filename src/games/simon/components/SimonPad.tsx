import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../../constants/theme';
import { hapticsService } from '../../../services/hapticsService';

export type SimonColor = 'cyan' | 'magenta' | 'lime' | 'amber';

export const SIMON_COLORS: Record<SimonColor, { base: string; glow: string; shadow: any }> = {
  cyan: { base: '#008899', glow: COLORS.cyan, shadow: { shadowColor: COLORS.cyan } },
  magenta: { base: '#990044', glow: COLORS.magenta, shadow: { shadowColor: COLORS.magenta } },
  lime: { base: '#007744', glow: COLORS.lime, shadow: { shadowColor: COLORS.lime } },
  amber: { base: '#995500', glow: COLORS.amber, shadow: { shadowColor: COLORS.amber } },
};

interface SimonPadProps {
  color: SimonColor;
  isActive: boolean; // Driven by the game sequence playback
  onPress: () => void;
  disabled: boolean;
  size: number;
}

export function SimonPad({ color, isActive, onPress, disabled, size }: SimonPadProps) {
  const activationLevel = useSharedValue(0);

  // React to game sequence activation
  useEffect(() => {
    if (isActive) {
      activationLevel.value = withTiming(1, { duration: 100 });
    } else {
      activationLevel.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const handlePressIn = () => {
    if (disabled) return;
    hapticsService.light();
    activationLevel.value = withSpring(1);
  };

  const handlePressOut = () => {
    if (disabled) return;
    activationLevel.value = withTiming(0, { duration: 200 });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      activationLevel.value,
      [0, 1],
      [SIMON_COLORS[color].base, SIMON_COLORS[color].glow]
    );
    
    return {
      backgroundColor: bg,
      transform: [
        { scale: 1 + activationLevel.value * 0.05 }
      ],
      shadowOpacity: activationLevel.value * 0.8,
      shadowRadius: 5 + activationLevel.value * 15,
      elevation: activationLevel.value * 10,
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[{ width: size, height: size, margin: 8 }]}
    >
      <Animated.View
        style={[
          styles.pad,
          { width: size, height: size },
          SIMON_COLORS[color].shadow,
          animatedStyle
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pad: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
  },
});
