import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Sparkles, ChevronRight, Trophy, Play } from 'lucide-react-native';
import { Header } from '../../src/components/shared/Header';
import { GameCard } from '../../src/components/shared/GameCard';
import { GAMES_REGISTRY, CATEGORIES } from '../../src/constants/gamesRegistry';
import { GameCategory } from '../../src/types/arcade';
import { COLORS } from '../../src/constants/theme';
import { useArcade } from '../../src/context/ArcadeContext';
import { audioService } from '../../src/services/audioService';
import { hapticsService } from '../../src/services/hapticsService';

export default function HomeScreen() {
  const router = useRouter();
  const { stats, dailyChallenge } = useArcade();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');

  const featuredGame = GAMES_REGISTRY.find((g) => g.featured) || GAMES_REGISTRY[0];

  // Recently played games based on stored stats
  const playedGameIds = Object.keys(stats).filter((id) => stats[id]?.timesPlayed > 0);
  const continuePlayingGames = GAMES_REGISTRY.filter((g) =>
    playedGameIds.includes(g.id)
  );

  const filteredGames =
    selectedCategory === 'all'
      ? GAMES_REGISTRY
      : GAMES_REGISTRY.filter((g) => g.category === selectedCategory);

  const newGames = GAMES_REGISTRY.filter((g) => g.isNew);

  const navigateToGame = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge Highlight Bar */}
        {dailyChallenge && (
          <TouchableOpacity
            style={styles.dailyBar}
            activeOpacity={0.85}
            onPress={() => {
              hapticsService.light();
              audioService.play('buttonPress');
              router.push('/(tabs)/challenges' as any);
            }}
          >
            <LinearGradient
              colors={['#1F2536', '#141A29']}
              style={styles.dailyBarInner}
            >
              <View style={styles.dailyIconBox}>
                <Flame size={18} color={COLORS.amber} />
              </View>
              <View style={styles.dailyInfo}>
                <View style={styles.dailyHeaderRow}>
                  <Text style={styles.dailyBadge}>DAILY QUEST</Text>
                  {dailyChallenge.completed && (
                    <Text style={styles.completedTag}>COMPLETED ✓</Text>
                  )}
                </View>
                <Text style={styles.dailyTitle} numberOfLines={1}>
                  {dailyChallenge.title}
                </Text>
              </View>
              <View style={styles.dailyRewardPill}>
                <Sparkles size={12} color={COLORS.cyan} />
                <Text style={styles.dailyXpText}>+{dailyChallenge.xpReward} XP</Text>
                <ChevronRight size={14} color={COLORS.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* HERO / FEATURED GAME */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>FEATURED ARENA</Text>
        </View>
        <GameCard
          game={featuredGame}
          variant="featured"
          onPress={() => navigateToGame(featuredGame.id)}
        />

        {/* Continue Playing / Recently Played (if any) */}
        {continuePlayingGames.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>CONTINUE PLAYING</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {continuePlayingGames.map((game) => (
                <TouchableOpacity
                  key={`continue-${game.id}`}
                  style={styles.continueCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    hapticsService.light();
                    audioService.play('buttonPress');
                    navigateToGame(game.id);
                  }}
                >
                  <LinearGradient
                    colors={['#162238', '#0F1626']}
                    style={styles.continueCardInner}
                  >
                    <View style={styles.continueCardTop}>
                      <View
                        style={[
                          styles.continueDot,
                          { backgroundColor: game.accentColor },
                        ]}
                      />
                      <Text style={styles.continueCategory}>
                        {game.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.continueTitle}>{game.title}</Text>
                    <View style={styles.continueStats}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Trophy size={11} color={COLORS.amber} />
                        <Text style={styles.continueScore}>
                          {stats[game.id]?.highScore.toLocaleString() || 0}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                        <Text style={{ color: COLORS.cyan, fontSize: 9, fontWeight: '700' }}>+{game.baseXp} XP</Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <View style={styles.continuePlayIcon}>
                        <Play size={10} color="#0B0E14" fill="#0B0E14" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* CATEGORY SELECTOR CHIPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>CATEGORIES</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    hapticsService.selection();
                    audioService.play('buttonPress');
                    setSelectedCategory(cat.id);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FILTERED GAME CARDS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all'
                ? 'ALL ARCADE TITLES'
                : `${selectedCategory.toUpperCase()} GAMES`}
            </Text>
            <Text style={styles.sectionCount}>
              {filteredGames.length} GAMES
            </Text>
          </View>

          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => navigateToGame(game.id)}
            />
          ))}
        </View>

        {/* NEW RELEASES */}
        {newGames.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.newBadgeHeader}>
                <Text style={styles.sectionTitle}>JUST DROPPED</Text>
                <View style={styles.newPill}>
                  <Text style={styles.newPillText}>NEW</Text>
                </View>
              </View>
            </View>

            {newGames.map((game) => (
              <GameCard
                key={`new-${game.id}`}
                game={game}
                onPress={() => navigateToGame(game.id)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dailyBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  dailyBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  dailyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dailyBadge: {
    color: COLORS.amber,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completedTag: {
    color: COLORS.lime,
    fontSize: 9,
    fontWeight: '800',
  },
  dailyTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  dailyRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dailyXpText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  section: {
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  newBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newPill: {
    backgroundColor: COLORS.magenta,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  continueCard: {
    width: 150,
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueCardInner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  continueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  continueCategory: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  continueTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  continueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueScore: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  continuePlayIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: COLORS.cyan,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChipTextSelected: {
    color: COLORS.cyan,
    fontWeight: '800',
  },
});
