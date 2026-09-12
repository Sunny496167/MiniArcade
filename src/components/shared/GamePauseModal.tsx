import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Play, RotateCcw, Home, HelpCircle, X } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { GameMetadata } from '../../types/arcade';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GamePauseModalProps {
  visible: boolean;
  game: GameMetadata;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GamePauseModal: React.FC<GamePauseModalProps> = ({
  visible,
  game,
  onResume,
  onRestart,
  onExit,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, SHADOWS.card]}>
          <Text style={styles.title}>GAME PAUSED</Text>
          <Text style={styles.subtitle}>{game.title}</Text>

          {showInstructions ? (
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionsHeader}>
                <Text style={styles.instructionsTitle}>HOW TO PLAY</Text>
                <TouchableOpacity
                  onPress={() => setShowInstructions(false)}
                  style={styles.closeHelpBtn}
                >
                  <X size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {game.howToPlay.map((item, idx) => (
                <Text key={idx} style={styles.instructionText}>
                  • {item}
                </Text>
              ))}

              <View style={styles.controlBox}>
                <Text style={styles.controlTitle}>Controls:</Text>
                <Text style={styles.controlDesc}>{game.controlsDescription}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.buttonList}>
              {/* Resume */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.resumeBtn]}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  onResume();
                }}
                activeOpacity={0.8}
              >
                <Play size={18} color="#0B0E14" fill="#0B0E14" />
                <Text style={styles.resumeBtnText}>RESUME</Text>
              </TouchableOpacity>

              {/* Restart */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  hapticsService.medium();
                  audioService.play('buttonPress');
                  onRestart();
                }}
                activeOpacity={0.8}
              >
                <RotateCcw size={18} color={COLORS.textPrimary} />
                <Text style={styles.actionBtnText}>RESTART</Text>
              </TouchableOpacity>

              {/* How to Play */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  setShowInstructions(true);
                }}
                activeOpacity={0.8}
              >
                <HelpCircle size={18} color={COLORS.textPrimary} />
                <Text style={styles.actionBtnText}>HOW TO PLAY</Text>
              </TouchableOpacity>

              {/* Quit to Arcade */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.exitBtn]}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  onExit();
                }}
                activeOpacity={0.8}
              >
                <Home size={18} color={COLORS.rose} />
                <Text style={styles.exitBtnText}>EXIT TO ARCADE</Text>
              </TouchableOpacity>
            </View>
          )}
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
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 24,
  },
  buttonList: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  resumeBtn: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
  },
  resumeBtnText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  exitBtn: {
    borderColor: 'rgba(244, 63, 94, 0.3)',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
  },
  exitBtnText: {
    color: COLORS.rose,
    fontSize: 14,
    fontWeight: '700',
  },
  instructionsContainer: {
    width: '100%',
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  closeHelpBtn: {
    padding: 4,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  controlBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 8,
  },
  controlTitle: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  controlDesc: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 2,
  },
});
