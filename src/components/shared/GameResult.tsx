import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Sparkles, RotateCcw, ArrowRight, Home, Flame } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { GameMetadata, GameContextualStat } from '../../types/arcade';
import { useArcade } from '../../context/ArcadeContext';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameResultProps {
  game: GameMetadata;
  score: number;
  isNewBest: boolean;
  xpEarned: number;
  stats: GameContextualStat[];
  onPlayAgain: () => void;
  onNextGame: () => void;
  onBackToArcade: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  game,
  score,
  isNewBest,
  xpEarned,
  stats,
  onPlayAgain,
  onNextGame,
  onBackToArcade,
}) => {
  const { profile, stats: allGameStats } = useArcade();
  const currentBest = Math.max(allGameStats[game.id]?.highScore || 0, score);

  const xpProgress = Math.min(
    Math.max(profile.currentXp / profile.xpToNextLevel, 0),
    1
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Header */}
        <View style={styles.header}>
          <Text style={styles.completeTitle}>MATCH COMPLETE</Text>
          <Text style={styles.gameSubtitle}>{game.title}</Text>

          {isNewBest && (
            <View style={styles.pbBadge}>
              <Flame size={14} color={COLORS.amber} />
              <Text style={styles.pbBadgeText}>NEW PERSONAL BEST!</Text>
            </View>
          )}
        </View>

        {/* Score Showcase Card */}
        <View style={[styles.scoreCard, SHADOWS.card]}>
          <LinearGradient
            colors={['#16233B', '#0E1626']}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreNumberLabel}>FINAL SCORE</Text>
            <Text
              style={[
                styles.scoreNumber,
                { color: isNewBest ? COLORS.amber : game.accentColor },
              ]}
            >
              {score.toLocaleString()}
            </Text>

            {/* XP Bar Animation */}
            <View style={styles.xpBox}>
              <View style={styles.xpLabelRow}>
                <View style={styles.xpRewardTag}>
                  <Sparkles size={14} color={COLORS.cyan} />
                  <Text style={styles.xpRewardText}>+{xpEarned} XP EARNED</Text>
                </View>
                <Text style={styles.levelProgressText}>
                  LVL {profile.level} ({Math.round(xpProgress * 100)}%)
                </Text>
              </View>

              <View style={styles.xpTrack}>
                <LinearGradient
                  colors={['#00F0FF', '#10B981'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.xpFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Contextual Stats Breakdown */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionHeader}>PERFORMANCE METRICS</Text>
          <View style={styles.statsGrid}>
            {/* Best Score always displayed */}
            <View style={styles.statCell}>
              <Trophy size={16} color={COLORS.amber} />
              <Text style={styles.statCellLabel}>BEST RECORD</Text>
              <Text style={styles.statCellValue}>
                {currentBest.toLocaleString()}
              </Text>
            </View>

            {/* Game Contextual Stats (e.g. food, max tile, reaction time) */}
            {stats.map((stat, idx) => (
              <View
                key={idx}
                style={[
                  styles.statCell,
                  stat.isHighlight && styles.statCellHighlight,
                ]}
              >
                <Text style={styles.statCellLabel}>
                  {stat.label.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.statCellValue,
                    stat.isHighlight && { color: COLORS.cyan },
                  ]}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Play Again */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              hapticsService.medium();
              audioService.play('buttonPress');
              onPlayAgain();
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[game.accentColor, game.secondaryColor] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <RotateCcw size={18} color="#0B0E14" />
              <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Next Game */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              hapticsService.light();
              audioService.play('buttonPress');
              onNextGame();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>NEXT GAME</Text>
            <ArrowRight size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Back to Arcade */}
          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => {
              hapticsService.light();
              audioService.play('buttonPress');
              onBackToArcade();
            }}
            activeOpacity={0.7}
          >
            <Home size={16} color={COLORS.textMuted} />
            <Text style={styles.tertiaryBtnText}>BACK TO ARCADE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  completeTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  gameSubtitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  pbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  pbBadgeText: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },
  scoreGradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  scoreNumberLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 4,
  },
  xpBox: {
    width: '100%',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpRewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpRewardText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
  levelProgressText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  xpTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsSection: {
    width: '100%',
    marginTop: 20,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCell: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statCellHighlight: {
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  statCellLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statCellValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 16,
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
    color: '#0B0E14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  tertiaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tertiaryBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
