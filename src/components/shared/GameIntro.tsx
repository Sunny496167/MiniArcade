import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Sparkles, ArrowLeft, CheckCircle2, Gamepad2, Zap, Layers, Grid, Target, Activity, Cpu } from 'lucide-react-native';
import { GameMetadata } from '../../types/arcade';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useArcade } from '../../context/ArcadeContext';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameIntroProps {
  game: GameMetadata;
  onPlay: () => void;
  onBack: () => void;
  settingsUI?: React.ReactNode;
}

const renderGameIcon = (iconName: string, color: string, size: number = 40) => {
  switch (iconName) {
    case 'Zap':
      return <Zap size={size} color={color} />;
    case 'Layers':
      return <Layers size={size} color={color} />;
    case 'Grid':
      return <Grid size={size} color={color} />;
    case 'Target':
      return <Target size={size} color={color} />;
    case 'Activity':
      return <Activity size={size} color={color} />;
    case 'Cpu':
      return <Cpu size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

export const GameIntro: React.FC<GameIntroProps> = ({ game, onPlay, onBack, settingsUI }) => {
  const { stats } = useArcade();
  const gameStats = stats[game.id] || { highScore: 0, timesPlayed: 0 };

  const handlePlay = () => {
    hapticsService.medium();
    audioService.play('buttonPress');
    onPlay();
  };

  const handleBack = () => {
    hapticsService.light();
    audioService.play('buttonPress');
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{game.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Hero Artwork Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={[`${game.accentColor}30`, `${game.secondaryColor}10`, 'transparent']}
            style={styles.heroGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <View
              style={[
                styles.iconWrapper,
                {
                  borderColor: game.accentColor,
                  shadowColor: game.accentColor,
                },
                SHADOWS.glowCyan,
              ]}
            >
              {renderGameIcon(game.iconName, game.accentColor, 52)}
            </View>

            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameTagline}>{game.tagline}</Text>

            {/* Badges Row */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.categoryTag,
                  { backgroundColor: `${game.accentColor}20` },
                ]}
              >
                <Text style={[styles.categoryTagText, { color: game.accentColor }]}>
                  {game.category.toUpperCase()}
                </Text>
              </View>
              <View style={styles.difficultyTag}>
                <Text style={styles.difficultyTagText}>{game.difficulty}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Trophy size={18} color={COLORS.amber} />
            <Text style={styles.statCardLabel}>BEST RECORD</Text>
            <Text style={styles.statCardValue}>
              {gameStats.highScore > 0
                ? gameStats.highScore.toLocaleString()
                : '0'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Sparkles size={18} color={COLORS.cyan} />
            <Text style={styles.statCardLabel}>XP REWARD</Text>
            <Text style={styles.statCardValue}>+{game.baseXp} XP</Text>
          </View>

          <View style={styles.statCard}>
            <Gamepad2 size={18} color={COLORS.purple} />
            <Text style={styles.statCardLabel}>MATCHES</Text>
            <Text style={styles.statCardValue}>{gameStats.timesPlayed}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>MISSION OVERVIEW</Text>
          <Text style={styles.descriptionText}>{game.description}</Text>
        </View>

        {/* How to Play */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>HOW TO PLAY</Text>
          {game.howToPlay.map((instruction, idx) => (
            <View key={idx} style={styles.instructionItem}>
              <CheckCircle2
                size={16}
                color={game.accentColor}
                style={styles.instructionIcon}
              />
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Custom Settings UI */}
        {settingsUI && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>GAME OPTIONS</Text>
            {settingsUI}
          </View>
        )}

        {/* Controls */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CONTROLS</Text>
          <View style={styles.controlBox}>
            <Gamepad2 size={16} color={COLORS.textSecondary} />
            <Text style={styles.controlText}>{game.controlsDescription}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Action CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlay}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[game.accentColor, game.secondaryColor] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playGradient}
          >
            <Play size={20} color="#0B0E14" fill="#0B0E14" />
            <Text style={styles.playButtonText}>START GAME</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroGradient: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  gameTagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: '85%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  difficultyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyTagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statCardLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statCardValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  instructionIcon: {
    marginTop: 2,
  },
  instructionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  controlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  controlText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  playButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  playButtonText: {
    color: '#0B0E14',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
