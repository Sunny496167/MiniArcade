import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Lock, Star, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface LevelSelectModalProps {
  visible: boolean;
  gameTitle: string;
  totalLevels?: number;
  maxUnlockedLevel: number;
  currentLevel: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, number>;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  visible,
  gameTitle,
  totalLevels = 30,
  maxUnlockedLevel,
  currentLevel,
  levelStars,
  levelHighScores,
  onSelectLevel,
  onClose,
}) => {
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

  return (
    <Modal transparent visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>CAMPAIGN SELECTION</Text>
              <Text style={styles.title}>{gameTitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                hapticsService.light();
                audioService.play('buttonPress');
                onClose();
              }}
            >
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Summary */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              UNLOCKED:{' '}
              <Text style={{ color: COLORS.cyan, fontWeight: '900' }}>
                {maxUnlockedLevel} / {totalLevels}
              </Text>
            </Text>
            <Text style={styles.summaryText}>
              TOTAL STARS:{' '}
              <Text style={{ color: COLORS.amber, fontWeight: '900' }}>
                {Object.values(levelStars).reduce((a, b) => a + b, 0)} ★
              </Text>
            </Text>
          </View>

          {/* Grid of Levels */}
          <ScrollView
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.levelsGrid}>
              {levels.map((lvl) => {
                const isUnlocked = lvl <= maxUnlockedLevel;
                const isCurrent = lvl === currentLevel;
                const stars = levelStars[lvl] || 0;
                const bestScore = levelHighScores[lvl] || 0;
                const isBoss = lvl % 5 === 0;

                return (
                  <TouchableOpacity
                    key={lvl}
                    disabled={!isUnlocked}
                    style={[
                      styles.levelCard,
                      !isUnlocked && styles.levelCardLocked,
                      isCurrent && styles.levelCardCurrent,
                      isBoss && isUnlocked && styles.levelCardBoss,
                    ]}
                    onPress={() => {
                      hapticsService.medium();
                      audioService.play('buttonPress');
                      onSelectLevel(lvl);
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    {isUnlocked ? (
                      <>
                        <View style={styles.cardTopRow}>
                          <Text
                            style={[
                              styles.levelNum,
                              isCurrent && { color: COLORS.cyan },
                              isBoss && { color: COLORS.rose },
                            ]}
                          >
                            {lvl}
                          </Text>
                          {isBoss && <Text style={styles.bossBadge}>BOSS</Text>}
                        </View>

                        {/* Stars */}
                        <View style={styles.starsRow}>
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              color={s <= stars ? COLORS.amber : 'rgba(255,255,255,0.15)'}
                              fill={s <= stars ? COLORS.amber : 'transparent'}
                            />
                          ))}
                        </View>

                        {bestScore > 0 ? (
                          <Text style={styles.scoreText} numberOfLines={1}>
                            {bestScore >= 1000 ? `${Math.round(bestScore / 100) / 10}k` : bestScore}
                          </Text>
                        ) : (
                          <Text style={styles.playText}>PLAY</Text>
                        )}
                      </>
                    ) : (
                      <View style={styles.lockedContent}>
                        <Lock size={16} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.lockedNum}>{lvl}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 18, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  kicker: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  summaryText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  gridContent: {
    padding: 16,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  levelCard: {
    width: '18%',
    aspectRatio: 1,
    minWidth: 58,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
  },
  levelCardLocked: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
  },
  levelCardCurrent: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0,240,255,0.12)',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  levelCardBoss: {
    borderColor: 'rgba(244,63,94,0.5)',
    backgroundColor: 'rgba(244,63,94,0.08)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  levelNum: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  bossBadge: {
    color: COLORS.rose,
    fontSize: 7,
    fontWeight: '900',
    backgroundColor: 'rgba(244,63,94,0.2)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  scoreText: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '700',
  },
  playText: {
    color: COLORS.cyan,
    fontSize: 8,
    fontWeight: '800',
  },
  lockedContent: {
    alignItems: 'center',
    gap: 2,
  },
  lockedNum: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontWeight: '800',
  },
});
