import { GameMetadata, GameCategory } from '../types/arcade';
import { COLORS } from './theme';

export const GAMES_REGISTRY: GameMetadata[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    tagline: 'Cybernetic reflex eating frenzy',
    description: 'Guide your high-voltage neon serpent through the cyber grid. Collect data nodes, avoid borders, and prevent self-collision as velocity escalates.',
    category: 'classic',
    difficulty: 'Medium',
    iconName: 'Zap',
    accentColor: COLORS.lime,
    secondaryColor: COLORS.cyan,
    baseXp: 120,
    featured: true,
    howToPlay: [
      'Swipe or tap directional controls to steer your neon snake.',
      'Consume glowing cyan nodes to gain points and increase your length.',
      'Snatch golden bonus sparks before they vanish for 5x points!',
      'Avoid running into your own tail or perimeter barriers.'
    ],
    controlsDescription: 'Swipe gestures or on-screen tactile D-Pad'
  },
  {
    id: 'breakout',
    title: 'Neon Breakout',
    tagline: 'High-energy brick shattering arcade',
    description: 'Smash through defense matrices with energized plasma balls. Catch falling power-ups like laser blasters, multi-ball splits, and elongated shields.',
    category: 'arcade',
    difficulty: 'Medium',
    iconName: 'Layers',
    accentColor: COLORS.magenta,
    secondaryColor: COLORS.amber,
    baseXp: 150,
    isNew: true,
    howToPlay: [
      'Drag your finger smoothly across the paddle zone to bounce the ball.',
      'Clear all defensive neon brick tiers to advance.',
      'Chain consecutive hits without misses to trigger combo multipliers.',
      'Grab power-ups: Cyan (Multi-ball), Gold (Expanded paddle), Rose (Laser shot).'
    ],
    controlsDescription: 'Horizontal drag or touch track anywhere at the bottom'
  },
  {
    id: 'game2048',
    title: '2048 Glow',
    tagline: 'Cyber tile fusion puzzle',
    description: 'Slide holographic numeric cubes across the board. Collide matching values to synthesize exponentially higher core power until reaching 2048 and beyond!',
    category: 'puzzle',
    difficulty: 'Hard',
    iconName: 'Grid',
    accentColor: COLORS.purple,
    secondaryColor: COLORS.cyan,
    baseXp: 200,
    howToPlay: [
      'Swipe Up, Down, Left, or Right to slide all tiles in that direction.',
      'When two tiles with identical numbers collide, they fuse into one sum.',
      'A new 2 or 4 tile materializes after every valid swipe.',
      'Strategize your merges to prevent the 4x4 matrix from filling up.'
    ],
    controlsDescription: 'Swipe in any cardinal direction across the grid'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper Tactical',
    tagline: 'High-stakes tactical mine defusal',
    description: 'Scan encrypted battlefield grids using numerical sonar intelligence. Flag concealed plasma mines, calculate safe coordinates, and clear the board unscathed.',
    category: 'strategy',
    difficulty: 'Hard',
    iconName: 'Target',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.rose,
    baseXp: 180,
    howToPlay: [
      'Tap any cell to scan and inspect its frequency.',
      'Numbers indicate how many plasma mines touch that specific cell.',
      'Toggle the Flag Mode button or long-press to securely lock down mines.',
      'Revealing all non-mine territory wins the mission!'
    ],
    controlsDescription: 'Tap to reveal, Flag switch or long-press to mark'
  },
  {
    id: 'reaction',
    title: 'Speed Reflex',
    tagline: 'Millisecond neural reaction trial',
    description: 'Benchmark your neurological impulse speed against superhuman thresholds. Wait for the signal pulse, react instantly, and earn your Cyber Runner rank.',
    category: 'reaction',
    difficulty: 'Easy',
    iconName: 'Activity',
    accentColor: COLORS.amber,
    secondaryColor: COLORS.rose,
    baseXp: 90,
    isNew: true,
    howToPlay: [
      'Tap to initiate the reflex scanner sequence.',
      'Wait with hyper-focus while the interface charges (DO NOT TAP EARLY).',
      'The exact millisecond the screen flashes hyper-neon, TAP AS FAST AS YOU CAN!',
      'Complete 5 trials to compute your neurological reflex classification.'
    ],
    controlsDescription: 'Single tap anywhere on screen'
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    tagline: 'Neural network grid warfare',
    description: 'Clash in holographic 3x3 combat against an adaptable neural AI engine or challenge a friend in local cyber pass-and-play duel mode.',
    category: 'strategy',
    difficulty: 'Medium',
    iconName: 'Cpu',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.magenta,
    baseXp: 100,
    howToPlay: [
      'Select single player against AI or 2-player local battle.',
      'Tap any empty coordinate on the grid to position your neon marker.',
      'Align 3 markers horizontally, vertically, or diagonally to trigger victory.',
      'Master the Unbeatable Minimax AI to prove strategic superiority.'
    ],
    controlsDescription: 'Tap cell to place marker'
  }
];

export const CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Games', icon: 'Gamepad2' },
  { id: 'arcade', label: 'Arcade', icon: 'Flame' },
  { id: 'puzzle', label: 'Puzzle', icon: 'Puzzle' },
  { id: 'strategy', label: 'Strategy', icon: 'Brain' },
  { id: 'reaction', label: 'Reaction', icon: 'Timer' },
  { id: 'classic', label: 'Classic', icon: 'Sparkles' },
];
