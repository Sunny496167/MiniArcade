import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, Users, Cpu } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AIDifficulty } from '../types';
import { COLORS } from '../../../constants/theme';
import { audioService } from '../../../services/audioService';
import { hapticsService } from '../../../services/hapticsService';

interface ModeSelectorProps {
  selectedMode: 'pvp' | 'vsAI';
  selectedDifficulty: AIDifficulty;
  onSelectMode: (mode: 'pvp' | 'vsAI') => void;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onStart: () => void;
}

const DIFF_HINTS: Record<AIDifficulty, string> = {
  Casual: 'Plays mostly random moves — great for beginners',
  Pro: 'Strategic AI with occasional mistakes',
  Unbeatable: 'Perfect minimax algorithm — cannot be beaten!',
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  selectedDifficulty,
  onSelectMode,
  onSelectDifficulty,
  onStart,
}) => {
  const router = useRouter();

  const handleSelectMode = (mode: 'pvp' | 'vsAI') => {
    hapticsService.light();
    audioService.play('buttonPress');
    onSelectMode(mode);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CYBER TIC-TAC-TOE</Text>
          <Text style={styles.headerSub}>SELECT GAME MODE</Text>
        </View>

        {/* Spacer to keep title centered */}
        <View style={{ width: 40 }} />
      </View>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* Mode Cards */}
        <View style={styles.modeCards}>

          {/* Play with Friend */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'pvp' && styles.modeCardActivePvp,
            ]}
            onPress={() => handleSelectMode('pvp')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                selectedMode === 'pvp'
                  ? ['rgba(0,240,255,0.12)', 'rgba(0,240,255,0.04)']
                  : ['#14202E', '#0D1624']
              }
              style={styles.modeCardGradient}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedMode === 'pvp' && styles.iconCirclePvp,
                ]}
              >
                <Users
                  size={32}
                  color={selectedMode === 'pvp' ? COLORS.cyan : COLORS.textMuted}
                />
              </View>

              <Text
                style={[
                  styles.modeTitle,
                  selectedMode === 'pvp' && { color: COLORS.cyan },
                ]}
              >
                Play with{'\n'}Friend
              </Text>

              <Text style={styles.modeDesc}>
                Two players share the same device and take turns
              </Text>

              {selectedMode === 'pvp' && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>SELECTED</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Play vs Computer */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'vsAI' && styles.modeCardActiveAi,
            ]}
            onPress={() => handleSelectMode('vsAI')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                selectedMode === 'vsAI'
                  ? ['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.04)']
                  : ['#14202E', '#0D1624']
              }
              style={styles.modeCardGradient}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedMode === 'vsAI' && styles.iconCircleAi,
                ]}
              >
                <Cpu
                  size={32}
                  color={selectedMode === 'vsAI' ? COLORS.purple : COLORS.textMuted}
                />
              </View>

              <Text
                style={[
                  styles.modeTitle,
                  selectedMode === 'vsAI' && { color: COLORS.purple },
                ]}
              >
                Play vs{'\n'}Computer
              </Text>

              <Text style={styles.modeDesc}>
                Challenge the neural AI engine in solo mode
              </Text>

              {selectedMode === 'vsAI' && (
                <View style={[styles.selectedBadge, styles.selectedBadgeAi]}>
                  <Text style={[styles.selectedBadgeText, { color: COLORS.purple }]}>
                    SELECTED
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Difficulty Selector — only for vsAI */}
        {selectedMode === 'vsAI' && (
          <View style={styles.diffSection}>
            <Text style={styles.diffLabel}>AI DIFFICULTY</Text>

            <View style={styles.diffRow}>
              {(['Casual', 'Pro', 'Unbeatable'] as AIDifficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.diffChip,
                    selectedDifficulty === diff && styles.diffChipActive,
                  ]}
                  onPress={() => {
                    hapticsService.selection();
                    audioService.play('buttonPress');
                    onSelectDifficulty(diff);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.diffChipText,
                      selectedDifficulty === diff && styles.diffChipTextActive,
                    ]}
                  >
                    {diff.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.diffHint}>{DIFF_HINTS[selectedDifficulty]}</Text>
          </View>
        )}
      </View>

      {/* ── Start Button ────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => {
            hapticsService.medium();
            audioService.play('gameStart');
            onStart();
          }}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#00F0FF', '#8B5CF6'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtnGradient}
          >
            <Play size={18} color="#0A0E17" fill="#0A0E17" />
            <Text style={styles.startBtnText}>START GAME</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  modeCards: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  modeCardActivePvp: {
    borderColor: COLORS.cyan,
  },
  modeCardActiveAi: {
    borderColor: COLORS.purple,
  },
  modeCardGradient: {
    padding: 18,
    alignItems: 'center',
    gap: 10,
    minHeight: 210,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCirclePvp: {
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderColor: 'rgba(0,240,255,0.35)',
  },
  iconCircleAi: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.35)',
  },
  modeTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 20,
  },
  modeDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    backgroundColor: 'rgba(0,240,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.4)',
    marginTop: 4,
  },
  selectedBadgeAi: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.4)',
  },
  selectedBadgeText: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  diffSection: {
    marginTop: 24,
  },
  diffLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  diffChipActive: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: COLORS.purple,
  },
  diffChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  diffChipTextActive: {
    color: COLORS.purple,
  },
  diffHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    paddingBottom: 28,
  },
  startBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  startBtnText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
