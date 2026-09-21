import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cpu, RotateCcw, ArrowLeft, Trophy, Check, X, Minus } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { TicTacToeState, AIDifficulty, Player, RoundResult } from './types';
import {
  createInitialTicTacToeState,
  checkWinner,
  getAIMove,
} from './engine/tictactoeEngine';
import { TicTacToeGrid } from './components/TicTacToeGrid';
import { ModeSelector } from './components/ModeSelector';
import { ResultModal } from './components/ResultModal';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

export const TicTacToeScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'tictactoe')!;

  // ── Phase ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'mode-select' | 'playing'>('mode-select');
  const [selectedMode, setSelectedMode] = useState<'pvp' | 'vsAI'>('vsAI');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('Unbeatable');

  // ── Game State ─────────────────────────────────────────────────────────────
  const [state, setState] = useState<TicTacToeState>(createInitialTicTacToeState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ── Player Names ───────────────────────────────────────────────────────────
  const xName = selectedMode === 'pvp' ? 'Player X' : 'You (X)';
  const oName = selectedMode === 'vsAI' ? 'Computer (O)' : 'Player O';

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calculateScore = (xWins: number, ties: number) => xWins * 120 + ties * 35;

  const handleStartGame = () => {
    const initialState = {
      ...createInitialTicTacToeState(),
      mode: selectedMode,
      aiDifficulty: selectedDifficulty,
      currentRound: 1,
      totalRounds: 5,
      roundStarter: 'X' as Player,
      currentPlayer: 'X' as Player,
    };
    setState(initialState);
    setIsAiThinking(false);
    setPhase('playing');
  };

  const handleChangeMode = () => {
    setState(createInitialTicTacToeState());
    setIsAiThinking(false);
    setPhase('mode-select');
  };

  const resetGame = () => {
    setState({
      ...createInitialTicTacToeState(),
      mode: selectedMode,
      aiDifficulty: selectedDifficulty,
      currentRound: 1,
      totalRounds: 5,
      roundStarter: 'X',
      currentPlayer: 'X',
    });
    setIsAiThinking(false);
  };

  // Start next round with ALTERNATING STARTER (Round 1: Man, Round 2: Computer, etc.)
  const startNextRound = () => {
    const nextRound = state.currentRound + 1;
    // Odd rounds (1, 3, 5): Player X starts. Even rounds (2, 4): Player O starts.
    const nextStarter: Player = nextRound % 2 === 1 ? 'X' : 'O';

    const nextState: TicTacToeState = {
      ...state,
      currentRound: nextRound,
      board: Array(9).fill(null),
      currentPlayer: nextStarter,
      roundStarter: nextStarter,
      winner: null,
      winningLine: null,
    };

    setState(nextState);
    setIsAiThinking(false);

    // If Computer starts this round, trigger its opening move automatically!
    if (state.mode === 'vsAI' && nextStarter === 'O') {
      triggerComputerMove(Array(9).fill(null), state.aiDifficulty);
    }
  };

  const triggerComputerMove = (board: (Player | null)[], diff: AIDifficulty) => {
    setIsAiThinking(true);
    setTimeout(() => {
      const aiIdx = getAIMove(board, diff);
      if (aiIdx !== -1) {
        audioService.play('buttonPress');
        hapticsService.medium();
        const aiBoard = [...board];
        aiBoard[aiIdx] = 'O';
        const aiResult = checkWinner(aiBoard);
        if (aiResult.winner) {
          handleRoundEnd(aiResult.winner, aiResult.line, aiBoard);
        } else {
          setState((prev) => ({ ...prev, board: aiBoard, currentPlayer: 'X' }));
        }
      }
      setIsAiThinking(false);
    }, 600);
  };

  // ── Mode Selection Screen ─────────────────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <ModeSelector
        selectedMode={selectedMode}
        selectedDifficulty={selectedDifficulty}
        onSelectMode={setSelectedMode}
        onSelectDifficulty={setSelectedDifficulty}
        onStart={handleStartGame}
      />
    );
  }

  const handleRoundEnd = (
    roundWinner: Player | 'TIE',
    line: number[] | null,
    finalBoard: (Player | null)[]
  ) => {
    let newXWins = state.xWins;
    let newOWins = state.oWins;
    let newTies = state.ties;

    if (roundWinner === 'X') {
      newXWins++;
      audioService.play('win');
      hapticsService.success();
    } else if (roundWinner === 'O') {
      newOWins++;
      audioService.play('gameOver');
      hapticsService.heavy();
    } else {
      newTies++;
      audioService.play('buttonPress');
      hapticsService.light();
    }

    const updatedHistory: RoundResult[] = [...state.roundHistory, roundWinner];
    const isChampionshipOver = state.currentRound >= 5;

    let championshipWinner: 'X' | 'O' | 'TIE' | null = null;
    if (isChampionshipOver) {
      if (newXWins > newOWins) championshipWinner = 'X';
      else if (newOWins > newXWins) championshipWinner = 'O';
      else championshipWinner = 'TIE';
    }

    setState((prev) => ({
      ...prev,
      board: finalBoard,
      winner: roundWinner,
      winningLine: line,
      xWins: newXWins,
      oWins: newOWins,
      ties: newTies,
      roundHistory: updatedHistory,
      matchOver: isChampionshipOver,
      matchWinner: championshipWinner,
    }));
  };

  // ── Gameplay Screen ────────────────────────────────────────────────────────
  return (
    <GameContainer
      game={gameMetadata}
      score={calculateScore(state.xWins, state.ties)}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => {
        // Trigger final GameContainer Game Over once the 5th round is acknowledged or concluded
        if (state.matchOver && state.winner !== null && gameState === 'PLAYING') {
          const finalScore = calculateScore(state.xWins, state.ties);
          const isPlayerChampion = state.xWins > state.oWins;
          setTimeout(() => {
            triggerGameOver(finalScore, isPlayerChampion, [
              { label: 'Man (X) Victories', value: state.xWins, isHighlight: true },
              {
                label: state.mode === 'vsAI' ? 'Computer (O) Victories' : 'Player O Victories',
                value: state.oWins,
              },
              { label: 'Ties', value: state.ties },
              {
                label: 'Championship Series',
                value:
                  state.xWins > state.oWins
                    ? 'Man Prevails (Champion)'
                    : state.oWins > state.xWins
                    ? 'Computer Dominates'
                    : 'Series Drawn',
              },
              {
                label: 'Mode',
                value: state.mode === 'vsAI' ? `AI · ${state.aiDifficulty}` : 'Local 2P Duel',
              },
            ]);
          }, 1800);
        }

        // ── Handle Cell Press ─────────────────────────────────────────────
        const handleCellPress = (index: number) => {
          if (
            gameState !== 'PLAYING' ||
            state.board[index] !== null ||
            state.winner !== null ||
            isAiThinking
          )
            return;

          // Only human can tap when it's their turn
          if (state.mode === 'vsAI' && state.currentPlayer !== 'X') return;

          audioService.play('pointScore');
          hapticsService.light();

          const newBoard = [...state.board];
          newBoard[index] = state.currentPlayer;
          const { winner, line } = checkWinner(newBoard);

          if (winner) {
            handleRoundEnd(winner, line, newBoard);
            return;
          }

          const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';
          setState((prev) => ({ ...prev, board: newBoard, currentPlayer: nextPlayer }));

          // Trigger AI move if in vsAI mode
          if (state.mode === 'vsAI' && nextPlayer === 'O') {
            triggerComputerMove(newBoard, state.aiDifficulty);
          }
        };

        return (
          <View style={styles.container}>
            {/* ── 5-Round Match Championship Header ───────────────────────── */}
            <View style={styles.matchTrackerCard}>
              <View style={styles.matchTitleRow}>
                <Text style={styles.matchBadge}>CHAMPIONSHIP SERIES</Text>
                <Text style={styles.roundIndicatorText}>
                  ROUND {state.currentRound} / 5
                </Text>
              </View>

              {/* 5-Round Progress Badges */}
              <View style={styles.roundsRow}>
                {[1, 2, 3, 4, 5].map((roundNum) => {
                  const isPast = roundNum < state.currentRound;
                  const isCurrent = roundNum === state.currentRound;
                  const result = state.roundHistory[roundNum - 1];
                  const starter = roundNum % 2 === 1 ? 'Man' : 'AI';

                  return (
                    <View
                      key={roundNum}
                      style={[
                        styles.roundDotBox,
                        isCurrent && styles.roundDotBoxCurrent,
                        isPast && styles.roundDotBoxCompleted,
                      ]}
                    >
                      <Text style={styles.roundDotNum}>R{roundNum}</Text>
                      {result === 'X' ? (
                        <Check size={12} color={COLORS.cyan} strokeWidth={3} />
                      ) : result === 'O' ? (
                        <X size={12} color={COLORS.magenta} strokeWidth={3} />
                      ) : result === 'TIE' ? (
                        <Minus size={12} color={COLORS.amber} strokeWidth={3} />
                      ) : (
                        <Text style={styles.roundStarterTag}>{starter}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── Score Panel ──────────────────────────────────────────────── */}
            <View style={styles.scorecard}>
              {/* X Player (Man) */}
              <View
                style={[
                  styles.scoreSide,
                  state.currentPlayer === 'X' && !state.winner && styles.scoreSideActiveX,
                ]}
              >
                {state.currentPlayer === 'X' && !state.winner && !isAiThinking && (
                  <View style={[styles.activeDot, styles.activeDotX]} />
                )}
                <Text style={styles.xLabel} numberOfLines={1}>
                  {xName.toUpperCase()}
                </Text>
                <Text style={styles.xScore}>{state.xWins}</Text>
                {state.roundStarter === 'X' && (
                  <Text style={styles.starterPill}>Started Round</Text>
                )}
              </View>

              {/* Ties */}
              <View style={styles.scoreCenter}>
                <Text style={styles.tieLabel}>TIES</Text>
                <Text style={styles.tieScore}>{state.ties}</Text>
              </View>

              {/* O Player (Computer) */}
              <View
                style={[
                  styles.scoreSide,
                  state.currentPlayer === 'O' && !state.winner && styles.scoreSideActiveO,
                ]}
              >
                {state.currentPlayer === 'O' && !state.winner && (
                  <View style={[styles.activeDot, styles.activeDotO]} />
                )}
                <Text style={styles.oLabel} numberOfLines={1}>
                  {oName.toUpperCase()}
                </Text>
                <Text style={styles.oScore}>{state.oWins}</Text>
                {state.roundStarter === 'O' && (
                  <Text style={styles.starterPill}>Started Round</Text>
                )}
              </View>
            </View>

            {/* ── Turn Banner ───────────────────────────────────────────────── */}
            <View style={styles.turnBannerWrapper}>
              {isAiThinking ? (
                <View style={[styles.turnPill, styles.turnPillAi]}>
                  <Cpu size={14} color={COLORS.magenta} />
                  <Text style={[styles.turnPillText, { color: COLORS.magenta }]}>
                    Computer is calculating turn...
                  </Text>
                </View>
              ) : !state.winner ? (
                <View
                  style={[
                    styles.turnPill,
                    state.currentPlayer === 'X' ? styles.turnPillX : styles.turnPillO,
                  ]}
                >
                  <Text
                    style={[
                      styles.turnPillText,
                      {
                        color:
                          state.currentPlayer === 'X' ? COLORS.cyan : COLORS.magenta,
                      },
                    ]}
                  >
                    {state.currentPlayer === 'X'
                      ? `${xName}'s Turn (Place marker)`
                      : `${oName}'s Turn`}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ── Game Board ────────────────────────────────────────────────── */}
            <View style={styles.gridWrapper}>
              <TicTacToeGrid
                board={state.board}
                winningLine={state.winningLine}
                onCellPress={handleCellPress}
                disabled={
                  state.winner !== null ||
                  isAiThinking ||
                  gameState !== 'PLAYING' ||
                  (state.mode === 'vsAI' && state.currentPlayer === 'O')
                }
              />
            </View>

            {/* ── Footer Controls ───────────────────────────────────────────── */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.footerBtn}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  resetGame();
                }}
                activeOpacity={0.7}
              >
                <RotateCcw size={14} color={COLORS.textMuted} />
                <Text style={styles.footerBtnText}>Reset Match</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerBtn}
                onPress={() => {
                  hapticsService.light();
                  audioService.play('buttonPress');
                  handleChangeMode();
                }}
                activeOpacity={0.7}
              >
                <ArrowLeft size={14} color={COLORS.textMuted} />
                <Text style={styles.footerBtnText}>Change Mode</Text>
              </TouchableOpacity>
            </View>

            {/* ── Result Modal between rounds and match end ──────────────────── */}
            <ResultModal
              visible={state.winner !== null && gameState !== 'RESULT'}
              winner={state.winner}
              xName={xName}
              oName={oName}
              xWins={state.xWins}
              oWins={state.oWins}
              ties={state.ties}
              isMatchOver={state.matchOver}
              onNextRound={startNextRound}
              onChangeMode={handleChangeMode}
            />
          </View>
        );
      }}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },

  // ── 5-Round Match Championship Header ──────────────────────────────────────
  matchTrackerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  matchTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchBadge: {
    color: COLORS.amber,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roundIndicatorText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  roundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  roundDotBox: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundDotBoxCurrent: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0,240,255,0.12)',
  },
  roundDotBoxCompleted: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  roundDotNum: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  roundStarterTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },

  // ── Scorecard ──────────────────────────────────────────────────────────────
  scorecard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  scoreSide: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    position: 'relative',
  },
  scoreSideActiveX: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.cyan,
  },
  scoreSideActiveO: {
    backgroundColor: 'rgba(255, 0, 122, 0.08)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.magenta,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDotX: {
    backgroundColor: COLORS.cyan,
  },
  activeDotO: {
    backgroundColor: COLORS.magenta,
  },
  xLabel: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xScore: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  oLabel: {
    color: COLORS.magenta,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  oScore: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  starterPill: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreCenter: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tieLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tieScore: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },

  // ── Turn Banner ────────────────────────────────────────────────────────────
  turnBannerWrapper: {
    alignItems: 'center',
    minHeight: 28,
    justifyContent: 'center',
  },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  turnPillX: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  turnPillO: {
    backgroundColor: 'rgba(255, 0, 122, 0.1)',
    borderColor: 'rgba(255, 0, 122, 0.3)',
  },
  turnPillAi: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  turnPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Grid ───────────────────────────────────────────────────────────────────
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 4,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
