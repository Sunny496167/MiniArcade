import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Bot, User, Dices } from 'lucide-react-native';
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
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
}

function SnakeLadderGameInner({ setup, gameState, triggerGameOver, triggerShake }: InnerProps) {
  const [state, setState] = useState<SnakeLadderState>(() => createGameState(setup));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (aiTimer.current) clearTimeout(aiTimer.current);
    },
    []
  );

  const level = useMemo(() => getLevel(setup.levelId), [setup.levelId]);

  const roll = () => {
    if (!state || gameState !== 'PLAYING' || state.phase !== 'awaiting-roll' || state.winnerId)
      return;
    setState((previous) =>
      previous
        ? {
            ...previous,
            phase: 'rolling',
            message: `${previous.players[previous.currentPlayerIndex].name} is rolling...`,
          }
        : previous
    );
    timer.current = setTimeout(() => {
      const value = rollDice();
      setState((previous) => (previous ? resolveTurn(previous, value, setup.levelId) : previous));
    }, 520);
  };

  useEffect(() => {
    if (!state || gameState !== 'PLAYING' || state.phase !== 'awaiting-roll' || state.winnerId)
      return;
    const player = state.players[state.currentPlayerIndex];
    if (player.kind !== 'computer') return;
    aiTimer.current = setTimeout(roll, 800);
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, [state?.currentPlayerIndex, state?.phase, state?.winnerId, gameState]);

  useEffect(() => {
    if (state.winnerId && gameState === 'PLAYING') {
      const winner = state.players.find((p) => p.id === state.winnerId);
      const isHuman = winner?.kind === 'human';
      const score = isHuman ? Math.max(0, 1000 - state.moveCount * 5) : 0;

      setTimeout(() => {
        triggerGameOver(score, isHuman, [
          { label: 'Winner', value: winner?.name || 'Unknown', isHighlight: true },
          { label: 'Total Turns', value: state.moveCount.toString() },
          { label: 'Level', value: level.name },
        ]);
      }, 650);
    }
  }, [state.winnerId, gameState, level.name]);

  const activePlayer = state.players[state.currentPlayerIndex];
  const winner = state.players.find((player) => player.id === state.winnerId);

  const player1 = state.players[0]; // Bottom player
  const player2 = state.players[1]; // Top opponent

  const isPlayer1Turn = state.currentPlayerIndex === 0 && !winner && gameState === 'PLAYING';
  const isPlayer2Turn = state.currentPlayerIndex === 1 && !winner && gameState === 'PLAYING';

  const canPlayer1Roll = isPlayer1Turn && state.phase === 'awaiting-roll' && player1?.kind === 'human';
  const canPlayer2Roll = isPlayer2Turn && state.phase === 'awaiting-roll' && player2?.kind === 'human';

  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 380);

  return (
    <View style={styles.screen}>
      {/* ── TOP PLAYER AREA (Player 2 / Computer) ─────────────────────── */}
      <View
        style={[
          styles.playerPanel,
          styles.topPanel,
          isPlayer2Turn && { borderColor: player2?.color || COLORS.rose, backgroundColor: 'rgba(244,63,94,0.08)' },
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={[styles.avatarCircle, { backgroundColor: player2?.color || COLORS.rose }]}>
            {player2?.kind === 'computer' ? (
              <Bot size={16} color="#FFFFFF" />
            ) : (
              <User size={16} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.playerNameText}>{player2?.name || 'Opponent'}</Text>
            <Text style={styles.positionText}>
              Square <Text style={[styles.posNum, { color: player2?.color }]}>{player2?.position || 1}</Text>
            </Text>
          </View>
          {isPlayer2Turn && (
            <View style={[styles.turnBadge, { backgroundColor: player2?.color }]}>
              <Text style={styles.turnBadgeText}>ACTIVE TURN</Text>
            </View>
          )}
        </View>

        {/* Action Button for Player 2 */}
        {isPlayer2Turn && player2?.kind === 'computer' ? (
          <View style={styles.thinkingBar}>
            <ActivityIndicator size="small" color={player2?.color || COLORS.cyan} />
            <Text style={styles.thinkingText}>Thinking & rolling...</Text>
          </View>
        ) : isPlayer2Turn && player2?.kind === 'human' ? (
          <Pressable
            disabled={!canPlayer2Roll}
            onPress={roll}
            style={[styles.miniRollBtn, { backgroundColor: player2?.color }]}
          >
            <AnimatedDice value={state.diceValue} isRolling={state.phase === 'rolling'} />
            <Text style={styles.miniRollText}>
              {state.phase === 'rolling' ? 'Rolling...' : 'Roll Dice'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ── CENTER BOARD & EVENT MESSAGE ──────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.centerContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <SnakeLadderBoard level={level} players={state.players} boardSize={boardSize} />

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{state.message}</Text>
        </View>
      </ScrollView>

      {/* ── BOTTOM PLAYER AREA (Player 1 / Human) ─────────────────────── */}
      <View
        style={[
          styles.playerPanel,
          styles.bottomPanel,
          isPlayer1Turn && { borderColor: player1?.color || COLORS.cyan, backgroundColor: 'rgba(0,240,255,0.08)' },
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={[styles.avatarCircle, { backgroundColor: player1?.color || COLORS.cyan }]}>
            <User size={16} color="#FFFFFF" />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.playerNameText}>{player1?.name || 'Player 1'}</Text>
            <Text style={styles.positionText}>
              Square <Text style={[styles.posNum, { color: player1?.color }]}>{player1?.position || 1}</Text>
            </Text>
          </View>
          {isPlayer1Turn && (
            <View style={[styles.turnBadge, { backgroundColor: player1?.color }]}>
              <Text style={styles.turnBadgeText}>YOUR TURN</Text>
            </View>
          )}
        </View>

        {/* Action Button for Player 1 */}
        {winner ? (
          <View style={styles.winnerBar}>
            <Text style={styles.winnerText}>🏆 {winner.name} Won!</Text>
          </View>
        ) : (
          <Pressable
            disabled={!canPlayer1Roll}
            onPress={roll}
            style={[
              styles.playerRollBtn,
              !canPlayer1Roll && styles.rollDisabled,
            ]}
          >
            <View style={styles.rollBtnContent}>
              <AnimatedDice value={state.diceValue} isRolling={state.phase === 'rolling'} />
              <Text style={styles.rollBtnText}>
                {state.phase === 'rolling'
                  ? 'Rolling...'
                  : isPlayer1Turn
                  ? 'Tap to Roll Dice'
                  : 'Opponent Turn'}
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
  const [setup, setSetup] = useState<MatchSetup>({
    gridSize: 10,
    levelId: '10-beginner',
    humanCount: 1,
    computerCount: 1,
  });
  const [resetKey, setResetKey] = useState(0);

  return (
    <GameContainer
      game={gameMetadata}
      score={0}
      onResetGame={() => setResetKey((k) => k + 1)}
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
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  playerPanel: {
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    gap: 8,
  },
  topPanel: {
    marginBottom: 4,
  },
  bottomPanel: {
    marginTop: 4,
  },
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  nameBlock: {
    flex: 1,
  },
  playerNameText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  positionText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  posNum: {
    fontWeight: '900',
    fontSize: 12,
  },
  turnBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  turnBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  thinkingBar: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
  },
  thinkingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  miniRollBtn: {
    height: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  miniRollText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  statusBox: {
    width: '100%',
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  playerRollBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  rollDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  rollBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rollBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  winnerBar: {
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.amber,
  },
  winnerText: {
    color: COLORS.amber,
    fontSize: 15,
    fontWeight: '900',
  },
});
