import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flag, ShieldCheck } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { MinesweeperState } from './types';
import {
  createInitialMinesweeperState,
  revealCell,
  toggleFlagCell,
} from './engine/minesweeperEngine';
import { MinesweeperGrid } from './components/MinesweeperGrid';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface MinesweeperGameInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  state: MinesweeperState;
  setState: React.Dispatch<React.SetStateAction<MinesweeperState>>;
  timerRef: React.MutableRefObject<any>;
  calculateScore: (time: number, won: boolean, revealed: number) => number;
}

const MinesweeperGameInner: React.FC<MinesweeperGameInnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  timerRef,
  calculateScore,
}) => {
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, setState, timerRef]);

  const handleCellPress = (r: number, c: number) => {
    if (gameState !== 'PLAYING') return;

    if (state.flagMode) {
      hapticsService.light();
      audioService.play('buttonPress');
      setState((prev) => toggleFlagCell(prev, r, c));
      return;
    }

    const { nextState, hitMine, won } = revealCell(state, r, c);

    if (hitMine) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(nextState);
      triggerShake('heavy');
      const finalScore = calculateScore(nextState.timeElapsed, false, nextState.revealedCount);

      triggerGameOver(finalScore, false, [
        { label: 'Time Elapsed', value: `${nextState.timeElapsed}s` },
        { label: 'Sectors Scanned', value: nextState.revealedCount },
        { label: 'Mines Flagged', value: nextState.flagsPlaced },
        { label: 'Mission Outcome', value: 'DETONATED' },
      ]);
      return;
    }

    if (won) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(nextState);
      const finalScore = calculateScore(nextState.timeElapsed, true, nextState.revealedCount);

      triggerGameOver(finalScore, true, [
        { label: 'Clear Time', value: `${nextState.timeElapsed}s`, isHighlight: true },
        { label: 'Mines Defused', value: nextState.totalMines },
        { label: 'Defusal Efficiency', value: '100%' },
        { label: 'Mission Outcome', value: 'CLEARED' },
      ]);
      return;
    }

    audioService.play('pointScore');
    hapticsService.light();
    setState(nextState);
  };

  const handleCellLongPress = (r: number, c: number) => {
    if (gameState !== 'PLAYING') return;
    hapticsService.medium();
    audioService.play('buttonPress');
    setState((prev) => toggleFlagCell(prev, r, c));
  };

  const toggleFlagMode = () => {
    hapticsService.light();
    audioService.play('buttonPress');
    setState((prev) => ({ ...prev, flagMode: !prev.flagMode }));
  };

  return (
    <View style={styles.container}>
      {/* Top Tactical Status */}
      <View style={styles.topStatusRow}>
        <View style={styles.mineCounter}>
          <ShieldCheck size={16} color={COLORS.cyan} />
          <Text style={styles.mineCounterText}>
            {state.totalMines - state.flagsPlaced} MINES REMAINING
          </Text>
        </View>

        {/* Flag Mode Toggle Button */}
        <TouchableOpacity
          style={[
            styles.flagToggleBtn,
            state.flagMode && styles.flagToggleBtnActive,
          ]}
          onPress={toggleFlagMode}
          activeOpacity={0.8}
        >
          <Flag
            size={16}
            color={state.flagMode ? '#0B0E14' : COLORS.amber}
            fill={state.flagMode ? '#0B0E14' : COLORS.amber}
          />
          <Text
            style={[
              styles.flagToggleText,
              state.flagMode && styles.flagToggleTextActive,
            ]}
          >
            FLAG MODE {state.flagMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.gridWrapper}>
        <MinesweeperGrid
          grid={state.grid}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
        />
      </View>

      {/* Instruction Tip */}
      <Text style={styles.hintText}>
        Tap to scan sector • Long press or toggle Flag Mode to mark mines
      </Text>
    </View>
  );
};

export const MinesweeperScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'minesweeper')!;

  const [state, setState] = useState<MinesweeperState>(createInitialMinesweeperState());
  const timerRef = useRef<any>(null);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(createInitialMinesweeperState());
  };

  const calculateScore = (time: number, won: boolean, revealed: number) => {
    if (!won) return revealed * 10;
    const timeBonus = Math.max(0, 300 - time) * 3;
    return 500 + timeBonus;
  };

  return (
    <GameContainer
      game={gameMetadata}
      score={calculateScore(state.timeElapsed, state.isWon, state.revealedCount)}
      timer={`${Math.floor(state.timeElapsed / 60)}:${(state.timeElapsed % 60)
        .toString()
        .padStart(2, '0')}`}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <MinesweeperGameInner
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          triggerShake={triggerShake}
          state={state}
          setState={setState}
          timerRef={timerRef}
          calculateScore={calculateScore}
        />
      )}
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
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mineCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  mineCounterText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  flagToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  flagToggleBtnActive: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
  },
  flagToggleText: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '800',
  },
  flagToggleTextActive: {
    color: '#0B0E14',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
