import { CellValue, Player, AIDifficulty, TicTacToeState } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diag 1
  [2, 4, 6], // Diag 2
];

export const createInitialTicTacToeState = (): TicTacToeState => {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    mode: 'vsAI',
    aiDifficulty: 'Unbeatable',
    xWins: 0,
    oWins: 0,
    ties: 0,
    currentRound: 1,
    totalRounds: 5,
    roundHistory: [],
    roundStarter: 'X',
    matchOver: false,
    matchWinner: null,
  };
};

export function checkWinner(board: CellValue[]): {
  winner: Player | 'TIE' | null;
  line: number[] | null;
} {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: 'TIE', line: null };
  }

  return { winner: null, line: null };
}

// Minimax algorithm for unbeatable AI
function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean
): number {
  const result = checkWinner(board);
  if (result.winner === 'O') return 10 - depth;
  if (result.winner === 'X') return depth - 10;
  if (result.winner === 'TIE') return 0;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        maxScore = Math.max(score, maxScore);
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        minScore = Math.min(score, minScore);
      }
    }
    return minScore;
  }
}

export function getAIMove(
  board: CellValue[],
  difficulty: AIDifficulty
): number {
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (emptyIndices.length === 0) return -1;

  // Casual: Mostly random moves
  if (difficulty === 'Casual') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Pro: 75% optimal Minimax, 25% random
  if (difficulty === 'Pro' && Math.random() < 0.25) {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Unbeatable: Pure Minimax optimal search
  let bestScore = -Infinity;
  let bestMove = emptyIndices[0];

  for (const idx of emptyIndices) {
    board[idx] = 'O';
    const score = minimax(board, 0, false);
    board[idx] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }

  return bestMove;
}
