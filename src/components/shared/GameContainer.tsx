import React, { useState, ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { GameMetadata, GameLifecycleState, GameContextualStat, GameResultData } from '../../types/arcade';
import { COLORS } from '../../constants/theme';
import { GameIntro } from './GameIntro';
import { GameCountdown } from './GameCountdown';
import { GameHUD } from './GameHUD';
import { GamePauseModal } from './GamePauseModal';
import { GameResult } from './GameResult';
import { useArcade } from '../../context/ArcadeContext';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameContainerProps {
  game: GameMetadata;
  score: number;
  lives?: number;
  timer?: number | string;
  moves?: number;
  combo?: number;
  onResetGame: () => void;
  children: (props: {
    gameState: GameLifecycleState;
    triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: GameContextualStat[]) => void;
    triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  }) => ReactNode;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  game,
  score,
  lives,
  timer,
  moves,
  combo,
  onResetGame,
  children,
}) => {
  const router = useRouter();
  const { stats, recordGameResult } = useArcade();

  const [lifecycle, setLifecycle] = useState<GameLifecycleState>('INTRO');
  const [resultData, setResultData] = useState<GameResultData>({
    score: 0,
    isNewBest: false,
    xpEarned: 0,
    stats: [],
  });

  const currentHighScore = stats[game.id]?.highScore || 0;

  // Screen shake logic
  const shakeX = useSharedValue(0);

  const triggerShake = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    const d = intensity === 'light' ? 5 : intensity === 'medium' ? 10 : 20;
    shakeX.value = withSequence(
      withTiming(-d, { duration: 40 }),
      withTiming(d, { duration: 40 }),
      withTiming(-d / 2, { duration: 40 }),
      withTiming(d / 2, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeX.value }],
    };
  });

  // Handle Play trigger from Intro
  const handleStartCountdown = () => {
    setLifecycle('COUNTDOWN');
  };

  // Countdown finished -> Start gameplay
  const handleCountdownFinish = () => {
    audioService.play('gameStart');
    setLifecycle('PLAYING');
  };

  // Pause
  const handlePause = () => {
    if (lifecycle === 'PLAYING') {
      setLifecycle('PAUSED');
    }
  };

  const handleResume = () => {
    setLifecycle('PLAYING');
  };

  const handleRestart = () => {
    onResetGame();
    setLifecycle('COUNTDOWN');
  };

  const handleExitToArcade = () => {
    router.replace('/(tabs)' as any);
  };

  // Trigger game over from child gameplay engine
  const triggerGameOver = async (
    finalScore: number,
    won: boolean = false,
    contextualStats: GameContextualStat[] = []
  ) => {
    if (lifecycle === 'RESULT') return;

    if (won) {
      audioService.play('win');
      hapticsService.success();
    } else {
      audioService.play('gameOver');
      hapticsService.heavy();
    }

    // Build dictionary of contextual stats for achievement checker
    const contextualMap: Record<string, any> = {};
    contextualStats.forEach((s) => {
      contextualMap[s.label] = s.value;
    });

    const res = await recordGameResult(
      game.id,
      finalScore,
      game.baseXp,
      won,
      contextualMap
    );

    setResultData({
      score: finalScore,
      isNewBest: res.isNewBest,
      xpEarned: res.earnedXp,
      stats: contextualStats,
    });

    setLifecycle('RESULT');
  };

  // Next game navigation
  const handleNextGame = () => {
    const currentIndex = GAMES_REGISTRY.findIndex((g) => g.id === game.id);
    const nextIndex = (currentIndex + 1) % GAMES_REGISTRY.length;
    const nextGame = GAMES_REGISTRY[nextIndex];
    router.replace(`/game/${nextGame.id}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      <View style={styles.container}>
        {/* State 1: Intro */}
        {lifecycle === 'INTRO' && (
          <Animated.View style={styles.fullSpace} entering={FadeIn.duration(400)}>
            <GameIntro
              game={game}
              onPlay={handleStartCountdown}
              onBack={() => router.back()}
            />
          </Animated.View>
        )}

        {/* State 2: Countdown */}
        {lifecycle === 'COUNTDOWN' && (
          <>
            <GameHUD
              score={0}
              highScore={currentHighScore}
              onPause={() => {}}
              lives={lives}
              timer={timer}
              moves={moves}
              combo={combo}
              accentColor={game.accentColor}
            />
            <Animated.View style={[styles.gameArea, shakeStyle]}>
              {children({ gameState: lifecycle, triggerGameOver, triggerShake })}
            </Animated.View>
            <GameCountdown onFinish={handleCountdownFinish} />
          </>
        )}

        {/* State 3: Playing */}
        {lifecycle === 'PLAYING' && (
          <>
            <GameHUD
              score={score}
              highScore={currentHighScore}
              onPause={handlePause}
              lives={lives}
              timer={timer}
              moves={moves}
              combo={combo}
              accentColor={game.accentColor}
            />
            <Animated.View style={[styles.gameArea, shakeStyle]}>
              {children({ gameState: lifecycle, triggerGameOver, triggerShake })}
            </Animated.View>
          </>
        )}

        {/* State 4: Paused */}
        {lifecycle === 'PAUSED' && (
          <>
            <GameHUD
              score={score}
              highScore={currentHighScore}
              onPause={() => {}}
              lives={lives}
              timer={timer}
              moves={moves}
              combo={combo}
              accentColor={game.accentColor}
            />
            <Animated.View style={[styles.gameArea, shakeStyle]}>
              {children({ gameState: lifecycle, triggerGameOver, triggerShake })}
            </Animated.View>
            <GamePauseModal
              visible={true}
              game={game}
              onResume={handleResume}
              onRestart={handleRestart}
              onExit={handleExitToArcade}
            />
          </>
        )}

        {/* State 5: Result */}
        {lifecycle === 'RESULT' && (
          <Animated.View style={styles.fullSpace} entering={FadeIn.duration(500)}>
            <GameResult
              game={game}
              score={resultData.score}
              isNewBest={resultData.isNewBest}
              xpEarned={resultData.xpEarned}
              stats={resultData.stats}
              onPlayAgain={handleRestart}
              onNextGame={handleNextGame}
              onBackToArcade={handleExitToArcade}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  fullSpace: {
    flex: 1,
  },
});
