import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pause, Trophy, Flame, Heart, Timer } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameHUDProps {
  score: number;
  highScore: number;
  onPause: () => void;
  lives?: number;
  timer?: number | string;
  combo?: number;
  accentColor?: string;
  moves?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  onPause,
  lives,
  timer,
  combo,
  accentColor = COLORS.cyan,
  moves,
}) => {
  const handlePause = () => {
    hapticsService.light();
    audioService.play('buttonPress');
    onPause();
  };

  return (
    <View style={styles.hudContainer}>
      {/* Left: Score & High Score */}
      <View style={styles.scoreBlock}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={[styles.scoreValue, { color: accentColor }]}>
          {score.toLocaleString()}
        </Text>
        <View style={styles.highScoreRow}>
          <Trophy size={11} color={COLORS.amber} />
          <Text style={styles.highScoreValue}>
            {Math.max(highScore, score).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Center: Contextual Pills (Lives, Timer, Combo, Moves) */}
      <View style={styles.centerBlock}>
        {lives !== undefined && (
          <View style={styles.pill}>
            <Heart size={14} color={COLORS.rose} fill={COLORS.rose} />
            <Text style={styles.pillText}>{lives}</Text>
          </View>
        )}

        {timer !== undefined && (
          <View style={styles.pill}>
            <Timer size={14} color={COLORS.cyan} />
            <Text style={styles.pillText}>{timer}</Text>
          </View>
        )}

        {moves !== undefined && (
          <View style={styles.pill}>
            <Text style={styles.movesLabel}>MOVES</Text>
            <Text style={styles.pillText}>{moves}</Text>
          </View>
        )}

        {combo !== undefined && combo > 1 && (
          <View style={[styles.pill, styles.comboPill]}>
            <Flame size={14} color={COLORS.amber} />
            <Text style={styles.comboText}>{combo}x</Text>
          </View>
        )}
      </View>

      {/* Right: Pause Button */}
      <TouchableOpacity
        onPress={handlePause}
        style={styles.pauseBtn}
        activeOpacity={0.7}
      >
        <Pause size={18} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 50,
  },
  scoreBlock: {
    minWidth: 80,
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  highScoreValue: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  centerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  movesLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  comboPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  comboText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  pauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
