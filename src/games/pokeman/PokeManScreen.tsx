import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Grid } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { LevelProgressionModal } from '../../components/shared/LevelProgressionModal';
import { LevelSelectModal } from '../../components/shared/LevelSelectModal';
import { PacmanBoard } from './components/PacmanBoard';
import { PacmanDPad } from './components/PacmanDPad';
import {
  PacmanState,
  Direction,
} from './types';
import {
  createInitialPacmanState,
  updatePacman,
} from './engine/pacmanEngine';
import { getPacmanLevel, TOTAL_PACMAN_LEVELS } from './engine/levels';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';
import { progressionService } from '../../services/progressionService';

interface CampaignProgress {
  maxUnlockedLevel: number;
  stars: Record<number, number>;
  levelScores: Record<number, number>;
}

interface PacmanInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  state: PacmanState;
  setState: React.Dispatch<React.SetStateAction<PacmanState>>;
  stateRef: React.MutableRefObject<PacmanState>;
  currentLevel: number;
  handleDirInput: (dir: Direction) => void;
  handleLevelCompleted: () => void;
}

const PacmanGameInner: React.FC<PacmanInnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  stateRef,
  currentLevel,
  handleDirInput,
  handleLevelCompleted,
}) => {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const lastSoundTimeRef = useRef<number>(0);

  const lastSwipeTimeRef = useRef<number>(0);

  // Immediate Real-Time Swipe Gesture Detection
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      const { translationX: dx, translationY: dy } = e;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Trigger instantly when movement exceeds 12px
      if (Math.max(absX, absY) >= 12) {
        const now = Date.now();
        if (now - lastSwipeTimeRef.current > 120) {
          lastSwipeTimeRef.current = now;
          if (absX > absY) {
            handleDirInput(dx > 0 ? 'RIGHT' : 'LEFT');
          } else {
            handleDirInput(dy > 0 ? 'DOWN' : 'UP');
          }
        }
      }
    })
    .onEnd((e) => {
      const { translationX: dx, translationY: dy } = e;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) >= 10) {
        if (absX > absY) {
          handleDirInput(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          handleDirInput(dy > 0 ? 'DOWN' : 'UP');
        }
      }
    });

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTimeRef.current = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.06, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const current = stateRef.current;
      const {
        nextState,
        ateDot,
        ateEnergizer,
        ateGhost,
        ateFruit,
        pacmanDied,
        levelFinished,
      } = updatePacman(current, dt);

      if (ateDot) {
        if (now - lastSoundTimeRef.current > 180) {
          lastSoundTimeRef.current = now;
          audioService.play('buttonPress');
          hapticsService.light();
        }
      }

      if (ateEnergizer) {
        audioService.play('achievementUnlock');
        hapticsService.medium();
        triggerShake('light');
      }

      if (ateGhost) {
        audioService.play('pointScore');
        hapticsService.heavy();
        triggerShake('medium');
      }

      if (ateFruit) {
        audioService.play('pointScore');
        hapticsService.medium();
      }

      if (pacmanDied) {
        audioService.play('gameOver');
        hapticsService.heavy();
        triggerShake('heavy');
      }

      if (levelFinished) {
        setState(nextState);
        handleLevelCompleted();
        return;
      }

      if (nextState.isGameOver) {
        setState(nextState);
        audioService.play('gameOver');
        hapticsService.heavy();
        triggerGameOver(nextState.score, false, [
          { label: 'Maze Reached', value: nextState.currentLevel, isHighlight: true },
          { label: 'Final Score', value: nextState.score },
          { label: 'Dots Remaining', value: nextState.dotsRemaining },
        ]);
        return;
      }

      setState(nextState);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, triggerGameOver, triggerShake, handleLevelCompleted, setState, stateRef]);

  const levelData = getPacmanLevel(currentLevel);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.contentContainer}>
        {/* Level Info Banner */}
        <View style={styles.levelBanner}>
          <Text style={styles.levelTitle}>{levelData.name}</Text>
          <View style={styles.livesRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.lifeDot,
                  i < state.lives && styles.lifeDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Pac-Man Maze Board */}
        <PacmanBoard state={state} theme={levelData.theme} />

        {/* Arcade Cyber D-Pad Controls */}
        <PacmanDPad
          currentDir={state.pacmanDir}
          onPressDir={handleDirInput}
        />
      </View>
    </GestureDetector>
  );
};

