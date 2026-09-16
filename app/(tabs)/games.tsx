import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Trophy } from 'lucide-react-native';
import { Header } from '../../src/components/shared/Header';
import { GameCard } from '../../src/components/shared/GameCard';
import { GAMES_REGISTRY, CATEGORIES } from '../../src/constants/gamesRegistry';
import { GameCategory } from '../../src/types/arcade';
import { COLORS } from '../../src/constants/theme';
import { audioService } from '../../src/services/audioService';
import { hapticsService } from '../../src/services/hapticsService';

export default function GamesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [sortByXp, setSortByXp] = useState(false);

  const filteredGames = GAMES_REGISTRY.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortByXp) return b.baseXp - a.baseXp;
    return 0;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search games, categories, modes..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.filterToggleBtn, sortByXp && styles.filterToggleActive]}
            onPress={() => {
              hapticsService.light();
              audioService.play('buttonPress');
              setSortByXp(!sortByXp);
            }}
            activeOpacity={0.7}
          >
            <SlidersHorizontal
              size={18}
              color={sortByXp ? COLORS.cyan : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
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
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Header Count & Sort Indicator */}
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>
            SHOWING {filteredGames.length} OF {GAMES_REGISTRY.length} GAMES
          </Text>
          {sortByXp && (
            <Text style={styles.sortIndicator}>SORTED BY HIGHEST XP</Text>
          )}
        </View>

        {/* Game Cards List */}
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => router.push(`/game/${game.id}` as any)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NO GAMES FOUND</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or selected category.
            </Text>
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: COLORS.cyan,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTextSelected: {
    color: COLORS.cyan,
    fontWeight: '800',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listCount: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sortIndicator: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
