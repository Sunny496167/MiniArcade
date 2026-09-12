import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Flag, Bomb } from 'lucide-react-native';
import { Cell } from '../types';
import { COLORS } from '../../../constants/theme';

interface MinesweeperGridProps {
  grid: Cell[][];
  onCellPress: (r: number, c: number) => void;
  onCellLongPress: (r: number, c: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = Math.min(SCREEN_WIDTH - 32, 350);

const NUMBER_COLORS: Record<number, string> = {
  1: COLORS.cyan,
  2: COLORS.lime,
  3: COLORS.rose,
  4: COLORS.purple,
  5: COLORS.amber,
  6: '#06B6D4',
  7: '#E11D48',
  8: '#F43F5E',
};

export const MinesweeperGrid: React.FC<MinesweeperGridProps> = ({
  grid,
  onCellPress,
  onCellLongPress,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 9;
  const cellSize = (GRID_SIZE - (cols + 1) * 2) / cols;

  return (
    <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}>
      {grid.map((row, r) => (
        <View key={`row-${r}`} style={styles.gridRow}>
          {row.map((cell, c) => {
            return (
              <TouchableOpacity
                key={`col-${r}-${c}`}
                activeOpacity={0.7}
                onPress={() => onCellPress(r, c)}
                onLongPress={() => onCellLongPress(r, c)}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  cell.isRevealed
                    ? cell.isMine
                      ? styles.cellMine
                      : styles.cellRevealed
                    : styles.cellHidden,
                ]}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb size={cellSize * 0.55} color="#FFFFFF" />
                  ) : cell.neighborMines > 0 ? (
                    <Text
                      style={[
                        styles.numberText,
                        {
                          color: NUMBER_COLORS[cell.neighborMines] || COLORS.textPrimary,
                          fontSize: cellSize * 0.45,
                        },
                      ]}
                    >
                      {cell.neighborMines}
                    </Text>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag size={cellSize * 0.5} color={COLORS.amber} fill={COLORS.amber} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: '#090D17',
    borderRadius: 16,
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    justifyContent: 'space-between',
    alignSelf: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  cellHidden: {
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cellRevealed: {
    backgroundColor: '#0C121E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  cellMine: {
    backgroundColor: COLORS.rose,
  },
  numberText: {
    fontWeight: '900',
  },
});
