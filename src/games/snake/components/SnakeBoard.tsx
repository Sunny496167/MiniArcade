import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Position, FoodItem } from '../types';
import { GRID_SIZE } from '../engine/snakeEngine';
import { COLORS } from '../../../constants/theme';

interface SnakeBoardProps {
  snake: Position[];
  food: FoodItem;
  bonusFood: FoodItem | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const CELL_SIZE = BOARD_SIZE / GRID_SIZE;

export const SnakeBoard: React.FC<SnakeBoardProps> = ({
  snake,
  food,
  bonusFood,
}) => {
  return (
    <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {/* Background Cyber Grid lines */}
      <View style={styles.gridOverlay} />

      {/* Snake Body Segments */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
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
              ]}
            />
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
});
