import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  ZoomIn,
  FadeIn,
  BounceIn,
} from 'react-native-reanimated';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw, Target, Hand } from 'lucide-react-native';
import { ReactionState } from '../types';
import { getReflexTier } from '../engine/reactionEngine';
import { COLORS } from '../../../constants/theme';

interface ChallengeArenaProps {
  state: ReactionState;
  onPressIn: () => void;
  onPressOut: () => void;
  onRetry: () => void;
  onNextTrial: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ChallengeArena = ({
  state,
  onPressIn,
  onPressOut,
  onRetry,
  onNextTrial,
}: ChallengeArenaProps) => {
  const pulseAnim = useSharedValue(1);
  const ringAnim = useSharedValue(1);
  const ringOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (state.phase === 'WAITING') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      ringAnim.value = withRepeat(withTiming(1.5, { duration: 1200 }), -1, false);
      ringOpacity.value = withRepeat(withTiming(0, { duration: 1200 }), -1, false);
    } else {
      pulseAnim.value = withSpring(1);
      ringAnim.value = 1;
      ringOpacity.value = 0;
    }
  }, [state.phase]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringAnim.value }],
    opacity: ringOpacity.value,
  }));

  const holdBarWidth = useSharedValue(0);
  useEffect(() => {
    if (state.phase === 'HOLD_NOW') {
      holdBarWidth.value = withTiming(100, { duration: 500, easing: Easing.linear });
    } else {
      holdBarWidth.value = 0;
    }
  }, [state.phase]);
  const holdBarStyle = useAnimatedStyle(() => ({
    width: `${holdBarWidth.value}%`,
  }));

  const renderContent = () => {
    switch (state.phase) {
      case 'WAITING':
      case 'DECOY':
        let title = 'WAIT...';
        let sub = 'Watch for the signal';
        let color = COLORS.amber;
        let bgStyle: any = styles.waitingBox;

        if (state.challengeType === 'COLOR_MATCH') {
          title = 'TAP CYAN';
          sub = 'Ignore Red Decoys!';
          color = COLORS.cyan;
        } else if (state.challengeType === 'HOLD') {
          title = 'GET READY';
          sub = 'Prepare to HOLD';
        } else if (state.challengeType === 'DOUBLE_TAP') {
          title = 'DOUBLE TAP';
          sub = 'Get ready to tap 2x';
        }

        if (state.phase === 'DECOY') {
           title = 'IGNORE!';
           color = COLORS.rose;
           bgStyle = [styles.waitingBox, { borderColor: COLORS.rose + '50' }];
        }

        return (
          <Animated.View entering={ZoomIn.duration(300)} style={[styles.box, bgStyle, pulseStyle]}>
            <Animated.View style={[styles.ring, { borderColor: color }, ringStyle]} />
            <Zap size={48} color={color} style={{ marginBottom: 16 }} />
            <Text style={[styles.waitingTitle, { color }]}>{title}</Text>
            <Text style={styles.subInstruction}>{sub}</Text>
          </Animated.View>
        );

      case 'REACT_NOW':
        let reactTitle = 'TAP NOW!';
        let reactColor = COLORS.lime;
        let reactBg: any = styles.reactBox;

        if (state.challengeType === 'COLOR_MATCH') {
          reactColor = COLORS.cyan;
          reactBg = [styles.reactBox, { backgroundColor: COLORS.cyan }];
        } else if (state.challengeType === 'DOUBLE_TAP') {
          reactTitle = 'TAP 2× NOW!';
        }
        
        return (
          <Animated.View entering={ZoomIn.duration(200).springify().damping(12)} style={[styles.box, reactBg]}>
             <Target size={64} color="#0B0E14" style={{ marginBottom: 16 }} />
             <Text style={styles.reactTitle}>{reactTitle}</Text>
          </Animated.View>
        );

      case 'HOLD_NOW':
        return (
          <Animated.View entering={ZoomIn.duration(200).springify().damping(12)} style={[styles.box, styles.holdBox]}>
             <Hand size={64} color="#0B0E14" style={{ marginBottom: 16 }} />
             <Text style={styles.reactTitle}>HOLD!</Text>
             <View style={styles.holdBarContainer}>
               <Animated.View style={[styles.holdBarFill, holdBarStyle]} />
             </View>
          </Animated.View>
        );

      case 'TOO_EARLY':
      case 'WRONG_COLOR':
      case 'MISSED':
        let errTitle = 'TOO EARLY!';
        let errSub = 'Wait for the green signal.';
        if (state.phase === 'WRONG_COLOR') {
           errTitle = 'WRONG COLOR!';
           errSub = 'You tapped a decoy!';
        } else if (state.phase === 'MISSED') {
           errTitle = 'TOO SLOW!';
           errSub = 'You missed the window.';
        }
        return (
          <Animated.View entering={BounceIn.duration(400)} style={[styles.box, styles.errorBox]}>
            <AlertTriangle size={48} color={COLORS.rose} />
            <Text style={styles.errorTitle}>{errTitle}</Text>
            <Text style={styles.subInstruction}>{errSub}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <RotateCcw size={16} color="#0B0E14" />
              <Text style={styles.retryBtnText}>RETRY</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'ROUND_RESULT':
        const lastTier = getReflexTier(state.lastTimeMs || 300);
        return (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.box, styles.resultBox]}>
            <CheckCircle2 size={56} color={lastTier.color} />
            <Text style={[styles.resultTime, { color: lastTier.color }]}>
              {state.lastTimeMs} ms
            </Text>
            <Text style={styles.tierTitle}>{lastTier.title}</Text>
            <Text style={styles.ptsText}>+{state.levelScore} PTS</Text>
            
            <TouchableOpacity style={styles.nextRoundBtn} onPress={onNextTrial} activeOpacity={0.85}>
              <Text style={styles.nextRoundText}>NEXT</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return (
          <Animated.View entering={FadeIn} style={styles.box}>
            <Text style={[styles.waitingTitle, { color: COLORS.textSecondary }]}>INITIALIZING...</Text>
          </Animated.View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.touchArea}
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (SCREEN_WIDTH - 48) / 2,
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: (SCREEN_WIDTH - 48) / 2,
    borderWidth: 4,
  },
  waitingBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  waitingTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subInstruction: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  reactBox: {
    backgroundColor: COLORS.lime,
  },
  holdBox: {
    backgroundColor: COLORS.amber,
  },
  reactTitle: {
    color: '#0B0E14',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  holdBarContainer: {
    width: '60%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  holdBarFill: {
    height: '100%',
    backgroundColor: '#0B0E14',
    borderRadius: 6,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.rose,
  },
  errorTitle: {
    color: COLORS.rose,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.rose,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 24,
  },
  retryBtnText: {
    color: '#0B0E14',
    fontSize: 15,
    fontWeight: '900',
  },
  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultTime: {
    fontSize: 54,
    fontWeight: '900',
    marginVertical: 4,
  },
  tierTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ptsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  nextRoundBtn: {
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 24,
  },
  nextRoundText: {
    color: '#0B0E14',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
