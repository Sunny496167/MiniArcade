import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GAMES_REGISTRY } from '../../src/constants/gamesRegistry';
import { SnakeScreen } from '../../src/games/snake/SnakeScreen';
import { BreakoutScreen } from '../../src/games/breakout/BreakoutScreen';
import { Game2048Screen } from '../../src/games/game2048/Game2048Screen';
import { MinesweeperScreen } from '../../src/games/minesweeper/MinesweeperScreen';
import { SpeedReflexScreen } from '../../src/games/reaction/SpeedReflexScreen';
import { TicTacToeScreen } from '../../src/games/tictactoe/TicTacToeScreen';
import { COLORS } from '../../src/constants/theme';

export default function GameHostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const game = GAMES_REGISTRY.find((g) => g.id === id);

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game Not Found</Text>
      </View>
    );
  }

  switch (game.id) {
    case 'snake':
      return <SnakeScreen />;
    case 'breakout':
      return <BreakoutScreen />;
    case 'game2048':
      return <Game2048Screen />;
    case 'minesweeper':
      return <MinesweeperScreen />;
    case 'reaction':
      return <SpeedReflexScreen />;
    case 'tictactoe':
      return <TicTacToeScreen />;
    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game Engine Inactive</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 18,
    fontWeight: '800',
  },
});
