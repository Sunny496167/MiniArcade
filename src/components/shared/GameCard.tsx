import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Sparkles, Zap, Layers, Grid, Target, Activity, Cpu } from 'lucide-react-native';
import { GameMetadata } from '../../types/arcade';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useArcade } from '../../context/ArcadeContext';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface GameCardProps {
  game: GameMetadata;
  onPress: () => void;
  variant?: 'featured' | 'standard' | 'compact';
}

const renderGameIcon = (iconName: string, color: string, size: number = 28) => {
  switch (iconName) {
    case 'Zap':
      return <Zap size={size} color={color} />;
    case 'Layers':
      return <Layers size={size} color={color} />;
    case 'Grid':
      return <Grid size={size} color={color} />;
    case 'Target':
      return <Target size={size} color={color} />;
    case 'Activity':
      return <Activity size={size} color={color} />;
    case 'Cpu':
      return <Cpu size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPress,
  variant = 'standard',
}) => {
  const { stats } = useArcade();
  const gameStats = stats[game.id] || { highScore: 0, timesPlayed: 0 };

  const handlePress = () => {
    hapticsService.light();
    audioService.play('buttonPress');
    onPress();
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={[styles.featuredWrapper, SHADOWS.card]}
      >
        <LinearGradient
          colors={['#17253D', '#0F1626', '#090D17']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredCard}
        >
          {/* Top highlight bar */}
          <View style={[styles.glowBorder, { borderColor: game.accentColor }]} />

          {/* Badges Row */}
          <View style={styles.topBadgesRow}>
            <View style={[styles.badge, { backgroundColor: `${game.accentColor}25` }]}>
              <Text style={[styles.badgeText, { color: game.accentColor }]}>
                ★ FEATURED
              </Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{game.difficulty}</Text>
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.featuredMain}>
            <View style={styles.featuredArtworkWrapper}>
              <LinearGradient
                colors={[`${game.accentColor}40`, `${game.secondaryColor}10`]}
                style={styles.featuredArtCircle}
              >
                {renderGameIcon(game.iconName, game.accentColor, 44)}
              </LinearGradient>
            </View>

            <View style={styles.featuredTextCol}>
              <Text style={styles.featuredTitle}>{game.title}</Text>
              <Text style={styles.featuredTagline} numberOfLines={2}>
                {game.tagline}
              </Text>
            </View>
          </View>

          {/* Bottom Bar: Stats + Play CTA */}
          <View style={styles.featuredFooter}>
            <View style={styles.statsCol}>
              <View style={styles.statItem}>
                <Trophy size={14} color={COLORS.amber} />
                <Text style={styles.statLabel}>Best:</Text>
                <Text style={styles.statValue}>
                  {gameStats.highScore.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Sparkles size={14} color={COLORS.cyan} />
                <Text style={styles.xpTag}>+{game.baseXp} XP</Text>
              </View>
            </View>

            <View style={[styles.playBtn, { backgroundColor: game.accentColor }]}>
              <Play size={16} color="#0B0E14" fill="#0B0E14" />
              <Text style={styles.playBtnText}>PLAY NOW</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Standard Card
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.standardCardWrapper, SHADOWS.card]}
    >
      <LinearGradient
        colors={['#162033', '#101726']}
        style={styles.standardCard}
      >
        {/* Left Accent Bar */}
        <View
          style={[styles.leftAccent, { backgroundColor: game.accentColor }]}
        />

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${game.accentColor}18` },
              ]}
            >
              {renderGameIcon(game.iconName, game.accentColor, 24)}
            </View>

            <View style={styles.titleArea}>
              <View style={styles.categoryRow}>
                <Text style={[styles.categoryText, { color: game.accentColor }]}>
                  {game.category.toUpperCase()}
                </Text>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.difficultyMiniText}>{game.difficulty}</Text>
              </View>
              <Text style={styles.cardTitle}>{game.title}</Text>
            </View>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {game.tagline}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.cardScoreRow}>
              <Trophy size={13} color={COLORS.amber} />
              <Text style={styles.scoreText}>
                {gameStats.highScore > 0
                  ? gameStats.highScore.toLocaleString()
                  : '—'}
              </Text>
              <View style={styles.miniXpBadge}>
                <Text style={styles.miniXpText}>+{game.baseXp} XP</Text>
              </View>
            </View>

            <View
              style={[
                styles.miniPlayBtn,
                { borderColor: game.accentColor },
              ]}
            >
              <Play size={12} color={game.accentColor} fill={game.accentColor} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredWrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    borderTopWidth: 2,
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  featuredMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  featuredArtworkWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  featuredArtCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featuredTextCol: {
    flex: 1,
  },
  featuredTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  featuredTagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  xpTag: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  playBtnText: {
    color: '#0A0E17',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Standard Card
  standardCardWrapper: {
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  standardCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
  },
  leftAccent: {
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleArea: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bulletDot: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  difficultyMiniText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  miniXpBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  miniXpText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
  },
  miniPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
