import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CellValue } from '../types';
import { COLORS } from '../../../constants/theme';

interface TicTacToeGridProps {
  board: CellValue[];
  winningLine: number[] | null;
  onCellPress: (index: number) => void;
  disabled: boolean;
}

interface GridCellProps {
  cell: CellValue;
  idx: number;
  isWinning: boolean;
  onPress: (idx: number) => void;
  disabled: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = Math.min(SCREEN_WIDTH - 40, 340);
const GAP = 8;
const CELL_SIZE = (GRID_SIZE - GAP * 2 - 24) / 3; // subtract padding too

const GridCell: React.FC<GridCellProps> = ({ cell, idx, isWinning, onPress, disabled }) => {
  const markScale = useSharedValue(0);
  const cellPulse = useSharedValue(1);

  useEffect(() => {
    if (cell !== null) {
      markScale.value = 0;
      markScale.value = withSpring(1, { damping: 11, stiffness: 220 });
    } else {
      markScale.value = 0;
    }
  }, [cell]);

  useEffect(() => {
    if (isWinning) {
      cellPulse.value = withRepeat(
        withSequence(
          withTiming(1.07, { duration: 360 }),
          withTiming(0.96, { duration: 360 })
        ),
        -1,
        true
      );
    } else {
      cellPulse.value = withTiming(1, { duration: 150 });
    }
  }, [isWinning]);

  const markAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markScale.value }],
  }));

  const cellAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cellPulse.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => onPress(idx)}
      disabled={disabled || cell !== null}
      activeOpacity={0.75}
    >
      <Animated.View
        style={[
          styles.cell,
          { width: CELL_SIZE, height: CELL_SIZE },
          isWinning && styles.cellWinning,
          cellAnimStyle,
        ]}
      >
        {cell !== null && (
          <Animated.View style={markAnimStyle}>
            <Text
              style={[
                cell === 'X' ? styles.symbolX : styles.symbolO,
                isWinning && styles.symbolWinning,
              ]}
            >
              {cell}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const ROWS = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

export const TicTacToeGrid: React.FC<TicTacToeGridProps> = ({
  board,
  winningLine,
  onCellPress,
  disabled,
}) => {
  return (
    <View style={[styles.grid, { width: GRID_SIZE }]}>
      {ROWS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          {row.map((idx) => (
            <GridCell
              key={idx}
              cell={board[idx]}
              idx={idx}
              isWinning={winningLine?.includes(idx) ?? false}
              onPress={onCellPress}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    backgroundColor: '#070C16',
    borderRadius: 24,
    padding: 12,
    gap: GAP,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    backgroundColor: '#162238',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cellWinning: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  symbolX: {
    color: COLORS.cyan,
    fontSize: CELL_SIZE * 0.5,
    fontWeight: '900',
  },
  symbolO: {
    color: COLORS.magenta,
    fontSize: CELL_SIZE * 0.5,
    fontWeight: '900',
  },
  symbolWinning: {
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
