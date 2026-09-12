import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { State2048, SwipeDirection } from './types';
import {
  createInitial2048State,
  moveBoard,
  undoMove,
} from './engine/game2048Engine';
import { Grid2048 } from './components/Grid2048';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

export const Game2048Screen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'game2048')!;

  const [state, setState] = useState<State2048>(createInitial2048State());
  const stateRef = useRef(state);
  stateRef.current = state;

  const resetGame = () => {
    setState(createInitial2048State());
  };

  const handleSwipe = useCallback(
    (
      dir: SwipeDirection,
      triggerGameOver: (score: number, won?: boolean, stats?: any) => void
    ) => {
      const current = stateRef.current;
      const { nextState, moved, scoreGained } = moveBoard(current, dir);

      if (!moved) return;

      if (scoreGained > 0) {
        audioService.play('pointScore');
        hapticsService.light();
      } else {
        audioService.play('buttonPress');
      }

      if (nextState.highestTile > current.highestTile && nextState.highestTile >= 128) {
        audioService.play('bonus');
        hapticsService.medium();
      }

      setState(nextState);

      if (nextState.isGameOver) {
        triggerGameOver(nextState.score, nextState.hasWon, [
          { label: 'Highest Fusion', value: nextState.highestTile, isHighlight: true },
          { label: 'Total Moves', value: nextState.moves },
          { label: '2048 Core', value: nextState.hasWon ? 'ACHIEVED' : 'UNREACHED' },
        ]);
      }
    },
    []
  );

  const handleUndo = () => {
    if (!state.history) return;
    hapticsService.light();
    audioService.play('buttonPress');
    setState(undoMove(state));
  };

  return (
    <GameContainer
      game={gameMetadata}
      score={state.score}
      moves={state.moves}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => {
        const panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => gameState === 'PLAYING',
          onPanResponderRelease: (_, gestureState) => {
            if (gameState !== 'PLAYING') return;

            const { dx, dy } = gestureState;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) < 20) return; // Deadzone

            if (absX > absY) {
              handleSwipe(dx > 0 ? 'RIGHT' : 'LEFT', triggerGameOver);
            } else {
              handleSwipe(dy > 0 ? 'DOWN' : 'UP', triggerGameOver);
            }
          },
        });

        return (
          <View style={styles.container} {...panResponder.panHandlers}>
            {/* Top Bar for In-game Controls */}
            <View style={styles.controlsRow}>
              <View style={styles.highestBadge}>
                <Text style={styles.highestLabel}>PEAK TILE</Text>
                <Text style={styles.highestValue}>{state.highestTile}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.undoBtn,
                  !state.history && styles.undoBtnDisabled,
                ]}
                onPress={handleUndo}
                disabled={!state.history}
                activeOpacity={0.7}
              >
                <RotateCcw
                  size={16}
                  color={state.history ? COLORS.cyan : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.undoText,
                    !state.history && styles.undoTextDisabled,
                  ]}
                >
                  UNDO
                </Text>
              </TouchableOpacity>
            </View>

            {/* Matrix Board */}
            <View style={styles.gridWrapper}>
              <Grid2048 board={state.board} />
            </View>

            {/* Hint message */}
            <Text style={styles.swipeHint}>
              Swipe in any direction to fuse matching numbers
            </Text>
          </View>
        );
      }}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highestBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  highestLabel: {
    color: COLORS.purple,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highestValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  undoBtnDisabled: {
    opacity: 0.4,
  },
  undoText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
  undoTextDisabled: {
    color: COLORS.textMuted,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
});
