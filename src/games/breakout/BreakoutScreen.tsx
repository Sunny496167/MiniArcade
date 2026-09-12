import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { BreakoutState } from './types';
import {
  createInitialBreakoutState,
  updateBreakout,
  CANVAS_WIDTH,
} from './engine/breakoutEngine';
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
  panGesture: any;
}

const BreakoutGameInner: React.FC<BreakoutGameInnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  stateRef,
  animationFrameRef,
  panGesture,
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
          triggerShake('light');
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
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <View style={styles.canvasWrapper}>
        <BreakoutCanvas
          paddle={state.paddle}
          balls={state.balls}
          bricks={state.bricks}
          powerUps={state.powerUps}
        />
      </View>
      </View>
    </GestureDetector>
  );
};

export const BreakoutScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'breakout')!;

  const [state, setState] = useState<BreakoutState>(createInitialBreakoutState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const animationFrameRef = useRef<number | null>(null);

  const resetGame = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setState(createInitialBreakoutState());
  };

  // Drag responder for paddle movement
  const panGesture = Gesture.Pan()
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

  return (
    <GameContainer
      game={gameMetadata}
      score={state.score}
      lives={state.lives}
      combo={state.combo}
      onResetGame={resetGame}
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
          panGesture={panGesture}
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
});
