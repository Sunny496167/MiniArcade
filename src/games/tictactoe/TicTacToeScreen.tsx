import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cpu, RotateCcw, ArrowLeft } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { TicTacToeState, AIDifficulty, Player } from './types';
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
  const oName = selectedMode === 'vsAI' ? 'Computer' : 'Player O';

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calculateScore = (xWins: number, ties: number) => xWins * 100 + ties * 30;

  const handleStartGame = () => {
    setState({
      ...createInitialTicTacToeState(),
      mode: selectedMode,
      aiDifficulty: selectedDifficulty,
    });
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
    });
    setIsAiThinking(false);
  };

  const startNextRound = () => {
    setState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
    }));
    setIsAiThinking(false);
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

  // ── Gameplay Screen ────────────────────────────────────────────────────────
  return (
    <GameContainer
      game={gameMetadata}
      score={calculateScore(state.xWins, state.ties)}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => {
        // ── Handle Cell Press ─────────────────────────────────────────────
        const handleCellPress = (index: number) => {
          if (
            gameState !== 'PLAYING' ||
            state.board[index] !== null ||
            state.winner !== null ||
            isAiThinking
          ) return;

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
            setIsAiThinking(true);
            setTimeout(() => {
              const aiIdx = getAIMove(newBoard, state.aiDifficulty);
              if (aiIdx !== -1) {
                audioService.play('buttonPress');
                hapticsService.medium();
                const aiBoard = [...newBoard];
                aiBoard[aiIdx] = 'O';
                const aiResult = checkWinner(aiBoard);
                if (aiResult.winner) {
                  handleRoundEnd(aiResult.winner, aiResult.line, aiBoard);
                } else {
                  setState((prev) => ({ ...prev, board: aiBoard, currentPlayer: 'X' }));
                }
              }
              setIsAiThinking(false);
            }, 580);
          }
        };

        // ── Handle Round End ───────────────────────────────────────────────
        const handleRoundEnd = (
          winner: Player | 'TIE',
          line: number[] | null,
          finalBoard: any[]
        ) => {
          let newXWins = state.xWins;
          let newOWins = state.oWins;
          let newTies = state.ties;

          if (winner === 'X') {
            newXWins++;
            audioService.play('win');
            hapticsService.success();
          } else if (winner === 'O') {
            newOWins++;
            audioService.play('gameOver');
            hapticsService.heavy();
          } else {
            newTies++;
            audioService.play('buttonPress');
            hapticsService.light();
          }

          setState((prev) => ({
            ...prev,
            board: finalBoard,
            winner,
            winningLine: line,
            xWins: newXWins,
            oWins: newOWins,
            ties: newTies,
          }));

          const totalRounds = newXWins + newOWins + newTies;
          if (totalRounds >= 3) {
            const finalScore = calculateScore(newXWins, newTies);
            const playerWon = newXWins > newOWins;
            setTimeout(() => {
              triggerGameOver(finalScore, playerWon, [
                { label: 'Your Victories', value: newXWins, isHighlight: true },
                {
                  label: state.mode === 'vsAI' ? 'AI Victories' : 'Opponent Wins',
                  value: newOWins,
                },
                { label: 'Ties', value: newTies },
                {
                  label: 'Mode',
                  value: state.mode === 'vsAI' ? `AI · ${state.aiDifficulty}` : 'Local PvP',
                },
              ]);
            }, 1400);
          }
        };

        const totalRounds = state.xWins + state.oWins + state.ties;
        const isMatchOver = totalRounds >= 3;

        return (
          <View style={styles.container}>
            {/* ── Score Panel ──────────────────────────────────────────────── */}
            <View style={styles.scorecard}>
              {/* X Player */}
              <View
                style={[
                  styles.scoreSide,
                  state.currentPlayer === 'X' && !state.winner && styles.scoreSideActiveX,
                ]}
              >
                {state.currentPlayer === 'X' && !state.winner && !isAiThinking && (
                  <View style={[styles.activeDot, styles.activeDotX]} />
                )}
                <Text style={styles.xLabel} numberOfLines={1}>{xName.toUpperCase()}</Text>
                <Text style={styles.xScore}>{state.xWins}</Text>
              </View>

              {/* Ties */}
              <View style={styles.scoreCenter}>
                <Text style={styles.tieLabel}>TIES</Text>
                <Text style={styles.tieScore}>{state.ties}</Text>
              </View>

              {/* O Player */}
              <View
                style={[
                  styles.scoreSide,
                  state.currentPlayer === 'O' && !state.winner && styles.scoreSideActiveO,
                ]}
              >
                {state.currentPlayer === 'O' && !state.winner && (
                  <View style={[styles.activeDot, styles.activeDotO]} />
                )}
                <Text style={styles.oLabel} numberOfLines={1}>{oName.toUpperCase()}</Text>
                <Text style={styles.oScore}>{state.oWins}</Text>
              </View>
            </View>

            {/* ── Turn Banner ───────────────────────────────────────────────── */}
            <View style={styles.turnBannerWrapper}>
              {isAiThinking ? (
                <View style={[styles.turnPill, styles.turnPillAi]}>
                  <Cpu size={13} color={COLORS.purple} />
                  <Text style={[styles.turnPillText, { color: COLORS.purple }]}>
                    Computer is thinking…
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
                      ? `${xName}'s turn`
                      : `${oName}'s turn`}
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
                  gameState !== 'PLAYING'
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
                <RotateCcw size={13} color={COLORS.textMuted} />
                <Text style={styles.footerBtnText}>New Game</Text>
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
                <ArrowLeft size={13} color={COLORS.textMuted} />
                <Text style={styles.footerBtnText}>Change Mode</Text>
              </TouchableOpacity>
            </View>

            {/* ── Result Bottom Sheet ────────────────────────────────────────── */}
            <ResultModal
              visible={state.winner !== null && gameState !== 'RESULT'}
              winner={state.winner}
              xName={xName}
              oName={oName}
              xWins={state.xWins}
              oWins={state.oWins}
              ties={state.ties}
              isMatchOver={isMatchOver}
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
    paddingVertical: 10,
    gap: 10,
  },

  // ── Scorecard ──────────────────────────────────────────────────────────────
  scorecard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  scoreSide: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    position: 'relative',
  },
  scoreSideActiveX: {
    backgroundColor: 'rgba(0, 240, 255, 0.07)',
  },
  scoreSideActiveO: {
    backgroundColor: 'rgba(255, 0, 122, 0.07)',
  },
  activeDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 8,
  },
  activeDotX: {
    backgroundColor: COLORS.cyan,
    left: 8,
  },
  activeDotO: {
    backgroundColor: COLORS.magenta,
    right: 8,
  },
  xLabel: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xScore: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  scoreCenter: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  tieLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tieScore: {
    color: COLORS.textMuted,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  oLabel: {
    color: COLORS.magenta,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  oScore: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },

  // ── Turn Banner ────────────────────────────────────────────────────────────
  turnBannerWrapper: {
    alignItems: 'center',
    minHeight: 34,
    justifyContent: 'center',
  },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  turnPillX: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  turnPillO: {
    backgroundColor: 'rgba(255, 0, 122, 0.08)',
    borderColor: 'rgba(255, 0, 122, 0.3)',
  },
  turnPillAi: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  turnPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    justifyContent: 'space-between',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
