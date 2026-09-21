import 'react-native-gesture-handler';
import React, { useEffect, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ArcadeProvider, useArcade } from '../src/context/ArcadeContext';
import { AchievementModal } from '../src/components/shared/AchievementModal';
import { LevelUpModal } from '../src/components/shared/LevelUpModal';
import { COLORS } from '../src/constants/theme';

// Prevent the splash screen from auto-hiding before the app is ready.
// Must be called synchronously at module scope before any async work.
SplashScreen.preventAutoHideAsync();

/**
 * Inner component that gates splash dismissal on context bootstrap completing.
 * Must be mounted inside ArcadeProvider so it can read isLoading.
 */
function AppReady({ children }: { children: ReactNode }) {
  const { isLoading } = useArcade();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <SafeAreaProvider>
        <ArcadeProvider>
          <AppReady>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.bgPrimary },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{
                  headerShown: false,
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="game/[id]"
                options={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
            <AchievementModal />
            <LevelUpModal />
          </AppReady>
        </ArcadeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
