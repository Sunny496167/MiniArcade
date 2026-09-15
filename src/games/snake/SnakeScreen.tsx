import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { Direction, SnakeState, BorderMode } from './types';
import { COLORS } from '../../constants/theme';
import {
  createInitialSnakeState,
  stepSnake,
  isValidDirectionChange,
} from './engine/snakeEngine';
import { SnakeBoard } from './components/SnakeBoard';
import { SnakeControls } from './components/SnakeControls';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface SnakeGameInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  snakeState: SnakeState;
  setSnakeState: React.Dispatch<React.SetStateAction<SnakeState>>;
  stateRef: React.MutableRefObject<SnakeState>;
  gameLoopRef: React.MutableRefObject<any>;
  handleDirectionChange: (newDir: Direction) => void;
  panGesture: any;
}

const SnakeGameInner: React.FC<SnakeGameInnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  snakeState,
  setSnakeState,
  stateRef,
  gameLoopRef,
  handleDirectionChange,
  panGesture,
}) => {
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      const current = stateRef.current;
      const { nextState, ateNormalFood, ateBonusFood, hitWallOrSelf } =
        stepSnake(current);

      if (ateNormalFood) {
        audioService.play('pointScore');
        hapticsService.light();
      }

      if (ateBonusFood) {
        audioService.play('bonus');
        hapticsService.medium();
      }

      if (hitWallOrSelf) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setSnakeState(nextState);
        triggerShake('heavy');

        triggerGameOver(nextState.score, false, [
          { label: 'Data Nodes', value: nextState.applesEaten, isHighlight: true },
          { label: 'Bonus Sparks', value: nextState.bonusEaten },
          { label: 'Snake Length', value: nextState.snake.length },
          { label: 'Velocity', value: `${Math.round((140 / nextState.speed) * 10) / 10}x` },
        ]);
        return;
      }

      setSnakeState(nextState);
    }, snakeState.speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, snakeState.speed, triggerGameOver, setSnakeState, stateRef, gameLoopRef]);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <View style={styles.boardWrapper}>
        <SnakeBoard
          snake={snakeState.snake}
          food={snakeState.food}
          bonusFood={snakeState.bonusFood}
          borderMode={snakeState.borderMode}
          direction={snakeState.direction}
        />
      </View>

      {/* Tactile D-pad */}
      <SnakeControls onDirectionPress={handleDirectionChange} />
      </View>
    </GestureDetector>
  );
};

export const SnakeScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'snake')!;

  const [borderMode, setBorderMode] = useState<BorderMode>('full');
  const [difficulty, setDifficulty] = useState<'Normal' | 'Fast' | 'Extreme'>('Normal');

  const getSpeedForDifficulty = (diff: string) => {
    if (diff === 'Extreme') return 70;
    if (diff === 'Fast') return 100;
    return 140;
  };

  const [snakeState, setSnakeState] = useState<SnakeState>(
    createInitialSnakeState(borderMode, getSpeedForDifficulty(difficulty))
  );
  const stateRef = useRef(snakeState);
  stateRef.current = snakeState;

  const gameLoopRef = useRef<any>(null);

  const resetGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setSnakeState(createInitialSnakeState(borderMode, getSpeedForDifficulty(difficulty)));
  };

  const handleDirectionChange = useCallback((newDir: Direction) => {
    const current = stateRef.current;
    if (isValidDirectionChange(current.direction, newDir)) {
      setSnakeState((prev) => ({
        ...prev,
        nextDirection: newDir,
      }));
    }
  }, []);

  // Swipe Gesture Responder
  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      const { translationX: dx, translationY: dy } = e;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < 15) return; // Ignore slight taps

      if (absX > absY) {
        if (dx > 0) handleDirectionChange('RIGHT');
        else handleDirectionChange('LEFT');
      } else {
        if (dy > 0) handleDirectionChange('DOWN');
        else handleDirectionChange('UP');
      }
    });

  const renderSettingsUI = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingLabel}>BORDER MODE</Text>
      <View style={styles.toggleRow}>
        {(['full', 'mixed', 'none'] as BorderMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, borderMode === mode && styles.toggleBtnActive]}
            onPress={() => {
              setBorderMode(mode);
              setSnakeState(createInitialSnakeState(mode, getSpeedForDifficulty(difficulty)));
            }}
          >
            <Text style={[styles.toggleBtnText, borderMode === mode && styles.toggleBtnTextActive]}>
              {mode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.settingLabel, { marginTop: 16 }]}>DIFFICULTY</Text>
      <View style={styles.toggleRow}>
        {['Normal', 'Fast', 'Extreme'].map((diff: any) => (
          <TouchableOpacity
            key={diff}
            style={[styles.toggleBtn, difficulty === diff && styles.toggleBtnActive]}
            onPress={() => {
              setDifficulty(diff);
              setSnakeState(createInitialSnakeState(borderMode, getSpeedForDifficulty(diff)));
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
      score={snakeState.score}
      onResetGame={resetGame}
      settingsUI={renderSettingsUI()}
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <SnakeGameInner
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          triggerShake={triggerShake}
          snakeState={snakeState}
          setSnakeState={setSnakeState}
          stateRef={stateRef}
          gameLoopRef={gameLoopRef}
          handleDirectionChange={handleDirectionChange}
          panGesture={panGesture}
        />
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  boardWrapper: {
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  toggleBtnText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
});
