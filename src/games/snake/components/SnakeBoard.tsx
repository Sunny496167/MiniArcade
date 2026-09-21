import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Position, FoodItem, BorderMode, Direction, SnakePalette } from '../types';
import { GRID_SIZE } from '../engine/snakeEngine';
import { COLORS } from '../../../constants/theme';

interface SnakeBoardProps {
  snake: Position[];
  food: FoodItem;
  bonusFood: FoodItem | null;
  borderMode?: BorderMode;
  direction?: Direction;
  palette?: SnakePalette;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const CELL_SIZE = BOARD_SIZE / GRID_SIZE;

export const SnakeBoard: React.FC<SnakeBoardProps> = ({
  snake,
  food,
  bonusFood,
  borderMode = 'full',
  direction = 'UP',
  palette,
}) => {
  const getAdjacency = (current: Position, other?: Position) => {
    if (!other) return null;
    if (other.x === current.x) {
      if (other.y === current.y - 1 || (other.y === GRID_SIZE - 1 && current.y === 0)) return 'top';
      if (other.y === current.y + 1 || (other.y === 0 && current.y === GRID_SIZE - 1)) return 'bottom';
    }
    if (other.y === current.y) {
      if (other.x === current.x - 1 || (other.x === GRID_SIZE - 1 && current.x === 0)) return 'left';
      if (other.x === current.x + 1 || (other.x === 0 && current.x === GRID_SIZE - 1)) return 'right';
    }
    return null;
  };

  const getBorderStyle = () => {
    switch (borderMode) {
      case 'none':
        return { borderColor: 'rgba(16, 185, 129, 0.1)', borderStyle: 'dashed' as const };
      case 'mixed':
        return { 
          borderLeftColor: 'rgba(239, 68, 68, 0.5)', 
          borderRightColor: 'rgba(239, 68, 68, 0.5)',
          borderTopColor: 'rgba(16, 185, 129, 0.1)',
          borderBottomColor: 'rgba(16, 185, 129, 0.1)',
          borderTopStyle: 'dashed' as const,
          borderBottomStyle: 'dashed' as const,
        };
      case 'full':
      default:
        return { borderColor: 'rgba(239, 68, 68, 0.5)' }; // Reddish for deadly walls
    }
  };

  return (
    <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }, getBorderStyle()]}>
      {/* Background Cyber Grid lines */}
      <View style={styles.gridOverlay} />

      {/* Snake Body Segments */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const prev = snake[index - 1];
        const next = snake[index + 1];

        const adjPrev = getAdjacency(segment, prev);
        const adjNext = getAdjacency(segment, next);

        const sides = [adjPrev, adjNext].filter(Boolean);
        let radii = {
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
        };

        if (sides.includes('top')) {
          radii.borderTopLeftRadius = 0;
          radii.borderTopRightRadius = 0;
        }
        if (sides.includes('bottom')) {
          radii.borderBottomLeftRadius = 0;
          radii.borderBottomRightRadius = 0;
        }
        if (sides.includes('left')) {
          radii.borderTopLeftRadius = 0;
          radii.borderBottomLeftRadius = 0;
        }
        if (sides.includes('right')) {
          radii.borderTopRightRadius = 0;
          radii.borderBottomRightRadius = 0;
        }

        // Taper the body towards the tail
        const scaleFactor = snake.length > 2 
          ? 1 - (index / (snake.length - 1)) * 0.45 
          : 1;

        return (
          <View
            key={`snake-${index}`}
            style={[
              styles.cell,
              {
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
          >
            <View
              style={[
                styles.segmentInner,
                isHead ? styles.snakeHead : styles.snakeBody,
                isHead && palette ? { backgroundColor: palette.headColor, shadowColor: palette.glowColor } : null,
                !isHead && palette ? { backgroundColor: palette.bodyColor } : null,
                radii,
                { transform: [{ scale: scaleFactor }] }
              ]}
            >
              {isHead && (
                <View style={[styles.eyesContainer, styles[`eyes${direction}` as keyof typeof styles]]}>
                  <View style={[styles.eye, palette?.eyeColor ? { backgroundColor: palette.eyeColor } : null]} />
                  <View style={[styles.eye, palette?.eyeColor ? { backgroundColor: palette.eyeColor } : null]} />
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Regular Food Node */}
      <View
        style={[
          styles.cell,
          {
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          },
        ]}
      >
        <View style={styles.foodDot} />
      </View>

      {/* Bonus Food Node */}
      {bonusFood && (
        <View
          style={[
            styles.cell,
            {
              left: bonusFood.x * CELL_SIZE,
              top: bonusFood.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            },
          ]}
        >
          <View style={styles.bonusDot} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#070B12',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: COLORS.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  segmentInner: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  snakeHead: {
    backgroundColor: '#00F0FF',
    borderRadius: 6,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  snakeBody: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    opacity: 0.9,
  },
  foodDot: {
    width: '75%',
    height: '75%',
    borderRadius: 10,
    backgroundColor: '#FF007A',
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  bonusDot: {
    width: '85%',
    height: '85%',
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  eyesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    padding: 2,
  },
  eyesUP: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eyesDOWN: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  eyesLEFT: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  eyesRIGHT: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  eye: {
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
