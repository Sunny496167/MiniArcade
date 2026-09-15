import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Trophy, RotateCcw, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Player } from '../types';
import { COLORS } from '../../../constants/theme';
import { audioService } from '../../../services/audioService';
import { hapticsService } from '../../../services/hapticsService';

interface ResultModalProps {
  visible: boolean;
  winner: Player | 'TIE' | null;
  xName: string;
  oName: string;
  xWins: number;
  oWins: number;
  ties: number;
  isMatchOver: boolean;
  onNextRound: () => void;
  onChangeMode: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  winner,
  xName,
  oName,
  xWins,
  oWins,
  ties,
  isMatchOver,
  onNextRound,
  onChangeMode,
}) => {
  const slideY = useSharedValue(200);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 220 });
      slideY.value = withSpring(0, { damping: 18, stiffness: 160 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 160 });
      slideY.value = withTiming(200, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const winnerName = winner === 'X' ? xName : winner === 'O' ? oName : null;
  const winnerColor =
    winner === 'X' ? COLORS.cyan : winner === 'O' ? COLORS.magenta : COLORS.textMuted;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <LinearGradient
            colors={['#1C2A42', '#0F1826'] as any}
            style={styles.sheetContent}
          >
            {/* ── Drag Handle ──────────────────────────────────────────────── */}
            <View style={styles.dragHandle} />

            {/* ── Result Icon + Title ───────────────────────────────────────── */}
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: winner !== 'TIE' ? `${winnerColor}55` : 'rgba(255,255,255,0.12)' },
                ]}
              >
                {winner !== 'TIE' ? (
                  <Trophy size={38} color={winnerColor} />
                ) : (
                  <View style={styles.tieIconInner}>
                    <Text style={styles.tieIconText}>TIE</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.resultTitle, { color: winnerColor }]}>
                {winner === 'TIE' ? 'STALEMATE' : 'VICTORY!'}
              </Text>

              <Text style={styles.resultSub}>
                {winner === 'TIE'
                  ? 'No winner this round'
                  : `${winnerName} wins this round`}
              </Text>
            </View>

            {/* ── Score Row ─────────────────────────────────────────────────── */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreColLabel} numberOfLines={1}>
                  {xName.toUpperCase()}
                </Text>
                <Text style={[styles.scoreColValue, { color: COLORS.cyan }]}>{xWins}</Text>
              </View>

              <View style={styles.scoreDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreColLabel}>TIES</Text>
                <Text style={[styles.scoreColValue, { color: COLORS.textSecondary }]}>
                  {ties}
                </Text>
              </View>

              <View style={styles.scoreDivider} />

              <View style={styles.scoreCol}>
                <Text style={styles.scoreColLabel} numberOfLines={1}>
                  {oName.toUpperCase()}
                </Text>
                <Text style={[styles.scoreColValue, { color: COLORS.magenta }]}>{oWins}</Text>
              </View>
            </View>

            {isMatchOver && (
              <Text style={styles.matchOverText}>
                Match complete — viewing final results…
              </Text>
            )}

            {/* ── Action Buttons ─────────────────────────────────────────────── */}
            <View style={styles.actions}>
              {!isMatchOver && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    hapticsService.medium();
                    audioService.play('buttonPress');
                    onNextRound();
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#00F0FF', '#10B981'] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGradient}
                  >
                    <RotateCcw size={16} color="#0A0E17" />
                    <Text style={styles.primaryBtnText}>NEXT ROUND</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  onChangeMode();
                }}
                activeOpacity={0.8}
              >
                <ChevronLeft size={16} color={COLORS.textSecondary} />
                <Text style={styles.secondaryBtnText}>CHANGE MODE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,7,13,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 44,
    gap: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  resultHeader: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  tieIconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tieIconText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resultSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  scoreColLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreColValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  scoreDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  matchOverText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
});
