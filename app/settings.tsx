import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Volume2,
  Music,
  Smartphone,
  Trash2,
  ShieldAlert,
  Info,
} from 'lucide-react-native';
import { useArcade } from '../src/context/ArcadeContext';
import { COLORS } from '../src/constants/theme';
import { audioService } from '../src/services/audioService';
import { hapticsService } from '../src/services/hapticsService';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, resetAllData } = useArcade();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleToggleSound = (val: boolean) => {
    hapticsService.light();
    updateSettings({ soundEnabled: val });
    if (val) audioService.play('buttonPress');
  };

  const handleToggleMusic = (val: boolean) => {
    hapticsService.light();
    updateSettings({ musicEnabled: val });
  };

  const handleToggleHaptics = (val: boolean) => {
    if (val) hapticsService.medium();
    updateSettings({ hapticsEnabled: val });
  };

  const handleReset = async () => {
    hapticsService.heavy();
    audioService.play('gameOver');
    await resetAllData();
    setConfirmReset(false);
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            hapticsService.light();
            audioService.play('buttonPress');
            router.back();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>ARCADE SETTINGS</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* AUDIO & SENSORY SECTION */}
        <Text style={styles.sectionHeader}>AUDIO & SENSORY FEEDBACK</Text>

        <View style={styles.settingsGroup}>
          {/* Sound FX */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
                <Volume2 size={18} color={COLORS.cyan} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Sound Effects</Text>
                <Text style={styles.settingSubtitle}>
                  In-game sounds, score chimes, and action feedback
                </Text>
              </View>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#1E293B', true: 'rgba(0, 240, 255, 0.4)' }}
              thumbColor={settings.soundEnabled ? COLORS.cyan : '#64748B'}
            />
          </View>

          {/* Ambient Music */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Music size={18} color={COLORS.amber} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Arcade Music</Text>
                <Text style={styles.settingSubtitle}>
                  Background ambient cyberpunk arcade tones
                </Text>
              </View>
            </View>
            <Switch
              value={settings.musicEnabled}
              onValueChange={handleToggleMusic}
              trackColor={{ false: '#1E293B', true: 'rgba(245, 158, 11, 0.4)' }}
              thumbColor={settings.musicEnabled ? COLORS.amber : '#64748B'}
            />
          </View>

          {/* Haptic Feedback */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Smartphone size={18} color={COLORS.lime} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Haptic Feedback</Text>
                <Text style={styles.settingSubtitle}>
                  Tactile vibrations during collisions and interactions
                </Text>
              </View>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#1E293B', true: 'rgba(16, 185, 129, 0.4)' }}
              thumbColor={settings.hapticsEnabled ? COLORS.lime : '#64748B'}
            />
          </View>
        </View>

        {/* SYSTEM & DATA MANAGEMENT */}
        <Text style={styles.sectionHeader}>DATA MANAGEMENT</Text>

        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={() => setConfirmReset(true)}
            activeOpacity={0.75}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <Trash2 size={18} color={COLORS.rose} />
              </View>
              <View>
                <Text style={styles.dangerTitle}>Reset All Progress</Text>
                <Text style={styles.settingSubtitle}>
                  Wipe player level, XP, high scores, and stats
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Confirmation dialogue */}
        {confirmReset && (
          <View style={styles.confirmBox}>
            <ShieldAlert size={20} color={COLORS.rose} />
            <Text style={styles.confirmText}>
              Are you sure? This action cannot be undone!
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelResetBtn}
                onPress={() => setConfirmReset(false)}
              >
                <Text style={styles.cancelResetText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doResetBtn}
                onPress={handleReset}
              >
                <Text style={styles.doResetText}>YES, WIPE DATA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* APP INFO */}
        <View style={styles.infoBox}>
          <Info size={16} color={COLORS.textMuted} />
          <Text style={styles.infoText}>
            MINI ARCADE • Premium Multi-Game Mobile Edition v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBarTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  dangerRow: {
    padding: 16,
  },
  dangerTitle: {
    color: COLORS.rose,
    fontSize: 14,
    fontWeight: '800',
  },
  confirmBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.rose,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelResetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  cancelResetText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  doResetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.rose,
    borderRadius: 8,
  },
  doResetText: {
    color: '#0B0E14',
    fontSize: 12,
    fontWeight: '900',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
