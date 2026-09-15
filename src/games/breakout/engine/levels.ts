import { Brick } from '../types';

// Constants for layout
const COLS = 8;
const BRICK_WIDTH = (320 - (COLS + 1) * 4) / COLS; // Approx width for CANVAS_WIDTH=320
const BRICK_HEIGHT = 20;
const PADDING = 4;
const START_Y = 50;

// Patterns defined with abstract numbers 0-6
// 0=Empty, 1=Standard, 2=Hard, 3=Titanium, 4=Unbreakable, 5=Explosive, 6=Surprise
const STAGE_PATTERNS = [
  // Stage 1: Basic
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],
  // Stage 2: Fortified
  [
    [2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1],
    [6,1,0,0,0,0,1,6],
    [1,1,1,1,1,1,1,1],
  ],
  // Stage 3: Danger Zone
  [
    [1,1,5,1,1,5,1,1],
    [1,2,2,1,1,2,2,1],
    [1,1,1,1,1,1,1,1],
    [0,4,4,0,0,4,4,0],
    [1,1,1,1,1,1,1,1],
  ],
  // Stage 4: Checkerboard
  [
    [1,2,1,2,1,2,1,2],
    [2,1,2,1,2,1,2,1],
    [1,2,1,2,1,2,1,2],
    [2,1,2,1,2,1,2,1],
    [6,0,5,0,0,5,0,6],
  ],
  // Stage 5: Diamond
  [
    [0,0,0,4,4,0,0,0],
    [0,0,1,3,3,1,0,0],
    [0,1,2,2,2,2,1,0],
    [1,2,2,5,5,2,2,1],
    [0,1,2,2,2,2,1,0],
    [0,0,1,3,3,1,0,0],
    [0,0,0,6,6,0,0,0],
  ],
  // Stage 6: The Wall
  [
    [3,3,3,3,3,3,3,3],
    [4,4,4,0,0,4,4,4],
    [2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1],
    [0,6,0,0,0,0,6,0],
  ],
  // Stage 7: Spaced Out
  [
    [1,0,2,0,2,0,1,0],
    [0,3,0,1,0,3,0,1],
    [5,0,2,0,2,0,5,0],
    [0,3,0,1,0,3,0,1],
    [1,0,2,0,2,0,1,0],
  ],
  // Stage 8: V-Formation
  [
    [3,0,0,0,0,0,0,3],
    [0,2,0,0,0,0,2,0],
    [0,0,1,0,0,1,0,0],
    [0,0,0,6,6,0,0,0],
    [0,0,1,0,0,1,0,0],
    [5,2,0,0,0,0,2,5],
  ],
  // Stage 9: Impossible Box
  [
    [4,4,4,4,4,4,4,4],
    [4,3,3,3,3,3,3,4],
    [4,3,6,5,5,6,3,4],
    [4,3,3,3,3,3,3,4],
    [4,4,0,0,0,0,4,4],
    [1,1,1,1,1,1,1,1],
  ],
  // Stage 10: Final Boss
  [
    [3,3,3,3,3,3,3,3],
    [3,5,3,5,3,5,3,3],
    [4,0,4,0,4,0,4,0],
    [2,2,2,2,2,2,2,2],
    [6,2,6,2,6,2,6,2],
    [1,1,1,1,1,1,1,1],
    [5,0,0,0,0,0,0,5],
  ],
];

const getBrickColor = (type: number): string => {
  switch (type) {
    case 1: return '#00F0FF'; // Cyan
    case 2: return '#9D4EDD'; // Purple
    case 3: return '#F59E0B'; // Orange
    case 4: return '#4B5563'; // Grey (Unbreakable)
    case 5: return '#EF4444'; // Red (Explosive)
    case 6: return '#FCD34D'; // Gold (Surprise)
    default: return '#FFF';
  }
};

const getBrickHP = (type: number): number => {
  switch (type) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return 9999;
    case 5: return 1;
    case 6: return 1;
    default: return 1;
  }
};

const getBrickPoints = (type: number): number => {
  switch (type) {
    case 1: return 10;
    case 2: return 25;
    case 3: return 50;
    case 4: return 0;
    case 5: return 20;
    case 6: return 100;
    default: return 10;
  }
};

export const loadStage = (difficulty: 'Novice' | 'Advanced' | 'Expert', stage: number): Brick[] => {
  // Wrap stage index if > 10 (or just cap it)
  const patternIndex = (stage - 1) % STAGE_PATTERNS.length;
  const pattern = STAGE_PATTERNS[patternIndex];
  
  const bricks: Brick[] = [];
  
  pattern.forEach((row, rowIndex) => {
    row.forEach((baseType, colIndex) => {
      if (baseType === 0) return;
      
      let finalType = baseType;
      
      // Upgrade bricks based on difficulty
      if (difficulty === 'Advanced') {
        if (baseType === 1 && Math.random() > 0.5) finalType = 2; // Some normal become hard
        if (baseType === 2 && Math.random() > 0.8) finalType = 3; 
      } else if (difficulty === 'Expert') {
        if (baseType === 1) finalType = 2; // All normal become hard
        if (baseType === 2) finalType = 3; // All hard become titanium
      }

      const x = PADDING + colIndex * (BRICK_WIDTH + PADDING);
      const y = START_Y + rowIndex * (BRICK_HEIGHT + PADDING);

      bricks.push({
        id: `brick-${stage}-${rowIndex}-${colIndex}`,
        x,
        y,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: getBrickColor(finalType),
        points: getBrickPoints(finalType),
        alive: true,
        type: finalType,
        hp: getBrickHP(finalType),
      });
    });
  });

  return bricks;
};
