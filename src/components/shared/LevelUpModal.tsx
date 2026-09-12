import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowUpCircle, Check } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useArcade } from '../../context/ArcadeContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpModalData, dismissLevelUpModal } = useArcade();

  if (!levelUpModalData) return null;

  return (
    <Modal
      transparent
      visible={!!levelUpModalData}
      animationType="fade"
      onRequestClose={dismissLevelUpModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, SHADOWS.card]}>
          <LinearGradient
            colors={['#192D4A', '#0D1726']}
            style={styles.cardGradient}
          >
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={COLORS.gradientCyanPurple as any}
                style={styles.iconGradient}
              >
                <ArrowUpCircle size={40} color="#0B0E14" />
              </LinearGradient>
            </View>

            <Text style={styles.levelUpBanner}>RANK ELEVATED!</Text>
            <Text style={styles.levelNumber}>LEVEL {levelUpModalData.level}</Text>
            <Text style={styles.desc}>
              Your arcade mastery has reached new heights. Higher rewards and bragging rights unlocked!
            </Text>

            <View style={styles.rewardTag}>
              <Sparkles size={16} color={COLORS.amber} />
              <Text style={styles.rewardText}>
                +{levelUpModalData.xpReward} BONUS XP AWARDED
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={dismissLevelUpModal}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#00F0FF', '#3B82F6'] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Check size={18} color="#0B0E14" strokeWidth={3} />
                <Text style={styles.continueText}>CLAIM & ADVANCE</Text>
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
    backgroundColor: 'rgba(5, 8, 14, 0.88)',
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
    padding: 26,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderRadius: 24,
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpBanner: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  levelNumber: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginTop: 18,
  },
  rewardText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '800',
  },
  continueBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 22,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  continueText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
