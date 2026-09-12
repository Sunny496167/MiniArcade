import { SwipeDirection, State2048 } from '../types';

export const BOARD_SIZE = 4;

export const createEmptyBoard = (): (number | null)[][] => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
};

export const spawnRandomTile = (
  board: (number | null)[][]
): { board: (number | null)[][]; spawned: boolean } => {
  const emptyCoords: { r: number; c: number }[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) {
        emptyCoords.push({ r, c });
      }
    }
  }

  if (emptyCoords.length === 0) {
    return { board, spawned: false };
  }

  const randomCoord =
    emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map((row) => [...row]);
  newBoard[randomCoord.r][randomCoord.c] = value;

  return { board: newBoard, spawned: true };
};

export const createInitial2048State = (): State2048 => {
  let board = createEmptyBoard();
  board = spawnRandomTile(board).board;
  board = spawnRandomTile(board).board;

  return {
    board,
    score: 0,
    moves: 0,
    highestTile: 4,
    isGameOver: false,
    hasWon: false,
  };
};

function slideAndMergeRow(row: (number | null)[]): {
  newRow: (number | null)[];
  scoreGained: number;
  changed: boolean;
} {
  // Filter out nulls
  const filtered = row.filter((val): val is number => val !== null);
  const result: (number | null)[] = [];
  let scoreGained = 0;

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2;
      result.push(mergedVal);
      scoreGained += mergedVal;
      i++; // Skip next element since it merged
    } else {
      result.push(filtered[i]);
    }
  }

  while (result.length < BOARD_SIZE) {
    result.push(null);
  }

  const changed = row.some((val, idx) => val !== result[idx]);
  return { newRow: result, scoreGained, changed };
}

export function hasMovesLeft(board: (number | null)[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return true;
      if (c < BOARD_SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < BOARD_SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export function moveBoard(
  state: State2048,
  direction: SwipeDirection
): {
  nextState: State2048;
  moved: boolean;
  scoreGained: number;
} {
  const currentBoard = state.board;
  let tempBoard: (number | null)[][] = createEmptyBoard();
  let totalScoreGained = 0;
  let boardChanged = false;

  const history = {
    board: currentBoard.map((row) => [...row]),
    score: state.score,
    moves: state.moves,
  };

  if (direction === 'LEFT') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const { newRow, scoreGained, changed } = slideAndMergeRow(currentBoard[r]);
      tempBoard[r] = newRow;
      totalScoreGained += scoreGained;
      if (changed) boardChanged = true;
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const reversed = [...currentBoard[r]].reverse();
      const { newRow, scoreGained, changed } = slideAndMergeRow(reversed);
      tempBoard[r] = newRow.reverse();
      totalScoreGained += scoreGained;
      if (changed) boardChanged = true;
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = [
        currentBoard[0][c],
        currentBoard[1][c],
        currentBoard[2][c],
        currentBoard[3][c],
      ];
      const { newRow, scoreGained, changed } = slideAndMergeRow(col);
      for (let r = 0; r < BOARD_SIZE; r++) {
        tempBoard[r][c] = newRow[r];
      }
      totalScoreGained += scoreGained;
      if (changed) boardChanged = true;
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = [
        currentBoard[3][c],
        currentBoard[2][c],
        currentBoard[1][c],
        currentBoard[0][c],
      ];
      const { newRow, scoreGained, changed } = slideAndMergeRow(col);
      tempBoard[3][c] = newRow[0];
      tempBoard[2][c] = newRow[1];
      tempBoard[1][c] = newRow[2];
      tempBoard[0][c] = newRow[3];
      totalScoreGained += scoreGained;
      if (changed) boardChanged = true;
    }
  }

  if (!boardChanged) {
    return { nextState: state, moved: false, scoreGained: 0 };
  }

  // Spawn new tile
  const { board: spawnedBoard } = spawnRandomTile(tempBoard);

  // Calculate highest tile
  let maxTile = state.highestTile;
  let won = state.hasWon;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = spawnedBoard[r][c];
      if (val && val > maxTile) {
        maxTile = val;
      }
      if (val && val >= 2048) {
        won = true;
      }
    }
  }

  const gameOver = !hasMovesLeft(spawnedBoard);

  return {
    nextState: {
      board: spawnedBoard,
      score: state.score + totalScoreGained,
      moves: state.moves + 1,
      highestTile: maxTile,
      isGameOver: gameOver,
      hasWon: won,
      history,
    },
    moved: true,
    scoreGained: totalScoreGained,
  };
}

export function undoMove(state: State2048): State2048 {
  if (!state.history) return state;

  let maxTile = 2;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = state.history.board[r][c];
      if (val && val > maxTile) maxTile = val;
    }
  }

  return {
    board: state.history.board,
    score: state.history.score,
    moves: state.history.moves,
    highestTile: maxTile,
    isGameOver: false,
    hasWon: state.hasWon,
    history: undefined,
  };
}
