import { BubbleLevel, BubbleColor } from '../types';

export const TOTAL_BUBBLE_LEVELS = 30;
export const GRID_COLS = 8;
export const GRID_ROWS = 12;

function generateLevelGrid(
  level: number,
  activeColors: BubbleColor[],
  numRows: number,
  specialChance: number = 0.1
): (BubbleColor | null)[][] {
  const grid: (BubbleColor | null)[][] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowCols = r % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
    const row: (BubbleColor | null)[] = [];

    if (r < numRows) {
      // Create clusters of 2-3 matching colors
      let currentColor = activeColors[Math.floor(Math.random() * activeColors.length)];
      for (let c = 0; c < rowCols; c++) {
        if (Math.random() < 0.35) {
          currentColor = activeColors[Math.floor(Math.random() * activeColors.length)];
        }

        // Specials
        if (Math.random() < specialChance && level >= 5) {
          const specials: BubbleColor[] = ['bomb', 'rainbow'];
          if (level >= 15) specials.push('metal', 'lightning');
          row.push(specials[Math.floor(Math.random() * specials.length)]);
        } else {
          row.push(currentColor);
        }
      }
    } else {
      for (let c = 0; c < rowCols; c++) {
        row.push(null);
      }
    }
    grid.push(row);
  }

  return grid;
}

export const BUBBLE_LEVELS: BubbleLevel[] = [
  {
    level: 1,
    name: 'Neon Initiation',
    totalShots: 30,
    availableColors: ['cyan', 'magenta', 'amber'],
    preview: 'Learn aiming and popping basic 3-color clusters.',
    grid: generateLevelGrid(1, ['cyan', 'magenta', 'amber'], 4, 0),
  },
  {
    level: 2,
    name: 'Triad Cascade',
    totalShots: 28,
    availableColors: ['cyan', 'magenta', 'amber'],
    preview: 'Pop anchors to cause falling avalanche drops!',
    grid: generateLevelGrid(2, ['cyan', 'magenta', 'amber'], 5, 0),
  },
  {
    level: 3,
    name: 'Prism Lattice',
    totalShots: 28,
    availableColors: ['cyan', 'magenta', 'amber'],
    preview: 'Bank shots off the side walls to reach trapped nodes.',
    grid: generateLevelGrid(3, ['cyan', 'magenta', 'amber'], 5, 0),
  },
  {
    level: 4,
    name: 'Emerald Entry',
    totalShots: 26,
    availableColors: ['cyan', 'magenta', 'amber', 'lime'],
    preview: '4th color unlocked: Acid Lime!',
    grid: generateLevelGrid(4, ['cyan', 'magenta', 'amber', 'lime'], 5, 0),
  },
  {
    level: 5,
    name: 'Bomb Synthesis',
    totalShots: 26,
    availableColors: ['cyan', 'magenta', 'amber', 'lime'],
    preview: 'SPECIAL BUBBLE: Bomb! Detonates 360 surrounding tiles.',
    grid: generateLevelGrid(5, ['cyan', 'magenta', 'amber', 'lime'], 6, 0.12),
  },
  // Levels 6 to 15
  ...Array.from({ length: 10 }, (_, i) => {
    const lvl = 6 + i;
    const colors: BubbleColor[] =
      lvl >= 11
        ? ['cyan', 'magenta', 'amber', 'lime', 'purple']
        : ['cyan', 'magenta', 'amber', 'lime'];
    const names = [
      'Hex Matrix',
      'Rainbow Core',
      'Ceiling Tremor',
      'Vortex Swarm',
      'Crystal Lattice',
      'Purple Nebula',
      'Steel Anchor',
      'Chain Reaction',
      'Quantum Split',
      'Apex Horizon',
    ];
    return {
      level: lvl,
      name: names[i] || `Level ${lvl}`,
      totalShots: Math.max(22, 28 - Math.floor(lvl / 3)),
      availableColors: colors,
      preview:
        lvl === 7
          ? 'Rainbow Bubble matches any color!'
          : lvl === 12
          ? 'Metal bubbles cannot be popped directly; drop their anchors!'
          : `Match-3 tactical defense with ${colors.length} colors.`,
      grid: generateLevelGrid(lvl, colors, 5 + Math.floor(lvl / 6), 0.14),
    };
  }),
  // Levels 16 to 30
  ...Array.from({ length: 15 }, (_, i) => {
    const lvl = 16 + i;
    const colors: BubbleColor[] =
      lvl >= 22
        ? ['cyan', 'magenta', 'amber', 'lime', 'purple', 'rose']
        : ['cyan', 'magenta', 'amber', 'lime', 'purple'];
    const names = [
      'Lightning Conduit',
      'Gravity Well',
      'Steel Barrier',
      'Prism Core',
      'Plasma Web',
      'Void Labyrinth',
      'Solar Vortex',
      'Supernova Vault',
      'Chrono Nexus',
      'Singularity Gate',
      'Hyper Density',
      'Infinity Grid',
      'Cosmic Spiral',
      'Dimensional Shift',
      'The Celestial Core (FINAL)',
    ];
    return {
      level: lvl,
      name: names[i] || `Sector ${lvl}`,
      totalShots: Math.max(18, 26 - Math.floor(lvl / 3)),
      availableColors: colors,
      preview:
        lvl === 30
          ? 'FINAL LEVEL: Clear the dense celestial bubble core in 20 shots!'
          : lvl === 16
          ? 'Lightning Bubble clears entire horizontal row!'
          : `Level ${lvl}: High density formation, tight ammo budget!`,
      grid: generateLevelGrid(lvl, colors, 6 + Math.floor(lvl / 10), 0.16),
    };
  }),
];

export const getBubbleLevel = (levelNum: number): BubbleLevel => {
  const clamped = Math.max(1, Math.min(TOTAL_BUBBLE_LEVELS, levelNum));
  return BUBBLE_LEVELS[clamped - 1] || BUBBLE_LEVELS[0];
};
