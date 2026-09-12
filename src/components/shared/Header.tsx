import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, Settings, Flame, Trophy } from 'lucide-react-native';
import { useArcade } from '../../context/ArcadeContext';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

export const Header: React.FC = () => {
  const router = useRouter();
  const { profile, settings, updateSettings } = useArcade();

  const xpProgress = Math.min(
    Math.max(profile.currentXp / profile.xpToNextLevel, 0),
    1
  );

  const toggleSound = () => {
    hapticsService.light();
    audioService.play('buttonPress');
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <View style={styles.container}>
      {/* Left: Player Avatar, Level, and XP Bar */}
      <TouchableOpacity
        style={styles.profileSection}
        activeOpacity={0.8}
        onPress={() => {
          hapticsService.light();
          audioService.play('buttonPress');
          router.push('/(tabs)/profile' as any);
        }}
      >
        <LinearGradient
          colors={COLORS.gradientCyanPurple as any}
          style={styles.avatarGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>
              {profile.username.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.playerInfo}>
          <View style={styles.levelRow}>
            <Text style={styles.username}>{profile.username}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LVL {profile.level}</Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpTrack}>
            <LinearGradient
              colors={['#00F0FF', '#10B981'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpFill, { width: `${xpProgress * 100}%` }]}
            />
          </View>
          <Text style={styles.xpRatio}>
            {profile.currentXp} / {profile.xpToNextLevel} XP
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right: Streak & Controls */}
      <View style={styles.actions}>
        {/* Daily Streak */}
        <View style={styles.streakBadge}>
          <Flame size={15} color={COLORS.amber} />
          <Text style={styles.streakText}>{profile.dailyStreak}d</Text>
        </View>

        {/* Audio Toggle */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={toggleSound}
          activeOpacity={0.7}
        >
          {settings.soundEnabled ? (
            <Volume2 size={18} color={COLORS.cyan} />
          ) : (
            <VolumeX size={18} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            hapticsService.light();
            audioService.play('buttonPress');
            router.push('/settings' as any);
          }}
          activeOpacity={0.7}
        >
          <Settings size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  playerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  levelText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
  },
  xpTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
    width: '90%',
  },
  xpFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpRatio: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
