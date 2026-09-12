import { Cell, MinesweeperState } from '../types';

export const DEFAULT_ROWS = 9;
export const DEFAULT_COLS = 9;
export const DEFAULT_MINES = 10;

export const createEmptyGrid = (rows: number, cols: number): Cell[][] => {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    grid.push(row);
  }
  return grid;
};

export const createInitialMinesweeperState = (
  rows: number = DEFAULT_ROWS,
  cols: number = DEFAULT_COLS,
  totalMines: number = DEFAULT_MINES
): MinesweeperState => {
  return {
    grid: createEmptyGrid(rows, cols),
    rows,
    cols,
    totalMines,
    flagsPlaced: 0,
    revealedCount: 0,
    firstClick: true,
    isGameOver: false,
    isWon: false,
    timeElapsed: 0,
    flagMode: false,
  };
};

function populateMinesAndNumbers(
  grid: Cell[][],
  rows: number,
  cols: number,
  totalMines: number,
  firstTapR: number,
  firstTapC: number
): Cell[][] {
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  let minesPlaced = 0;
  while (minesPlaced < totalMines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Ensure first tapped cell and immediate neighbors are mine-free for a fun opening!
    const isAroundFirstTap = Math.abs(r - firstTapR) <= 1 && Math.abs(c - firstTapC) <= 1;

    if (!newGrid[r][c].isMine && !isAroundFirstTap) {
      newGrid[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].isMine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (newGrid[nr][nc].isMine) count++;
          }
        }
      }
      newGrid[r][c].neighborMines = count;
    }
  }

  return newGrid;
}

export function revealCell(
  state: MinesweeperState,
  r: number,
  c: number
): {
  nextState: MinesweeperState;
  hitMine: boolean;
  won: boolean;
} {
  if (state.isGameOver || state.isWon) {
    return { nextState: state, hitMine: false, won: false };
  }

  let grid = state.grid;

  // Handle first click safe initialization
  if (state.firstClick) {
    grid = populateMinesAndNumbers(
      grid,
      state.rows,
      state.cols,
      state.totalMines,
      r,
      c
    );
  }

  const targetCell = grid[r][c];
  if (targetCell.isFlagged || targetCell.isRevealed) {
    return { nextState: state, hitMine: false, won: false };
  }

  // Hit Mine
  if (targetCell.isMine) {
    const revealedGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isRevealed: cell.isMine ? true : cell.isRevealed,
      }))
    );

    return {
      nextState: {
        ...state,
        grid: revealedGrid,
        firstClick: false,
        isGameOver: true,
      },
      hitMine: true,
      won: false,
    };
  }

  // Recursive Cascade Reveal on 0s
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  let newlyRevealed = 0;

  const queue: { r: number; c: number }[] = [{ r, c }];
  newGrid[r][c].isRevealed = true;
  newlyRevealed++;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currCell = newGrid[curr.r][curr.c];

    if (currCell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = curr.r + dr;
          const nc = curr.c + dc;
          if (
            nr >= 0 &&
            nr < state.rows &&
            nc >= 0 &&
            nc < state.cols &&
            !newGrid[nr][nc].isRevealed &&
            !newGrid[nr][nc].isFlagged &&
            !newGrid[nr][nc].isMine
          ) {
            newGrid[nr][nc].isRevealed = true;
            newlyRevealed++;
            if (newGrid[nr][nc].neighborMines === 0) {
              queue.push({ r: nr, c: nc });
            }
          }
        }
      }
    }
  }

  const totalRevealed = state.revealedCount + newlyRevealed;
  const targetToWin = state.rows * state.cols - state.totalMines;
  const won = totalRevealed >= targetToWin;

  return {
    nextState: {
      ...state,
      grid: newGrid,
      revealedCount: totalRevealed,
      firstClick: false,
      isWon: won,
      isGameOver: won,
    },
    hitMine: false,
    won,
  };
}

export function toggleFlagCell(
  state: MinesweeperState,
  r: number,
  c: number
): MinesweeperState {
  if (state.isGameOver || state.isWon) return state;

  const target = state.grid[r][c];
  if (target.isRevealed) return state;

  const newGrid = state.grid.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      if (rowIdx === r && colIdx === c) {
        return { ...cell, isFlagged: !cell.isFlagged };
      }
      return cell;
    })
  );

  const newFlagsPlaced = target.isFlagged
    ? state.flagsPlaced - 1
    : state.flagsPlaced + 1;

  return {
    ...state,
    grid: newGrid,
    flagsPlaced: newFlagsPlaced,
  };
}
