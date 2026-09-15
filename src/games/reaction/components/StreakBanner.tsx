import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface StreakBannerProps {
  streak: number;
  multiplier: number;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ streak, multiplier }) => {
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    if (streak >= 2) {
      scaleAnim.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  if (streak < 2) return null;

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14)}
      exiting={FadeOutDown}
      style={[styles.container, animatedStyle]}
    >
      <Flame size={20} color={COLORS.amber} fill={COLORS.amber} />
      <Text style={styles.streakText}>{streak} STREAK</Text>
      <View style={styles.divider} />
      <Text style={styles.multiplierText}>{multiplier.toFixed(1)}× MULTIPLIER</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 8,
  },
  streakText: {
    color: COLORS.amber,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  multiplierText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '800',
  },
});
