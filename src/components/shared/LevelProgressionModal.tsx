import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Trophy, Star, ArrowRight, RotateCcw, Grid, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface LevelProgressionModalProps {
  visible: boolean;
  currentLevel: number;
  nextLevel: number;
  totalLevels?: number;
  score: number;
  starsEarned: number; // 1 to 3
  xpEarned: number;
  nextLevelPreview?: string;
  stats?: { label: string; value: string | number }[];
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelSelect?: () => void;
}

export const LevelProgressionModal: React.FC<LevelProgressionModalProps> = ({
  visible,
  currentLevel,
  nextLevel,
  totalLevels = 30,
  score,
  starsEarned,
  xpEarned,
  nextLevelPreview,
  stats = [],
  onNextLevel,
  onReplayLevel,
  onOpenLevelSelect,
}) => {
  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);

  // Star animations
  const star1Scale = useSharedValue(0);
  const star2Scale = useSharedValue(0);
  const star3Scale = useSharedValue(0);

  // Level badge morph animation
  const badgeTranslateX = useSharedValue(-20);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      audioService.play('levelUp');
      hapticsService.success();

      opacityAnim.value = withTiming(1, { duration: 250 });
      scaleAnim.value = withSpring(1, { damping: 14, stiffness: 150 });

      badgeTranslateX.value = withDelay(300, withSpring(0, { damping: 12 }));
      badgeOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

      // Sequential star bounce
      if (starsEarned >= 1) {
        star1Scale.value = withDelay(400, withSpring(1.2, { damping: 8 }));
      }
      if (starsEarned >= 2) {
        star2Scale.value = withDelay(650, withSpring(1.2, { damping: 8 }));
      }
      if (starsEarned >= 3) {
        star3Scale.value = withDelay(900, withSpring(1.2, { damping: 8 }));
      }
    } else {
      opacityAnim.value = withTiming(0, { duration: 180 });
      scaleAnim.value = withTiming(0.85, { duration: 180 });
      star1Scale.value = 0;
      star2Scale.value = 0;
      star3Scale.value = 0;
      badgeOpacity.value = 0;
      badgeTranslateX.value = -20;
    }
  }, [visible, starsEarned]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateX: badgeTranslateX.value }],
  }));

  const star1Style = useAnimatedStyle(() => ({ transform: [{ scale: star1Scale.value }] }));
  const star2Style = useAnimatedStyle(() => ({ transform: [{ scale: star2Scale.value }] }));
  const star3Style = useAnimatedStyle(() => ({ transform: [{ scale: star3Scale.value }] }));

  const hasNext = nextLevel <= totalLevels;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.cardContainer, modalStyle]}>
          <LinearGradient
            colors={['#162338', '#0D1524'] as any}
            style={styles.cardContent}
          >
            {/* Header Badge */}
            <View style={styles.kickerRow}>
              <Sparkles size={14} color={COLORS.amber} />
              <Text style={styles.kickerText}>LEVEL CLEARED!</Text>
              <Sparkles size={14} color={COLORS.amber} />
            </View>

            {/* Level Transition Indicator */}
            <Animated.View style={[styles.transitionContainer, badgeStyle]}>
              <View style={styles.levelBadgeFrom}>
                <Text style={styles.badgeLabel}>COMPLETED</Text>
                <Text style={styles.badgeNumber}>LVL {currentLevel}</Text>
              </View>

              <View style={styles.arrowCircle}>
                <ArrowRight size={20} color={COLORS.cyan} />
              </View>

              <View style={styles.levelBadgeTo}>
                <Text style={styles.badgeLabelTo}>NEXT WAVE</Text>
                <Text style={styles.badgeNumberTo}>LVL {nextLevel}</Text>
              </View>
            </Animated.View>

            {/* Star Rating */}
            <View style={styles.starsRow}>
              <Animated.View style={star1Style}>
                <Star
                  size={38}
                  color={starsEarned >= 1 ? COLORS.amber : 'rgba(255,255,255,0.15)'}
                  fill={starsEarned >= 1 ? COLORS.amber : 'transparent'}
                />
              </Animated.View>
              <Animated.View style={[star2Style, { marginHorizontal: 12, top: -8 }]}>
                <Star
                  size={46}
                  color={starsEarned >= 2 ? COLORS.amber : 'rgba(255,255,255,0.15)'}
                  fill={starsEarned >= 2 ? COLORS.amber : 'transparent'}
                />
              </Animated.View>
              <Animated.View style={star3Style}>
                <Star
                  size={38}
                  color={starsEarned >= 3 ? COLORS.amber : 'rgba(255,255,255,0.15)'}
                  fill={starsEarned >= 3 ? COLORS.amber : 'transparent'}
                />
              </Animated.View>
            </View>

            {/* Score & XP Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>SCORE</Text>
                <Text style={styles.metricValue}>{score.toLocaleString()}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>XP EARNED</Text>
                <Text style={[styles.metricValue, { color: COLORS.cyan }]}>+{xpEarned}</Text>
              </View>
            </View>

            {/* Optional Contextual Stats */}
            {stats.length > 0 && (
              <View style={styles.statsList}>
                {stats.map((s, idx) => (
                  <View key={idx} style={styles.statLine}>
                    <Text style={styles.statLineLabel}>{s.label}</Text>
                    <Text style={styles.statLineValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Next Level Preview */}
            {nextLevelPreview && hasNext && (
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>COMING UP IN LEVEL {nextLevel}:</Text>
                <Text style={styles.previewText}>{nextLevelPreview}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              {hasNext ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    hapticsService.medium();
                    audioService.play('buttonPress');
                    onNextLevel();
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#00F0FF', '#10B981'] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGradient}
                  >
                    <Text style={styles.primaryBtnText}>CONTINUE TO LEVEL {nextLevel}</Text>
                    <ArrowRight size={18} color="#070B12" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.allClearedBadge}>
                  <Trophy size={20} color={COLORS.amber} />
                  <Text style={styles.allClearedText}>ALL 30 LEVELS CONQUERED!</Text>
                </View>
              )}

              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    hapticsService.light();
                    audioService.play('buttonPress');
                    onReplayLevel();
                  }}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={14} color={COLORS.textSecondary} />
                  <Text style={styles.secondaryBtnText}>Replay Level</Text>
                </TouchableOpacity>

                {onOpenLevelSelect && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      hapticsService.light();
                      audioService.play('buttonPress');
                      onOpenLevelSelect();
                    }}
                    activeOpacity={0.8}
                  >
                    <Grid size={14} color={COLORS.textSecondary} />
                    <Text style={styles.secondaryBtnText}>Level Select</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kickerText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  transitionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
  },
  levelBadgeFrom: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  badgeNumber: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeTo: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  badgeLabelTo: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: '800',
  },
  badgeNumberTo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  statsList: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLineLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statLineValue: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  previewBox: {
    width: '100%',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  previewTitle: {
    color: COLORS.purple,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    color: '#070B12',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  allClearedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.amber,
  },
  allClearedText: {
    color: COLORS.amber,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
