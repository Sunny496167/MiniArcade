import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  BounceIn,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, ChevronRight, Zap } from 'lucide-react-native';
import { ReactionTrial, LevelConfig } from '../types';
import { getReflexTier } from '../engine/reactionEngine';
import { COLORS } from '../../../constants/theme';
import { hapticsService } from '../../../services/hapticsService';
import { audioService } from '../../../services/audioService';

interface LevelCompleteOverlayProps {
  visible: boolean;
  level: number;
  scoreEarned: number;
  trials: ReactionTrial[];
  nextLevelConfig: LevelConfig | null;
  onNextLevel: () => void;
  onFinishGame: () => void;
}

export const LevelCompleteOverlay: React.FC<LevelCompleteOverlayProps> = ({
  visible,
  level,
  scoreEarned,
  trials,
  nextLevelConfig,
  onNextLevel,
  onFinishGame,
}) => {
  const slideY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      slideY.value = withSpring(0, { damping: 16, stiffness: 100 });
      hapticsService.success();
      audioService.play('win');
    } else {
      slideY.value = 500;
    }
  }, [visible]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  if (!visible) return null;

  const validTrials = trials.filter(t => t.timeMs > 0 && t.correct);
  const avg = validTrials.length > 0 
    ? Math.round(validTrials.reduce((s, t) => s + t.timeMs, 0) / validTrials.length) 
    : 0;
  const best = validTrials.length > 0 
    ? Math.min(...validTrials.map(t => t.timeMs)) 
    : 0;
  
  const tier = getReflexTier(avg || 500);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, slideStyle]}>
          <LinearGradient
            colors={['#131B2A', '#0B101A'] as any}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={[styles.iconBox, { borderColor: COLORS.cyan + '50' }]}>
                <Trophy size={36} color={COLORS.cyan} />
              </View>
              <Text style={styles.title}>LEVEL {level} COMPLETE</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG TIME</Text>
                <Text style={[styles.statValue, { color: tier.color }]}>{avg || '--'}ms</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>BEST TIME</Text>
                <Text style={styles.statValue}>{best || '--'}ms</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SCORE EARNED</Text>
                <Text style={[styles.statValue, { color: COLORS.amber }]}>+{scoreEarned}</Text>
              </View>
            </View>

            <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.tierBox}>
              <Text style={styles.tierLabel}>PERFORMANCE TIER</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.badge, { backgroundColor: tier.color + '20', borderColor: tier.color }]}>
                   <Text style={[styles.badgeText, { color: tier.color }]}>{tier.badge}</Text>
                </View>
                <Text style={[styles.tierTitle, { color: tier.color }]}>{tier.title}</Text>
              </View>
            </Animated.View>

            {nextLevelConfig ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>NEXT LEVEL: {nextLevelConfig.name}</Text>
                <Text style={styles.previewMechanic}>{nextLevelConfig.mechanic}</Text>
                
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    hapticsService.medium();
                    audioService.play('buttonPress');
                    onNextLevel();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>START LEVEL {nextLevelConfig.level}</Text>
                  <ChevronRight size={18} color="#0B0E14" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>ALL LEVELS COMPLETE!</Text>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    hapticsService.medium();
                    audioService.play('buttonPress');
                    onFinishGame();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>VIEW FINAL SCORE</Text>
                  <ChevronRight size={18} color="#0B0E14" />
                </TouchableOpacity>
              </View>
            )}

          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  tierBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '900',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  previewBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.cyan,
    marginBottom: 6,
  },
  previewMechanic: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cyan,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B0E14',
    letterSpacing: 0.5,
  },
});
