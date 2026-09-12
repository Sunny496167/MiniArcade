export type Player = 'X' | 'O';
export type CellValue = Player | null;

export type AIDifficulty = 'Casual' | 'Pro' | 'Unbeatable';

export interface TicTacToeState {
  board: CellValue[];
  currentPlayer: Player;
  winner: Player | 'TIE' | null;
  winningLine: number[] | null;
  mode: 'vsAI' | 'pvp';
  aiDifficulty: AIDifficulty;
  xWins: number;
  oWins: number;
  ties: number;
}
