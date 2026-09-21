export type Player = 'X' | 'O';
export type CellValue = Player | null;

export type AIDifficulty = 'Casual' | 'Pro' | 'Unbeatable';

export type RoundResult = 'X' | 'O' | 'TIE';

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
  currentRound: number; // 1 to 5
  totalRounds: number; // 5
  roundHistory: RoundResult[];
  roundStarter: Player; // 'X' (Man) or 'O' (Computer)
  matchOver: boolean;
  matchWinner: 'X' | 'O' | 'TIE' | null;
}

