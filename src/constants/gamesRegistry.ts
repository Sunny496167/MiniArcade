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
  },
  {
    id: 'snakeLadder',
    title: 'Neon Chutes & Ladders',
    tagline: 'Cybernetic board game escalation',
    description: 'Race against the AI on a neon grid. Climb cyber-ladders to escalate rapidly, but beware the glitch-snakes that will drop you back down.',
    category: 'classic',
    difficulty: 'Easy',
    iconName: 'Dices',
    accentColor: COLORS.amber,
    secondaryColor: COLORS.rose,
    baseXp: 100,
    isNew: true,
    howToPlay: [
      'Roll the dice to move your token across the board.',
      'Land exactly on the base of a ladder to climb up quickly.',
      'Avoid landing on a snake head, or you will slide down to its tail.',
      'First to reach the final square wins the match!'
    ],
    controlsDescription: 'Tap to roll the dice'
  },
  {
    id: 'memory',
    title: 'Cyber Recall',
    tagline: 'Visual memory matching trial',
    description: 'Decrypt the data matrix by matching identical neural signatures. Flip holographic nodes to find pairs and clear the grid with the fewest possible moves.',
    category: 'puzzle',
    difficulty: 'Easy',
    iconName: 'Cpu',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.purple,
    baseXp: 120,
    isNew: true,
    howToPlay: [
      'Tap any encrypted node to reveal its core symbol.',
      'Tap a second node to attempt a match.',
      'If the symbols are identical, the nodes remain decrypted.',
      'If they differ, both nodes will encrypt again. Clear the board in minimum moves!'
    ],
    controlsDescription: 'Tap nodes to reveal symbols'
  },
  {
    id: 'simon',
    title: 'Neon Sequence',
    tagline: 'Auditory and visual pattern recall',
    description: 'Synchronize with the core mainframe by repeating its complex signal patterns. Watch the neon panels glow, listen to the sequence, and replicate it flawlessly.',
    category: 'reaction',
    difficulty: 'Medium',
    iconName: 'Activity',
    accentColor: COLORS.magenta,
    secondaryColor: COLORS.amber,
    baseXp: 150,
    isNew: true,
    howToPlay: [
      'Observe the mainframe as it plays a sequence of glowing panels.',
      'Once the sequence finishes, repeat it exactly by tapping the panels.',
      'Each successful round adds one new panel to the sequence.',
      'A single mistake terminates the synchronization. Achieve the longest sequence!'
    ],
    controlsDescription: 'Tap the glowing panels in order'
  },
  {
    id: 'pokeman',
    title: 'Pac-Man',
    tagline: 'Retro cyber chomper & maze chase',
    description: 'Guide Pac-Man through 30 progressive neon mazes. Chomp all pac-dots, consume power energizers to devour ghosts, and grab fruit bonuses!',
    category: 'arcade',
    difficulty: 'Medium',
    iconName: 'Ghost',
    accentColor: '#FACC15',
    secondaryColor: COLORS.cyan,
    baseXp: 160,
    isNew: true,
    howToPlay: [
      'Swipe or use the on-screen Cyber D-Pad to turn Pac-Man.',
      'Chomp all dots in the maze while evading Blinky, Pinky, Inky, and Clyde.',
      'Eat glowing Energizers to turn ghosts blue and chomp them for up to 1600 bonus pts!',
      'Use the side warp tunnels to escape tight ghost pursuits!'
    ],
    controlsDescription: 'Swipe or tap D-Pad to steer Pac-Man'
  },
  {
    id: 'bubble',
    title: 'Bubble Shooter Arcade',
    tagline: 'Hex-grid tactical bubble popping frenzy',
    description: 'Aim, bank shots off walls, and burst match-3 bubble clusters across 30 progressive challenge stages.',
    category: 'puzzle',
    difficulty: 'Medium',
    iconName: 'Orbit',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.magenta,
    baseXp: 150,
    isNew: true,
    howToPlay: [
      'Touch and drag to align the laser trajectory guide.',
      'Bounce bubbles off the side walls to hit difficult angles.',
      'Match 3 or more bubbles of identical color to burst them.',
      'Drop detached ceiling clusters for massive avalanche score multipliers!'
    ],
    controlsDescription: 'Touch & drag to aim, release to launch bubble'
  },
  {
    id: 'galaxy',
    title: 'Galaxy Sky Shooting',
    tagline: 'Retro space shooter and bullet-hell warfare',
    description: 'Maneuver your neon starship through 30 intense sectors with 6 dreadnought boss flagships and weapon upgrades.',
    category: 'arcade',
    difficulty: 'Hard',
    iconName: 'Rocket',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.rose,
    baseXp: 180,
    isNew: true,
    howToPlay: [
      'Touch and drag anywhere to pilot your neon starship.',
      'Auto-fire blasters automatically engage incoming hostile squadrons.',
      'Collect glowing power-up capsules: Spread (P), Shield (S), Bomb (B), Laser (L).',
      'Deploy Smart Bombs to vaporize bullet-hell barrages during boss battles!'
    ],
    controlsDescription: '1:1 finger drag to steer, tap bomb button to clear screen'
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
