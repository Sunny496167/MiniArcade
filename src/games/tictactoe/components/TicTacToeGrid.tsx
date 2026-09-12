import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CellValue } from '../types';
import { COLORS } from '../../../constants/theme';

interface TicTacToeGridProps {
  board: CellValue[];
  winningLine: number[] | null;
  onCellPress: (index: number) => void;
  disabled: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = Math.min(SCREEN_WIDTH - 48, 330);
const CELL_SIZE = (GRID_SIZE - 16) / 3;

export const TicTacToeGrid: React.FC<TicTacToeGridProps> = ({
  board,
  winningLine,
  onCellPress,
  disabled,
}) => {
  return (
    <View style={[styles.grid, { width: GRID_SIZE, height: GRID_SIZE }]}>
      {board.map((cell, idx) => {
        const isWinningCell = winningLine?.includes(idx);

        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.cell,
              { width: CELL_SIZE, height: CELL_SIZE },
              isWinningCell && styles.cellWinning,
            ]}
            onPress={() => onCellPress(idx)}
            disabled={disabled || cell !== null}
            activeOpacity={0.7}
          >
            {cell === 'X' && (
              <Text
                style={[
                  styles.symbolX,
                  isWinningCell && styles.winningSymbol,
                ]}
              >
                X
              </Text>
            )}
            {cell === 'O' && (
              <Text
                style={[
                  styles.symbolO,
                  isWinningCell && styles.winningSymbol,
                ]}
              >
                O
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#090D17',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    justifyContent: 'space-between',
    alignSelf: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cell: {
    backgroundColor: '#162238',
    borderRadius: 14,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cellWinning: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: COLORS.cyan,
  },
  symbolX: {
    color: COLORS.cyan,
    fontSize: 52,
    fontWeight: '900',
  },
  symbolO: {
    color: COLORS.magenta,
    fontSize: 52,
    fontWeight: '900',
  },
  winningSymbol: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
