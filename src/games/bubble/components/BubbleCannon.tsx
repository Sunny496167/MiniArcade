import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { BubbleColor } from '../types';
import { COLOR_MAP, BUBBLE_RADIUS } from '../engine/bubbleEngine';
import { COLORS } from '../../../constants/theme';

interface BubbleCannonProps {
  currentBubble: BubbleColor;
  nextBubble: BubbleColor;
  shotsLeft: number;
  aimAngle?: number | null;
  onSwap: () => void;
}

export const BubbleCannon: React.FC<BubbleCannonProps> = ({
  currentBubble,
  nextBubble,
  shotsLeft,
  aimAngle,
  onSwap,
}) => {
  // Convert aimAngle (radians) to rotation degrees for cannon pointer
  const degrees =
    aimAngle !== undefined && aimAngle !== null
      ? (aimAngle * 180) / Math.PI + 90
      : 0;

  return (
    <View style={styles.container}>
      {/* Shots Left Counter */}
      <View style={styles.ammoBox}>
        <Text style={styles.ammoLabel}>AMMO</Text>
        <Text style={[styles.ammoValue, shotsLeft <= 5 && { color: COLORS.rose }]}>
          {shotsLeft}
        </Text>
      </View>

      {/* Center Cannon & Active Bubble */}
      <View style={styles.cannonPlatform}>
        {/* Rotating Barrel pointer */}
        <View
          style={[
            styles.barrelPointer,
            { transform: [{ rotate: `${degrees}deg` }] },
          ]}
        >
          <View style={styles.barrelTip} />
        </View>

        {/* Loaded Bubble */}
        <View
          style={[
            styles.loadedBubble,
            { backgroundColor: COLOR_MAP[currentBubble] },
          ]}
        >
          <View style={styles.bubbleGloss} />
        </View>
      </View>

      {/* Next Bubble Preview & Swap Button */}
      <View style={styles.nextBox}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <TouchableOpacity
          style={styles.swapBtn}
          onPress={onSwap}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.nextBubblePreview,
              { backgroundColor: COLOR_MAP[nextBubble] },
            ]}
          >
            <View style={styles.bubbleGlossMini} />
          </View>
          <View style={styles.swapIconCircle}>
            <RefreshCw size={10} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: 320,
    alignSelf: 'center',
  },
  ammoBox: {
    alignItems: 'center',
    minWidth: 44,
  },
  ammoLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ammoValue: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },
  cannonPlatform: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(0,240,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  barrelPointer: {
    position: 'absolute',
    width: 6,
    height: 38,
    top: -12,
    alignItems: 'center',
  },
  barrelTip: {
    width: 6,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
  },
  loadedBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  bubbleGloss: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  bubbleGlossMini: {
    position: 'absolute',
    top: 2,
    left: 3,
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  nextBox: {
    alignItems: 'center',
    minWidth: 44,
  },
  nextLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  swapBtn: {
    position: 'relative',
    marginTop: 2,
  },
  nextBubblePreview: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  swapIconCircle: {
    position: 'absolute',
    bottom: -3,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
