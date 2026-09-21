import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../../constants/theme';

export interface CardData {
  id: number;
  iconName: keyof typeof Icons;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardProps {
  card: CardData;
  onPress: () => void;
  disabled: boolean;
  size: number;
}

export function MemoryCard({ card, onPress, disabled, size }: MemoryCardProps) {
  // We use a derived value to drive the flip animation smoothly based on the boolean props
  const isFlipped = useDerivedValue(() => {
    return card.isFlipped || card.isMatched ? withSpring(180, { damping: 15, stiffness: 120 }) : withSpring(0, { damping: 15, stiffness: 120 });
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      zIndex: isFlipped.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      zIndex: isFlipped.value >= 90 ? 1 : 0,
      opacity: isFlipped.value >= 90 ? 1 : 0, // Prevent backface visibility issues
    };
  });

  const IconComponent = (Icons[card.iconName] || Icons.Circle) as React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || card.isFlipped || card.isMatched}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={styles.cardInner}>
        {/* FRONT OF CARD (Hidden when flipped) */}
        <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
          <LinearGradient
            colors={[COLORS.bgCardHover, COLORS.bgElevated] as [string, string]}
            style={styles.gradient}
          />
          <View style={styles.frontBorder} />
          <Icons.Cpu size={24} color={COLORS.borderActive} opacity={0.3} />
        </Animated.View>

        {/* BACK OF CARD (Shows the icon) */}
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardBack, 
            backAnimatedStyle,
            card.isMatched && SHADOWS.glowCyan
          ]}
        >
          <LinearGradient
            colors={(card.isMatched ? COLORS.gradientCyanPurple : ['#1D263B', '#111726']) as [string, string]}
            style={styles.gradient}
          />
          <View style={[styles.backBorder, card.isMatched && { borderColor: COLORS.cyan }]} />
          <IconComponent 
            size={32} 
            color={card.isMatched ? '#FFF' : COLORS.cyan} 
            strokeWidth={card.isMatched ? 3 : 2}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 4,
  },
  cardInner: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: COLORS.bgElevated,
  },
  cardBack: {
    backgroundColor: COLORS.bgCardHover,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  frontBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderActive,
  },
});