export const PokeManScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'pokeman')!;

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>({
    maxUnlockedLevel: 1,
    stars: {},
    levelScores: {},
  });

  const [state, setState] = useState<PacmanState>(() => createInitialPacmanState(1));
  const stateRef = useRef(state);
  stateRef.current = state;

  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [levelSelectVisible, setLevelSelectVisible] = useState(false);
  const [levelCompletedData, setLevelCompletedData] = useState<{
    stars: number;
    score: number;
    isNewBest: boolean;
  }>({ stars: 3, score: 0, isNewBest: false });

  // Load campaign progress on mount
  useEffect(() => {
    progressionService.getCampaignProgress('pokeman').then((p) => {
      setCampaignProgress(p);
      if (p.maxUnlockedLevel > 1) {
        setCurrentLevel(p.maxUnlockedLevel);
        setState(createInitialPacmanState(p.maxUnlockedLevel));
      }
    });
  }, []);

  const handleStartLevel = useCallback((lvl: number) => {
    setCurrentLevel(lvl);
    setState(createInitialPacmanState(lvl));
  }, []);

  const handleLevelCompleted = useCallback(async () => {
    const currentScore = stateRef.current.score;
    const currentLives = stateRef.current.lives;
    const stars = currentLives === 3 ? 3 : currentLives === 2 ? 2 : 1;

    audioService.play('win');
    hapticsService.success();

    const updated = await progressionService.saveCampaignLevelResult(
      'pokeman',
      currentLevel,
      stars,
      currentScore
    );
    setCampaignProgress(updated);
    setLevelCompletedData({
      stars,
      score: currentScore,
      isNewBest: (updated.levelScores[currentLevel] || 0) === currentScore,
    });
    setLevelUpModalVisible(true);
  }, [currentLevel]);

  const handleNextLevel = () => {
    setLevelUpModalVisible(false);
    const nextLvl = Math.min(TOTAL_PACMAN_LEVELS, currentLevel + 1);
    setCurrentLevel(nextLvl);
    setState(createInitialPacmanState(nextLvl));
  };

  const handleDirInput = useCallback((dir: Direction) => {
    setState((prev) => ({
      ...prev,
      nextDir: dir,
      pacmanDir: prev.pacmanDir === 'NONE' ? dir : prev.pacmanDir,
    }));
  }, []);

  return (
    <GameContainer
      game={gameMetadata}
      score={state.score}
      lives={state.lives}
      onResetGame={() => setState(createInitialPacmanState(currentLevel))}
      settingsUI={
        <View style={styles.settingsRow}>
          <TouchableOpacity
            style={styles.levelSelectBtn}
            onPress={() => setLevelSelectVisible(true)}
          >
            <Grid size={16} color={COLORS.cyan} />
            <Text style={styles.levelSelectBtnText}>Level Select</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <>
          <PacmanGameInner
            gameState={gameState}
            triggerGameOver={triggerGameOver}
            triggerShake={triggerShake}
            state={state}
            setState={setState}
            stateRef={stateRef}
            currentLevel={currentLevel}
            handleDirInput={handleDirInput}
            handleLevelCompleted={handleLevelCompleted}
          />

          {/* Level Up Celebration Modal */}
          <LevelProgressionModal
            visible={levelUpModalVisible}
            currentLevel={currentLevel}
            nextLevel={Math.min(TOTAL_PACMAN_LEVELS, currentLevel + 1)}
            totalLevels={TOTAL_PACMAN_LEVELS}
            starsEarned={levelCompletedData.stars}
            score={levelCompletedData.score}
            xpEarned={150}
            nextLevelPreview={
              getPacmanLevel(Math.min(TOTAL_PACMAN_LEVELS, currentLevel + 1)).preview
            }
            onNextLevel={handleNextLevel}
            onReplayLevel={() => {
              setLevelUpModalVisible(false);
              handleStartLevel(currentLevel);
            }}
            onOpenLevelSelect={() => {
              setLevelUpModalVisible(false);
              setLevelSelectVisible(true);
            }}
          />

          {/* 30-Level Grid Selector */}
          <LevelSelectModal
            visible={levelSelectVisible}
            gameTitle="PAC-MAN"
            totalLevels={TOTAL_PACMAN_LEVELS}
            maxUnlockedLevel={campaignProgress.maxUnlockedLevel}
            currentLevel={currentLevel}
            levelStars={campaignProgress.stars}
            levelHighScores={campaignProgress.levelScores}
            onSelectLevel={(lvl) => {
              setLevelSelectVisible(false);
              handleStartLevel(lvl);
            }}
            onClose={() => setLevelSelectVisible(false)}
          />
        </>
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  levelBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  levelTitle: {
    color: COLORS.amber,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  lifeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#334155',
  },
  lifeDotActive: {
    backgroundColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  settingsRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  levelSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  levelSelectBtnText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
});
