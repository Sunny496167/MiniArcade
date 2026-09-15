import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { BreakoutState } from './types';
import {
  createInitialBreakoutState,
  updateBreakout,
  CANVAS_WIDTH,
  launchStickyBalls,
  fireLaser,
} from './engine/breakoutEngine';
import { COLORS } from '../../constants/theme';
import { BreakoutCanvas } from './components/BreakoutCanvas';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface BreakoutGameInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  state: BreakoutState;
  setState: React.Dispatch<React.SetStateAction<BreakoutState>>;
  stateRef: React.MutableRefObject<BreakoutState>;
  animationFrameRef: React.MutableRefObject<number | null>;
  composedGesture: any;
}

const BreakoutGameInner: React.FC<BreakoutGameInnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  stateRef,
  animationFrameRef,
  composedGesture,
}) => {
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      if (now - lastTime >= 16) {
        lastTime = now;
        const {
          nextState,
          brickHit,
          paddleHit,
          lostLife,
          won,
          powerUpCollected,
        } = updateBreakout(stateRef.current);

        if (brickHit) {
          audioService.play('pointScore');
          hapticsService.light();
        }

        if (paddleHit) {
          audioService.play('buttonPress');
          hapticsService.light();
          triggerShake('light');
        }

        if (powerUpCollected) {
          audioService.play('bonus');
          hapticsService.medium();
        }

        if (lostLife && !nextState.isGameOver) {
          audioService.play('gameOver');
          hapticsService.heavy();
          triggerShake('heavy');
        }

        if (won || nextState.isGameOver) {
          setState(nextState);
          triggerGameOver(nextState.score, won, [
            { label: 'Bricks Cleared', value: nextState.bricksDestroyed, isHighlight: true },
            { label: 'Max Combo', value: `${nextState.maxCombo}x` },
            { label: 'Shields Left', value: nextState.lives },
            { label: 'Result', value: won ? 'VICTORY' : 'DEFEATED' },
          ]);
          return;
        }

        setState(nextState);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, triggerGameOver, setState, stateRef, animationFrameRef]);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <View style={styles.canvasWrapper}>
        <BreakoutCanvas
          paddle={state.paddle}
          balls={state.balls}
          bricks={state.bricks}
          powerUps={state.powerUps}
          lasers={state.lasers}
          paddleLaserActive={state.powerUpActive.laser > 0}
        />
      </View>
      </View>
    </GestureDetector>
  );
};

export const BreakoutScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'breakout')!;

  const [difficulty, setDifficulty] = useState<'Novice' | 'Advanced' | 'Expert'>('Novice');
  
  const [state, setState] = useState<BreakoutState>(createInitialBreakoutState(difficulty));
  const stateRef = useRef(state);
  stateRef.current = state;

  const animationFrameRef = useRef<number | null>(null);

  const resetGame = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setState(createInitialBreakoutState(difficulty));
  };

  // Drag responder for paddle movement
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      const locationX = e.x;
      const paddleWidth = stateRef.current.paddle.width;
      const clampedX = Math.max(
        0,
        Math.min(locationX - paddleWidth / 2, CANVAS_WIDTH - paddleWidth)
      );

      setState((prev) => ({
        ...prev,
        paddle: {
          ...prev.paddle,
          x: clampedX,
        },
      }));
    });

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => {
      setState((prev) => {
        let next = launchStickyBalls(prev);
        if (next.powerUpActive.laser > 0) {
          next = fireLaser(next);
        }
        return next;
      });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const renderSettingsUI = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingLabel}>DIFFICULTY</Text>
      <View style={styles.toggleRow}>
        {['Novice', 'Advanced', 'Expert'].map((diff: any) => (
          <TouchableOpacity
            key={diff}
            style={[styles.toggleBtn, difficulty === diff && styles.toggleBtnActive]}
            onPress={() => {
              setDifficulty(diff);
              setState(createInitialBreakoutState(diff));
            }}
          >
            <Text style={[styles.toggleBtnText, difficulty === diff && styles.toggleBtnTextActive]}>
              {diff}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <GameContainer
      game={gameMetadata}
      score={state.score}
      lives={state.lives}
      combo={state.combo}
      onResetGame={resetGame}
      settingsUI={renderSettingsUI()}
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <BreakoutGameInner
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          triggerShake={triggerShake}
          state={state}
          setState={setState}
          stateRef={stateRef}
          animationFrameRef={animationFrameRef}
          composedGesture={composedGesture}
        />
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContainer: {
    paddingVertical: 8,
  },
  settingLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: '#00F0FF',
  },
  toggleBtnText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
});
