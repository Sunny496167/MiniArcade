import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { COLORS, FONTS, SHADOWS } from '../src/constants/theme';
import { useArcade } from '../src/context/ArcadeContext';
import { hapticsService } from '../src/services/hapticsService';
import { audioService } from '../src/services/audioService';

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, completeOnboarding, isLoading } = useArcade();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');

  if (isLoading) {
    return null;
  }

  const hasName = Boolean(profile.username && profile.username.trim().length >= 3);
  if (profile.hasOnboarded && hasName) {
    return <Redirect href="/" />;
  }
  
  // Animation values for the logo pulse
  const logoScale = useSharedValue(1);

  useEffect(() => {
    // Pulse animation for the logo
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const handleGetStarted = () => {
    hapticsService.light();
    setStep(2);
  };

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const handleContinue = async () => {
    if (username.trim().length < 3) {
      hapticsService.error();
      return;
    }
    
    hapticsService.success();
    audioService.play('gameStart');
    
    await completeOnboarding(username.trim());
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {step === 1 && (
            <Animated.View
              entering={FadeIn.duration(1000)}
              exiting={FadeOut.duration(500)}
              style={styles.welcomeContainer}
            >
              <Animated.View style={[styles.iconContainer, animatedLogoStyle, SHADOWS.glowCyan]}>
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.appIcon}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.title}>Mini Arcade</Text>
              <Text style={styles.subtitle}>Welcome to the next level.</Text>
              
              <TouchableOpacity
                style={[styles.button, SHADOWS.glowCyan, styles.getStartedButton]}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00F0FF', '#3B82F6']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <ArrowRight size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              entering={SlideInDown.duration(800).springify()}
              style={styles.inputContainer}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Create Profile</Text>
                <Text style={styles.headerSubtitle}>Choose your arcade tag to begin.</Text>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Username"
                  placeholderTextColor={COLORS.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  maxLength={16}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
                <View style={styles.characterCount}>
                  <Text style={[styles.countText, username.length < 3 && username.length > 0 ? { color: COLORS.rose } : null]}>
                    {username.length}/16
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  username.trim().length >= 3 ? SHADOWS.glowCyan : styles.buttonDisabled
                ]}
                disabled={username.trim().length < 3}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={username.trim().length >= 3 ? ['#00F0FF', '#3B82F6'] : [COLORS.bgElevated, COLORS.bgElevated]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.buttonText, username.trim().length < 3 && styles.buttonTextDisabled]}>
                    Start Playing
                  </Text>
                  <ArrowRight size={20} color={username.trim().length >= 3 ? '#FFF' : COLORS.textMuted} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  appIcon: {
    width: 96,
    height: 96,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  getStartedButton: {
    width: '100%',
    maxWidth: 280,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    marginBottom: 32,
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    fontSize: 18,
    padding: 16,
    paddingRight: 60,
  },
  characterCount: {
    position: 'absolute',
    right: 16,
    top: 16,
    justifyContent: 'center',
  },
  countText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: COLORS.textMuted,
  },
});
