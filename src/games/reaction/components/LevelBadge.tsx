import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLevelConfig, TOTAL_LEVELS } from '../engine/reactionEngine';
import { COLORS } from '../../../constants/theme';

interface LevelBadgeProps {
  currentLevel: number;
  currentTrial: number;  // 1-based, current active trial
  totalTrials: number;
  totalScore: number;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  currentLevel,
  currentTrial,
  totalTrials,
  totalScore,
}) => {
  const config = getLevelConfig(currentLevel);

  return (
    <View style={styles.row}>
      {/* Level pill */}
      <View style={[styles.levelPill, { borderColor: config.accentColor + '50' }]}>
        <View style={[styles.levelDot, { backgroundColor: config.accentColor }]} />
        <Text style={[styles.levelNum, { color: config.accentColor }]}>
          LVL {currentLevel}
        </Text>
        <Text style={styles.separator}>·</Text>
        <Text style={styles.levelName}>{config.name}</Text>
      </View>

      {/* Trial progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalTrials }).map((_, idx) => {
          const isDone = idx < currentTrial - 1;
          const isActive = idx === currentTrial - 1;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                isDone && { backgroundColor: config.accentColor },
                isActive && [styles.dotActive, { backgroundColor: config.accentColor + '80' }],
              ]}
            />
          );
        })}
      </View>

      {/* Score */}
      <Text style={styles.score}>{totalScore.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelNum: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  separator: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  levelName: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
  },
  score: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    minWidth: 50,
    textAlign: 'right',
  },
});
