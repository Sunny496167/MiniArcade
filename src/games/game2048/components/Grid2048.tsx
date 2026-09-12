import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BOARD_SIZE } from '../engine/game2048Engine';
import { COLORS } from '../../../constants/theme';

interface Grid2048Props {
  board: (number | null)[][];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CONTAINER_SIZE = Math.min(SCREEN_WIDTH - 32, 340);
const TILE_PADDING = 8;
const TILE_SIZE =
  (GRID_CONTAINER_SIZE - TILE_PADDING * (BOARD_SIZE + 1)) / BOARD_SIZE;

const TILE_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  2: { bg: '#1E293B', text: '#E2E8F0', glow: 'transparent' },
  4: { bg: '#334155', text: '#F8FAFC', glow: 'transparent' },
  8: { bg: '#0284C7', text: '#FFFFFF', glow: '#0284C7' },
  16: { bg: '#06B6D4', text: '#FFFFFF', glow: '#06B6D4' },
  32: { bg: '#10B981', text: '#FFFFFF', glow: '#10B981' },
  64: { bg: '#84CC16', text: '#0F172A', glow: '#84CC16' },
  128: { bg: '#F59E0B', text: '#0F172A', glow: '#F59E0B' },
  256: { bg: '#F97316', text: '#FFFFFF', glow: '#F97316' },
  512: { bg: '#EF4444', text: '#FFFFFF', glow: '#EF4444' },
  1024: { bg: '#EC4899', text: '#FFFFFF', glow: '#EC4899' },
  2048: { bg: '#8B5CF6', text: '#FFFFFF', glow: '#8B5CF6' },
  4096: { bg: '#00F0FF', text: '#0B0E14', glow: '#00F0FF' },
};

export const Grid2048: React.FC<Grid2048Props> = ({ board }) => {
  return (
    <View
      style={[
        styles.gridContainer,
        { width: GRID_CONTAINER_SIZE, height: GRID_CONTAINER_SIZE },
      ]}
    >
      {board.map((row, r) => (
        <View key={`row-${r}`} style={styles.gridRow}>
          {row.map((val, c) => {
            const tileStyle = val ? TILE_COLORS[val] || TILE_COLORS[4096] : null;

            return (
              <View
                key={`col-${r}-${c}`}
                style={[
                  styles.tileCell,
                  tileStyle && {
                    backgroundColor: tileStyle.bg,
                    shadowColor: tileStyle.glow,
                    shadowOpacity: tileStyle.glow !== 'transparent' ? 0.7 : 0,
                    shadowRadius: 10,
                    elevation: tileStyle.glow !== 'transparent' ? 5 : 0,
                  },
                ]}
              >
                {val !== null && (
                  <Text
                    style={[
                      styles.tileText,
                      { color: tileStyle?.text },
                      val >= 1000 && styles.tileTextSmall,
                    ]}
                  >
                    {val}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: '#0C121E',
    borderRadius: 16,
    padding: TILE_PADDING,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    justifyContent: 'space-between',
    alignSelf: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tileCell: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tileTextSmall: {
    fontSize: 16,
  },
});
