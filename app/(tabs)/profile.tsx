import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Trophy,
  Flame,
  Clock,
  Gamepad2,
  Edit2,
  Check,
  Zap,
} from 'lucide-react-native';
import { Header } from '../../src/components/shared/Header';
import { useArcade } from '../../src/context/ArcadeContext';
import { GAMES_REGISTRY } from '../../src/constants/gamesRegistry';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { audioService } from '../../src/services/audioService';
import { hapticsService } from '../../src/services/hapticsService';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, stats, updateUsername } = useArcade();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  const xpProgress = Math.min(
    Math.max(profile.currentXp / profile.xpToNextLevel, 0),
    1
  );

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  const handleSaveName = async () => {
    hapticsService.light();
    audioService.play('buttonPress');
    await updateUsername(nameInput);
    setIsEditingName(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HERO CARD */}
        <View style={[styles.profileCard, SHADOWS.card]}>
          <LinearGradient
            colors={['#17233B', '#0E1626']}
            style={styles.profileGradient}
          >
            <View style={styles.avatarRow}>
              <LinearGradient
                colors={COLORS.gradientCyanPurple as any}
                style={styles.largeAvatar}
              >
                <Text style={styles.avatarLetters}>
                  {profile.username.substring(0, 2).toUpperCase()}
                </Text>
              </LinearGradient>

              <View style={styles.nameSection}>
                <View style={styles.usernameRow}>
                  <Text style={styles.usernameText}>{profile.username}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      hapticsService.light();
                      audioService.play('buttonPress');
                      setNameInput(profile.username);
                      setIsEditingName(true);
                    }}
                    style={styles.editBtn}
                  >
                    <Edit2 size={14} color={COLORS.cyan} />
                  </TouchableOpacity>
                </View>

                <View style={styles.rankPill}>
                  <Zap size={12} color={COLORS.cyan} />
                  <Text style={styles.rankPillText}>
                    CYBER RUNNER • TIER {profile.level}
                  </Text>
                </View>
              </View>
            </View>

            {/* Level & XP Bar */}
            <View style={styles.levelProgressBox}>
              <View style={styles.levelRow}>
                <Text style={styles.levelTitle}>PLAYER LEVEL {profile.level}</Text>
                <Text style={styles.xpText}>
                  {profile.currentXp} / {profile.xpToNextLevel} XP
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#00F0FF', '#10B981'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>

              <Text style={styles.totalXpLabel}>
                TOTAL XP EARNED: {profile.totalXp.toLocaleString()} XP
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* LIFETIME METRICS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>LIFETIME METRICS</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCell}>
            <Gamepad2 size={20} color={COLORS.cyan} />
            <Text style={styles.metricValue}>{profile.gamesPlayed}</Text>
            <Text style={styles.metricLabel}>MATCHES PLAYED</Text>
          </View>

          <View style={styles.metricCell}>
            <Trophy size={20} color={COLORS.amber} />
            <Text style={styles.metricValue}>{profile.gamesWon}</Text>
            <Text style={styles.metricLabel}>TOTAL VICTORIES</Text>
          </View>

          <View style={styles.metricCell}>
            <Zap size={20} color={COLORS.lime} />
            <Text style={styles.metricValue}>{winRate}%</Text>
            <Text style={styles.metricLabel}>WIN RATE</Text>
          </View>

          <View style={styles.metricCell}>
            <Flame size={20} color={COLORS.rose} />
            <Text style={styles.metricValue}>{profile.dailyStreak}d</Text>
            <Text style={styles.metricLabel}>CURRENT STREAK</Text>
          </View>
        </View>

        {/* GAME PERFORMANCE BREAKDOWN */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>PER-GAME HIGH SCORES</Text>
        </View>

        <View style={styles.gameStatsList}>
          {GAMES_REGISTRY.map((game) => {
            const gameStat = stats[game.id] || { highScore: 0, timesPlayed: 0 };
            return (
              <View key={game.id} style={styles.gameStatCard}>
                <View
                  style={[
                    styles.gameAccentPill,
                    { backgroundColor: game.accentColor },
                  ]}
                />

                <View style={styles.gameStatInfo}>
                  <Text style={styles.gameStatTitle}>{game.title}</Text>
                  <Text style={styles.gameStatCategory}>
                    {game.category.toUpperCase()} • {gameStat.timesPlayed} MATCHES
                  </Text>
                </View>

                <View style={styles.highScoreBox}>
                  <Trophy size={14} color={COLORS.amber} />
                  <Text style={styles.highScoreNumber}>
                    {gameStat.highScore.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* SETTINGS SHORTCUT */}
        <TouchableOpacity
          style={styles.settingsShortcut}
          onPress={() => {
            hapticsService.light();
            audioService.play('buttonPress');
            router.push('/settings' as any);
          }}
          activeOpacity={0.8}
        >
          <Settings size={18} color={COLORS.cyan} />
          <Text style={styles.settingsShortcutText}>ARCADE AUDIO & SETTINGS</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Edit Username Modal */}
      <Modal transparent visible={isEditingName} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ENTER CALLSIGN</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Username"
              placeholderTextColor={COLORS.textMuted}
              maxLength={15}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditingName(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveName}
              >
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetters: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  nameSection: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usernameText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  editBtn: {
    padding: 4,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  rankPillText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
  },
  levelProgressBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalXpLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  metricCell: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gameStatsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  gameStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gameAccentPill: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  gameStatInfo: {
    flex: 1,
  },
  gameStatTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  gameStatCategory: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  highScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  highScoreNumber: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  settingsShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  settingsShortcutText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '900',
  },
});
