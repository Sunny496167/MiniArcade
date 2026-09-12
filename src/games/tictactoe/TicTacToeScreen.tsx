import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { TicTacToeState, AIDifficulty, Player } from './types';
import {
  createInitialTicTacToeState,
  checkWinner,
  getAIMove,
} from './engine/tictactoeEngine';
import { TicTacToeGrid } from './components/TicTacToeGrid';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

export const TicTacToeScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'tictactoe')!;

  const [state, setState] = useState<TicTacToeState>(createInitialTicTacToeState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const [isAiThinking, setIsAiThinking] = useState(false);

  const resetGame = () => {
    setState(createInitialTicTacToeState());
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

  const calculateScore = (xWins: number, ties: number) => {
    return xWins * 100 + ties * 30;
  };

  return (
    <GameContainer
      game={gameMetadata}
      score={calculateScore(state.xWins, state.ties)}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => {
        // Handle Cell Press
        const handleCellPress = (index: number) => {
          if (
            gameState !== 'PLAYING' ||
            state.board[index] !== null ||
            state.winner !== null ||
            isAiThinking
          ) {
            return;
          }

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

          setState((prev) => ({
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer,
          }));

          // Trigger AI Move if single player
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
                  setState((prev) => ({
                    ...prev,
                    board: aiBoard,
                    currentPlayer: 'X',
                  }));
                }
              }
              setIsAiThinking(false);
            }, 450);
          }
        };

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
          // Trigger game over after match conclusion or 3 rounds
          if (totalRounds >= 3) {
            const finalScore = calculateScore(newXWins, newTies);
            const playerWon = newXWins > newOWins;

            setTimeout(() => {
              triggerGameOver(finalScore, playerWon, [
                { label: 'Player Victories', value: newXWins, isHighlight: true },
                { label: 'AI Victories', value: newOWins },
                { label: 'Ties', value: newTies },
                { label: 'AI Engine', value: state.aiDifficulty },
              ]);
            }, 1200);
          }
        };

        const changeDifficulty = (diff: AIDifficulty) => {
          hapticsService.light();
          audioService.play('buttonPress');
          setState((prev) => ({ ...prev, aiDifficulty: diff }));
        };

        return (
          <View style={styles.container}>
            {/* Mode & Difficulty Selector */}
            <View style={styles.diffRow}>
              {(['Casual', 'Pro', 'Unbeatable'] as AIDifficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => changeDifficulty(diff)}
                  style={[
                    styles.diffBtn,
                    state.aiDifficulty === diff && styles.diffBtnActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.diffBtnText,
                      state.aiDifficulty === diff && styles.diffBtnTextActive,
                    ]}
                  >
                    {diff.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Scorecard */}
            <View style={styles.scorecard}>
              <View style={styles.scoreItem}>
                <Text style={styles.playerLabel}>YOU (X)</Text>
                <Text style={styles.playerScore}>{state.xWins}</Text>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.tieLabel}>TIES</Text>
                <Text style={styles.tieScore}>{state.ties}</Text>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.aiLabel}>AI (O)</Text>
                <Text style={styles.aiScore}>{state.oWins}</Text>
              </View>
            </View>

            {/* Turn Status */}
            <View style={styles.turnStatus}>
              {state.winner ? (
                <Text style={styles.turnText}>
                  {state.winner === 'TIE'
                    ? 'STALEMATE TIE!'
                    : `${state.winner === 'X' ? 'YOU WON!' : 'AI WON!'}`}
                </Text>
              ) : (
                <Text style={styles.turnText}>
                  {isAiThinking
                    ? 'NEURAL AI CALCULATING...'
                    : `CURRENT TURN: ${state.currentPlayer === 'X' ? 'YOU (X)' : 'AI (O)'}`}
                </Text>
              )}
            </View>

            {/* 3x3 Grid */}
            <View style={styles.gridWrapper}>
              <TicTacToeGrid
                board={state.board}
                winningLine={state.winningLine}
                onCellPress={handleCellPress}
                disabled={state.winner !== null || isAiThinking}
              />
            </View>

            {/* Round Next CTA if finished round */}
            {state.winner && (
              <TouchableOpacity
                style={styles.nextRoundBtn}
                onPress={startNextRound}
                activeOpacity={0.8}
              >
                <Text style={styles.nextRoundText}>NEXT ROUND</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 10 }} />
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  diffBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  diffBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: COLORS.cyan,
  },
  diffBtnText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  diffBtnTextActive: {
    color: COLORS.cyan,
  },
  scorecard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.bgCard,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  playerLabel: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  playerScore: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  tieLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  tieScore: {
    color: COLORS.textMuted,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  aiLabel: {
    color: COLORS.magenta,
    fontSize: 11,
    fontWeight: '800',
  },
  aiScore: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  turnStatus: {
    alignItems: 'center',
    marginVertical: 4,
  },
  turnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextRoundBtn: {
    backgroundColor: COLORS.cyan,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextRoundText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
