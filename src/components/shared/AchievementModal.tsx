import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Sparkles, Check, X } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useArcade } from '../../context/ArcadeContext';

export const AchievementModal: React.FC = () => {
  const { unlockedAchievementModal, dismissAchievementModal } = useArcade();

  if (!unlockedAchievementModal) return null;

  return (
    <Modal
      transparent
      visible={!!unlockedAchievementModal}
      animationType="fade"
      onRequestClose={dismissAchievementModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, SHADOWS.card]}>
          <LinearGradient
            colors={['#1F2B48', '#111728']}
            style={styles.cardGradient}
          >
            {/* Top Close */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={dismissAchievementModal}
            >
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.trophyWrapper}>
              <LinearGradient
                colors={COLORS.gradientMagentaAmber as any}
                style={styles.trophyGradient}
              >
                <Trophy size={36} color="#0B0E14" />
              </LinearGradient>
            </View>

            <Text style={styles.badgeBanner}>ACHIEVEMENT UNLOCKED!</Text>
            <Text style={styles.title}>{unlockedAchievementModal.title}</Text>
            <Text style={styles.desc}>
              {unlockedAchievementModal.description}
            </Text>

            <View style={styles.rewardTag}>
              <Sparkles size={16} color={COLORS.cyan} />
              <Text style={styles.rewardText}>
                +{unlockedAchievementModal.xpReward} BONUS XP
              </Text>
            </View>

            <TouchableOpacity
              style={styles.claimBtn}
              onPress={dismissAchievementModal}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={COLORS.gradientGreenCyan as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.claimGradient}
              >
                <Check size={18} color="#0B0E14" strokeWidth={3} />
                <Text style={styles.claimText}>AWESOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  trophyWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  trophyGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeBanner: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginTop: 18,
  },
  rewardText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '800',
  },
  claimBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
  },
  claimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  claimText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
