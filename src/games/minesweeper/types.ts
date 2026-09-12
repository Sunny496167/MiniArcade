export interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface MinesweeperState {
  grid: Cell[][];
  rows: number;
  cols: number;
  totalMines: number;
  flagsPlaced: number;
  revealedCount: number;
  firstClick: boolean;
  isGameOver: boolean;
  isWon: boolean;
  timeElapsed: number;
  flagMode: boolean;
}
