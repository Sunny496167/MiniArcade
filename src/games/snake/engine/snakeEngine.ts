import { Direction, Position, FoodItem, SnakeState, BorderMode } from '../types';

export const GRID_SIZE = 18;
export const INITIAL_SPEED = 140;
export const MIN_SPEED = 70;

export const createInitialSnakeState = (borderMode: BorderMode = 'full', initialSpeed: number = INITIAL_SPEED): SnakeState => {
  const initialSnake: Position[] = [
    { x: 9, y: 9 },
    { x: 9, y: 10 },
    { x: 9, y: 11 },
  ];

  return {
    snake: initialSnake,
    direction: 'UP',
    nextDirection: 'UP',
    food: generateFood(initialSnake),
    bonusFood: null,
    score: 0,
    applesEaten: 0,
    bonusEaten: 0,
    isGameOver: false,
    speed: initialSpeed,
    borderMode,
  };
};

export function generateFood(snake: Position[], isBonus: boolean = false): FoodItem {
  let newPos: Position;
  let attempts = 0;
  do {
    newPos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (
    attempts < 200 &&
    snake.some((segment) => segment.x === newPos.x && segment.y === newPos.y)
  );

  return {
    ...newPos,
    isBonus,
    points: isBonus ? 50 : 10,
  };
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  if (current === 'UP' && next === 'DOWN') return false;
  if (current === 'DOWN' && next === 'UP') return false;
  if (current === 'LEFT' && next === 'RIGHT') return false;
  if (current === 'RIGHT' && next === 'LEFT') return false;
  return true;
}

export function stepSnake(
  state: SnakeState
): {
  nextState: SnakeState;
  ateNormalFood: boolean;
  ateBonusFood: boolean;
  hitWallOrSelf: boolean;
} {
  if (state.isGameOver) {
    return {
      nextState: state,
      ateNormalFood: false,
      ateBonusFood: false,
      hitWallOrSelf: false,
    };
  }

  const direction = state.nextDirection;
  const head = state.snake[0];
  const newHead: Position = { ...head };

  switch (direction) {
    case 'UP':
      newHead.y -= 1;
      break;
    case 'DOWN':
      newHead.y += 1;
      break;
    case 'LEFT':
      newHead.x -= 1;
      break;
    case 'RIGHT':
      newHead.x += 1;
      break;
  }

  // Handle Border Wrap or Collision
  const isOutOfBoundsX = newHead.x < 0 || newHead.x >= GRID_SIZE;
  const isOutOfBoundsY = newHead.y < 0 || newHead.y >= GRID_SIZE;

  if (isOutOfBoundsX || isOutOfBoundsY) {
    let hitWall = false;

    if (state.borderMode === 'full') {
      hitWall = true;
    } else if (state.borderMode === 'mixed') {
      if (isOutOfBoundsX) {
        hitWall = true;
      } else {
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        else if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }
    } else if (state.borderMode === 'none') {
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      else if (newHead.x >= GRID_SIZE) newHead.x = 0;
      
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      else if (newHead.y >= GRID_SIZE) newHead.y = 0;
    }

    if (hitWall) {
      return {
        nextState: { ...state, isGameOver: true },
        ateNormalFood: false,
        ateBonusFood: false,
        hitWallOrSelf: true,
      };
    }
  }

  // Check Self Collision (except the tail which will move away unless growing)
  const hitsSelf = state.snake.slice(0, -1).some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y
  );
  if (hitsSelf) {
    return {
      nextState: { ...state, isGameOver: true },
      ateNormalFood: false,
      ateBonusFood: false,
      hitWallOrSelf: true,
    };
  }

  const newSnake = [newHead, ...state.snake];
  let ateNormalFood = false;
  let ateBonusFood = false;
  let newScore = state.score;
  let newApplesEaten = state.applesEaten;
  let newBonusEaten = state.bonusEaten;
  let newFood = state.food;
  let newBonusFood = state.bonusFood;

  // Check normal food
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    ateNormalFood = true;
    newScore += state.food.points;
    newApplesEaten += 1;
    newFood = generateFood(newSnake);

    // Occasional bonus food spawn (every 5 apples if no bonus currently exists)
    if (newApplesEaten % 5 === 0 && !newBonusFood) {
      newBonusFood = generateFood([...newSnake, newFood], true);
    }
  } else if (
    newBonusFood &&
    newHead.x === newBonusFood.x &&
    newHead.y === newBonusFood.y
  ) {
    ateBonusFood = true;
    newScore += newBonusFood.points;
    newBonusEaten += 1;
    newBonusFood = null;
  } else {
    // Normal movement: pop tail
    newSnake.pop();
  }

  // Dynamic speed formula
  const newSpeed = Math.max(
    MIN_SPEED,
    INITIAL_SPEED - Math.floor(newApplesEaten / 3) * 6
  );

  return {
    nextState: {
      ...state,
      snake: newSnake,
      direction,
      food: newFood,
      bonusFood: newBonusFood,
      score: newScore,
      applesEaten: newApplesEaten,
      bonusEaten: newBonusEaten,
      speed: newSpeed,
      isGameOver: false,
    },
    ateNormalFood,
    ateBonusFood,
    hitWallOrSelf: false,
  };
}
