import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Trophy, Sparkles, CheckCircle2, Lock, Play, ArrowRight } from 'lucide-react-native';
import { Header } from '../../src/components/shared/Header';
import { useArcade } from '../../src/context/ArcadeContext';
import { GAMES_REGISTRY } from '../../src/constants/gamesRegistry';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { audioService } from '../../src/services/audioService';
import { hapticsService } from '../../src/services/hapticsService';

export default function ChallengesScreen() {
  const router = useRouter();
  const { profile, dailyChallenge, achievements } = useArcade();

  const challengeGame = dailyChallenge
    ? GAMES_REGISTRY.find((g) => g.id === dailyChallenge.gameId)
    : null;

  const challengeProgress = dailyChallenge
    ? Math.min(
        Math.max(dailyChallenge.currentValue / dailyChallenge.targetValue, 0),
        1
      )
    : 0;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DAILY STREAK BANNER */}
        <View style={[styles.streakCard, SHADOWS.card]}>
          <LinearGradient
            colors={['#241C10', '#14110C']}
            style={styles.streakGradient}
          >
            <View style={styles.streakHeader}>
              <View style={styles.streakIconWrapper}>
                <Flame size={24} color={COLORS.amber} />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>
                  {profile.dailyStreak} DAY STREAK!
                </Text>
                <Text style={styles.streakSubtitle}>
                  Play any arcade title daily to boost XP multiplier
                </Text>
              </View>
            </View>

            {/* Streak Milestone Pills */}
            <View style={styles.streakPillsRow}>
              {[1, 2, 3, 5, 7].map((days) => {
                const reached = profile.dailyStreak >= days;
                return (
                  <View
                    key={days}
                    style={[
                      styles.streakPill,
                      reached && styles.streakPillReached,
                    ]}
                  >
                    <Text
                      style={[
                        styles.streakPillText,
                        reached && styles.streakPillTextReached,
                      ]}
                    >
                      {days}d
                    </Text>
                    {reached ? (
                      <CheckCircle2 size={12} color={COLORS.amber} />
                    ) : (
                      <Lock size={10} color={COLORS.textMuted} />
                    )}
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </View>

        {/* TODAY'S DAILY QUEST */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACTIVE DAILY QUEST</Text>
        </View>

        {dailyChallenge && challengeGame ? (
          <View style={[styles.challengeCard, SHADOWS.card]}>
            <LinearGradient
              colors={['#172238', '#0F1626']}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeTop}>
                <View style={styles.questBadge}>
                  <Text style={styles.questBadgeText}>TODAY'S MISSION</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Sparkles size={12} color={COLORS.cyan} />
                  <Text style={styles.rewardBadgeText}>
                    +{dailyChallenge.xpReward} XP
                  </Text>
                </View>
              </View>

              <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
              <Text style={styles.challengeDesc}>
                {dailyChallenge.description}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>PROGRESS</Text>
                  <Text style={styles.progressValues}>
                    {dailyChallenge.currentValue} / {dailyChallenge.targetValue}
                  </Text>
                </View>

                <View style={styles.track}>
                  <LinearGradient
                    colors={['#F59E0B', '#10B981'] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.trackFill,
                      { width: `${challengeProgress * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Action Button */}
              {dailyChallenge.completed ? (
                <View style={styles.completedBanner}>
                  <CheckCircle2 size={16} color={COLORS.lime} />
                  <Text style={styles.completedText}>MISSION COMPLETED!</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.playQuestBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    hapticsService.medium();
                    audioService.play('buttonPress');
                    router.push(`/game/${challengeGame.id}` as any);
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.amber, COLORS.rose] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.playQuestGradient}
                  >
                    <Play size={16} color="#0B0E14" fill="#0B0E14" />
                    <Text style={styles.playQuestText}>
                      PLAY {challengeGame.title.toUpperCase()}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ) : null}

        {/* ACHIEVEMENTS TROPHY SHOWCASE */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ARCADE TROPHIES</Text>
          <Text style={styles.trophyCount}>
            {unlockedCount} / {achievements.length} UNLOCKED
          </Text>
        </View>

        <View style={styles.achievementsList}>
          {achievements.map((ach) => (
            <View
              key={ach.id}
              style={[
                styles.achievementCard,
                ach.unlocked && styles.achievementCardUnlocked,
              ]}
            >
              <View
                style={[
                  styles.achIconBox,
                  ach.unlocked && styles.achIconBoxUnlocked,
                ]}
              >
                <Trophy
                  size={20}
                  color={ach.unlocked ? COLORS.amber : COLORS.textMuted}
                />
              </View>

              <View style={styles.achInfo}>
                <View style={styles.achTitleRow}>
                  <Text
                    style={[
                      styles.achTitle,
                      ach.unlocked && styles.achTitleUnlocked,
                    ]}
                  >
                    {ach.title}
                  </Text>
                  <View style={styles.achXpBadge}>
                    <Text style={styles.achXpText}>+{ach.xpReward} XP</Text>
                  </View>
                </View>

                <Text style={styles.achDesc}>{ach.description}</Text>

                {ach.unlocked ? (
                  <Text style={styles.unlockedDate}>UNLOCKED ✓</Text>
                ) : ach.targetProgress && ach.targetProgress > 1 ? (
                  <View style={styles.achProgressTrack}>
                    <View
                      style={[
                        styles.achProgressFill,
                        {
                          width: `${Math.min(
                            ((ach.progress || 0) / ach.targetProgress) * 100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  streakCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    color: COLORS.amber,
    fontSize: 16,
    fontWeight: '900',
  },
  streakSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  streakPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  streakPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakPillReached: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  streakPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  streakPillTextReached: {
    color: COLORS.amber,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  trophyCount: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  challengeCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questBadgeText: {
    color: COLORS.amber,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardBadgeText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  challengeTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  challengeDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressValues: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedText: {
    color: COLORS.lime,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playQuestBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  playQuestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  playQuestText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  achievementsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.65,
  },
  achievementCardUnlocked: {
    opacity: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(26, 34, 52, 0.8)',
  },
  achIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achIconBoxUnlocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  achInfo: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achTitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  achTitleUnlocked: {
    color: COLORS.textPrimary,
  },
  achXpBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  achXpText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
  },
  achDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  unlockedDate: {
    color: COLORS.lime,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  achProgressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  achProgressFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
    borderRadius: 2,
  },
});
