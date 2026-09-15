import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Bot, Dices, RotateCcw, Settings2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { GameSetup } from './components/GameSetup';
import { SnakeLadderBoard } from './components/SnakeLadderBoard';
import { AnimatedDice } from './components/AnimatedDice';
import { getLevel } from './engine/levels';
import { createGameState, resolveTurn, rollDice } from './engine/snakeLadderEngine';
import { MatchSetup, SnakeLadderState } from './types';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { GameLifecycleState } from '../../types/arcade';

interface InnerProps {
  setup: MatchSetup;
  gameState: GameLifecycleState;
  triggerGameOver: (score: number, won: boolean, stats: any[]) => void;
  triggerShake: (intensity?: 'light'|'medium'|'heavy') => void;
}

function SnakeLadderGameInner({ setup, gameState, triggerGameOver, triggerShake }: InnerProps) {
  const [state, setState] = useState<SnakeLadderState>(createGameState(setup));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => () => { 
    if (timer.current) clearTimeout(timer.current); 
    if (aiTimer.current) clearTimeout(aiTimer.current);
  }, []);
  
  const level = useMemo(() => getLevel(setup.levelId), [setup.levelId]);
  
  const roll = () => {
    if (!state || gameState !== 'PLAYING' || state.phase !== 'awaiting-roll' || state.winnerId) return;
    setState((previous) => previous ? { ...previous, phase: 'rolling', message: `${previous.players[previous.currentPlayerIndex].name} is rolling...` } : previous);
    timer.current = setTimeout(() => {
      const value = rollDice();
      setState((previous) => previous ? resolveTurn(previous, value, setup.levelId) : previous);
    }, 520);
  };

  useEffect(() => {
    if (!state || gameState !== 'PLAYING' || state.phase !== 'awaiting-roll' || state.winnerId) return;
    const player = state.players[state.currentPlayerIndex];
    if (player.kind !== 'computer') return;
    aiTimer.current = setTimeout(roll, 800);
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, [state?.currentPlayerIndex, state?.phase, state?.winnerId, gameState]);

  useEffect(() => {
    if (state.winnerId && gameState === 'PLAYING') {
      const winner = state.players.find(p => p.id === state.winnerId);
      const isHuman = winner?.kind === 'human';
      const score = isHuman ? Math.max(0, 1000 - (state.moveCount * 5)) : 0;
      
      // Delay game over trigger slightly so user can see they landed on the final square
      setTimeout(() => {
        triggerGameOver(score, isHuman, [
          { label: 'Winner', value: winner?.name || 'Unknown', isHighlight: true },
          { label: 'Total Turns', value: state.moveCount.toString() },
          { label: 'Level', value: level.name }
        ]);
      }, 600);
    }
  }, [state.winnerId, gameState, level.name]);

  const activePlayer = state.players[state.currentPlayerIndex];
  const canRoll = state.phase === 'awaiting-roll' && activePlayer.kind === 'human' && !state.winnerId && gameState === 'PLAYING';
  const winner = state.players.find((player) => player.id === state.winnerId);

  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 420);

  return (
    <View style={styles.screen}>
      {/* 1 & 2. Compact Header & Match Status */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.kicker}>{level.difficulty.toUpperCase()} LEVEL</Text>
          <Text style={styles.title}>{level.name}</Text>
        </View>
        <View style={styles.chipsRow}>
          {state.players.map((player, index) => {
            const isCurrent = state.currentPlayerIndex === index && !state.winnerId;
            return (
              <View key={player.id} style={[styles.playerChip, isCurrent && styles.activeChip, { borderColor: isCurrent ? player.color : COLORS.border }]}>
                <View style={[styles.chipDot, { backgroundColor: player.color }]} />
                <Text style={[styles.chipName, isCurrent && { color: COLORS.textPrimary }]}>
                  {player.name} <Text style={{ color: COLORS.textMuted }}>{player.position}</Text>
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* 3. Board Redesign */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <SnakeLadderBoard level={level} players={state.players} boardSize={boardSize} />
        
        {/* Feedback / Event Message */}
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{state.message}</Text>
        </View>
      </ScrollView>

      {/* 4. Bottom Gameplay Controls */}
      <View style={styles.bottomControls}>
        {activePlayer.kind === 'computer' && !winner ? (
          <View style={styles.computerThinking}>
            <ActivityIndicator size="small" color={COLORS.cyan} />
            <Text style={styles.computerText}>Computer is rolling...</Text>
          </View>
        ) : (
          <Pressable 
            disabled={!canRoll} 
            onPress={() => { if (canRoll) roll(); }} 
            style={[styles.rollButton, !canRoll && styles.rollDisabled, winner && { display: 'none' }]}
          >
            <View style={styles.rollContent}>
              <AnimatedDice value={state.diceValue} isRolling={state.phase === 'rolling'} />
              <Text style={styles.rollText}>
                {state.phase === 'rolling' ? 'Rolling...' : 'Roll Dice'}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function SnakeLadderScreen() {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'snakeLadder')!;
  const [setup, setSetup] = useState<MatchSetup>({ gridSize: 10, levelId: '10-beginner', humanCount: 1, computerCount: 1 });
  const [resetKey, setResetKey] = useState(0);

  return (
    <GameContainer
      game={gameMetadata}
      score={0}
      onResetGame={() => setResetKey(k => k + 1)}
      settingsUI={<GameSetup initialSetup={setup} onChange={setSetup} />}
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <SnakeLadderGameInner
          key={resetKey}
          setup={setup}
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          triggerShake={triggerShake}
        />
      )}
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingBottom: 16 },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgPrimary },
  titleRow: { marginBottom: 12 },
  kicker: { color: COLORS.lime, fontSize: 10, letterSpacing: 1.5, fontWeight: '900' },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  playerChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: COLORS.bgElevated, borderWidth: 1 },
  activeChip: { backgroundColor: COLORS.bgCard, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipName: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800' },
  content: { alignItems: 'center', paddingVertical: 20, gap: 16 },
  statusBox: { width: '92%', minHeight: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgCard, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  statusText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  bottomControls: { paddingHorizontal: 16, paddingTop: 12 },
  rollButton: { height: 64, borderRadius: 16, backgroundColor: COLORS.cyan, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  rollDisabled: { opacity: 0.5, shadowOpacity: 0 },
  rollContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rollText: { color: COLORS.bgPrimary, fontSize: 18, fontWeight: '900' },
  computerThinking: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.bgElevated, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  computerText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '800' }
});
