import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { SimonPad, SimonColor } from './components/SimonPad';
import { COLORS, FONTS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

const GAME_METADATA = GAMES_REGISTRY.find(g => g.id === 'simon')!;
const COLORS_ARRAY: SimonColor[] = ['cyan', 'magenta', 'lime', 'amber'];
const PAD_SIZE = 140;

type GamePhase = 'IDLE' | 'PLAYBACK' | 'INPUT' | 'GAMEOVER';

export function SimonScreen() {
  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState<SimonColor | null>(null);
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  
  // Track timers so we can clear them if unmounted/paused
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRefs.current.push(t);
    return t;
  };

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const startNextRound = (currentSeq: SimonColor[]) => {
    const newColor = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)];
    const newSeq = [...currentSeq, newColor];
    setSequence(newSeq);
    setPlayerIndex(0);
    setPhase('PLAYBACK');
  };

  const initGame = useCallback(() => {
    clearTimers();
    setActivePad(null);
    startNextRound([]);
  }, [clearTimers]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle Playback
  useEffect(() => {
    if (phase === 'PLAYBACK' && sequence.length > 0) {
      clearTimers();
      let delay = 500; // Initial pause before playing
      
      sequence.forEach((color, i) => {
        // Turn pad on
        addTimer(() => {
          setActivePad(color);
          audioService.play('buttonPress'); // Replace with specific tone if available
        }, delay);

        delay += 400; // How long it stays on

        // Turn pad off
        addTimer(() => {
          setActivePad(null);
        }, delay);

        delay += 200; // Gap between flashes
      });

      // Switch to INPUT phase
      addTimer(() => {
        setPhase('INPUT');
      }, delay);
    }
  }, [phase, sequence]);

  return (
    <GameContainer
      game={GAME_METADATA}
      score={Math.max(0, sequence.length - 1)}
      onResetGame={initGame}
    >
      {({ gameState, triggerGameOver }) => {
        
        const handlePadPress = (color: SimonColor) => {
          if (phase !== 'INPUT' || gameState !== 'PLAYING') return;

          const expectedColor = sequence[playerIndex];
          
          if (color === expectedColor) {
            // Correct input
            audioService.play('buttonPress');
            
            if (playerIndex === sequence.length - 1) {
              // Round complete!
              setPhase('IDLE');
              audioService.play('win');
              addTimer(() => {
                startNextRound(sequence);
              }, 800);
            } else {
              // Wait for next input
              setPlayerIndex(playerIndex + 1);
            }
          } else {
            // Wrong input -> Game Over
            setPhase('GAMEOVER');
            hapticsService.heavy();
            audioService.play('gameOver');
            
            // Score = sequence length - 1
            const score = Math.max(0, sequence.length - 1);
            // 150 base XP + 50 for every 3 sequences
            triggerGameOver(score, false, [{ label: 'Sequence Length', value: score }]);
          }
        };

        return (
          <View style={styles.boardContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SEQUENCE</Text>
                <Text style={styles.statValue}>
                  {phase === 'IDLE' && sequence.length === 0 ? 0 : sequence.length}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>STATUS</Text>
                <Text style={[styles.statValue, { color: phase === 'PLAYBACK' ? COLORS.amber : COLORS.cyan }]}>
                  {phase === 'PLAYBACK' ? 'WATCH' : phase === 'INPUT' ? 'REPEAT' : '---'}
                </Text>
              </View>
            </View>

            <View style={styles.grid}>
              {COLORS_ARRAY.map((color) => (
                <SimonPad
                  key={color}
                  color={color}
                  size={PAD_SIZE}
                  isActive={activePad === color}
                  onPress={() => handlePadPress(color)}
                  disabled={gameState !== 'PLAYING' || phase !== 'INPUT'}
                />
              ))}
            </View>
          </View>
        );
      }}
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
    maxWidth: 320,
    marginBottom: 40,
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
    width: PAD_SIZE * 2 + 40,
    justifyContent: 'center',
  },
});
