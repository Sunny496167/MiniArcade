import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { MemoryCard, CardData } from './components/MemoryCard';
import * as Icons from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';
import { GameLifecycleState, GameContextualStat } from '../../types/arcade';

const GAME_METADATA = GAMES_REGISTRY.find(g => g.id === 'memory')!;
const ICON_POOL: (keyof typeof Icons)[] = ['Zap', 'Flame', 'Shield', 'Activity', 'Cpu', 'Layers', 'Box', 'Key'];
const GRID_SIZE = 4;
const TOTAL_PAIRS = (GRID_SIZE * GRID_SIZE) / 2;

interface MemoryBoardProps {
  gameState: GameLifecycleState;
  triggerGameOver: (finalScore: number, won?: boolean, stats?: GameContextualStat[]) => void;
  cards: CardData[];
  matches: number;
  moves: number;
  handleCardPress: (index: number) => void;
}

const MemoryBoard: React.FC<MemoryBoardProps> = ({
  gameState,
  triggerGameOver,
  cards,
  matches,
  moves,
  handleCardPress,
}) => {
  useEffect(() => {
    if (gameState === 'PLAYING' && matches === TOTAL_PAIRS) {
      audioService.play('gameStart');
      const finalScore = Math.max(100, 1000 - (moves - TOTAL_PAIRS) * 50);
      
      setTimeout(() => {
        triggerGameOver(finalScore, true, [
          { label: 'Moves', value: moves },
          { label: 'Matches', value: matches }
        ]);
      }, 1000);
    }
  }, [matches, gameState, moves]);

  return (
    <View style={styles.boardContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MOVES</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MATCHES</Text>
          <Text style={[styles.statValue, { color: COLORS.cyan }]}>{matches}/{TOTAL_PAIRS}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            onPress={() => handleCardPress(index)}
            disabled={gameState !== 'PLAYING'}
            size={75}
          />
        ))}
      </View>
    </View>
  );
};

export function MemoryScreen() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const initGame = useCallback(() => {
    // Generate deck
    const deck: CardData[] = [];
    const selectedIcons = [...ICON_POOL].sort(() => 0.5 - Math.random()).slice(0, TOTAL_PAIRS);
    
    // Create pairs
    const pairs = [...selectedIcons, ...selectedIcons];
    
    // Shuffle
    const shuffled = pairs.sort(() => 0.5 - Math.random());
    
    shuffled.forEach((iconName, index) => {
      deck.push({
        id: index,
        iconName,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardPress = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    audioService.play('buttonPress');
    hapticsService.light();

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIdx, secondIdx] = newFlippedIndices;
      
      if (newCards[firstIdx].iconName === newCards[secondIdx].iconName) {
        // MATCH
        setTimeout(() => {
          audioService.play('win');
          hapticsService.success();
          
          setCards(prev => {
            const matched = [...prev];
            matched[firstIdx] = { ...matched[firstIdx], isMatched: true };
            matched[secondIdx] = { ...matched[secondIdx], isMatched: true };
            return matched;
          });
          
          setMatches(m => m + 1);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 300);
      } else {
        // NO MATCH
        setTimeout(() => {
          hapticsService.warning();
          setCards(prev => {
            const reset = [...prev];
            reset[firstIdx] = { ...reset[firstIdx], isFlipped: false };
            reset[secondIdx] = { ...reset[secondIdx], isFlipped: false };
            return reset;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <GameContainer
      game={GAME_METADATA}
      score={0}
      onResetGame={initGame}
    >
      {({ gameState, triggerGameOver }) => (
        <MemoryBoard
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          cards={cards}
          matches={matches}
          moves={moves}
          handleCardPress={handleCardPress}
        />
      )}
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 340,
    marginBottom: 32,
  },
  statBox: {
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    fontFamily: FONTS.display,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.mono,
    fontSize: 24,
    color: '#FFF',
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 340, // (75+8)*4 approx
    justifyContent: 'center',
  },
});
