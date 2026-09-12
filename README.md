# MINI ARCADE — Premium Multi-Game Mobile Arcade App

A commercial-grade, multi-game mobile arcade platform built with React Native, Expo, TypeScript, React Native Reanimated, Expo Router, and a centralized arcade progression engine.

---

## 🌟 Product Highlights

- **The Product Itself is the Core Experience**: Every session follows the cohesive product loop:
  `Arcade Hub` ➔ `Discover Game` ➔ `Game Intro Modal` ➔ `3-2-1 Countdown` ➔ `Gameplay HUD` ➔ `Rewarding Result Screen` ➔ `XP & Stats Progression` ➔ `Play Again / Next Game`.
- **Cyberpunk Dark-First Design System**:
  - Deep space obsidian backgrounds (`#0B0E14`, `#121824`, `#17233B`)
  - Vibrant neon accents: Electric Cyan (`#00F0FF`), Neon Magenta (`#FF007A`), Energetic Lime (`#10B981`), Cosmic Amber (`#F59E0B`), Royal Violet (`#8B5CF6`)
  - Glassmorphic translucent cards, neon glow borders, and linear gradient overlays
- **Shared Game Framework**:
  - `<GameContainer />`: Master state machine orchestrating game lifecycle (`INTRO` ➔ `COUNTDOWN` ➔ `PLAYING` ➔ `PAUSED` ➔ `RESULT`).
  - `<GameIntro />`: Pre-game briefing with artwork, description, difficulty, How to Play steps, controls guide, personal best, and start CTA.
  - `<GameCountdown />`: Spring animated 3-2-1-GO! countdown with synchronized audio & haptics.
  - `<GameHUD />`: Minimal, responsive HUD displaying current score, high score, timer/lives/moves, combo counter, and pause trigger.
  - `<GamePauseModal />`: Frosted glass pause menu with Resume, Restart, How to Play, and Quit options.
  - `<GameResult />`: Rewarding result celebration featuring animated score counter, "NEW PERSONAL BEST!" celebration banner, XP level progress bar, and contextual performance metrics.
  - `<AchievementModal />` & `<LevelUpModal />`: Global animated popups celebrating unlocked milestones and level promotions.

---

## 🎮 Game Suite (6 Modular Games)

1. **Neon Snake (Classic Arcade)**
   - High-voltage neon snake with fluid swipe controls and responsive on-screen tactile D-Pad.
   - Glowing food nodes, golden bonus sparks (5x score), wall/self collision, dynamic velocity progression.
   - Contextual Metrics: Data Nodes, Bonus Sparks, Max Length, Velocity multiplier.

2. **Neon Breakout (Classic Arcade)**
   - High-energy paddle and ball physics with 5 tiers of glowing colored bricks.
   - Paddle deflection physics, multi-ball split power-ups, wide paddle shields, and combo multipliers.
   - Contextual Metrics: Bricks Cleared, Max Combo, Shields Left, Mission Outcome.

3. **2048 Glow (Puzzle)**
   - Cyber tile fusion puzzle with 4-directional swipe gestures and smooth merge mechanics.
   - Color-coded power-of-2 neon tiles (2 to 4096), undo move functionality, and 2048 core detection.
   - Contextual Metrics: Highest Fusion, Total Moves, 2048 Core status.

4. **Minesweeper Tactical (Puzzle & Strategy)**
   - Tactical minefield scanner with first-tap safe guarantee (never hit a mine on initial press).
   - Smart recursive zero-cascade reveal, dedicated Flag Mode toggle, and live timer.
   - Contextual Metrics: Clear Time, Sectors Scanned, Mines Flagged, Defusal Efficiency.

5. **Speed Reflex (Action & Reaction)**
   - Millisecond neurological reflex benchmarking with randomized charge intervals (1.5s to 4.0s).
   - False-start deterrence, 5-round aggregate scoring, and neurological classification tiers (Godlike, Cyber Runner, Pro Gamer, Standard Human).
   - Contextual Metrics: Best Reaction (ms), Average Reflex (ms), Neural Rank, False Starts.

6. **Cyber Tic-Tac-Toe (Strategy)**
   - Holographic 3x3 combat grid with AI difficulties: Casual, Pro, and Unbeatable Minimax AI.
   - 2-player local pass-and-play duel mode and winning line holographic ray effects.
   - Contextual Metrics: Player Victories, AI Victories, Ties, AI Difficulty.

---

## ⚙️ Architecture & Centralized Engines

```
mini-arcade/
├── app/
│   ├── _layout.tsx           # Global Root layout & celebration modal host
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom glass navigation bar with neon icons
│   │   ├── index.tsx         # Central Arcade Home Hub (Featured hero, continue, categories)
│   │   ├── games.tsx         # Game Discovery Library (Search, filters, sort)
│   │   ├── challenges.tsx    # Daily Quests, Streaks & Achievement trophy showcase
│   │   └── profile.tsx       # Player Profile, Level math, lifetime metrics
│   ├── game/
│   │   └── [id].tsx          # Unified Dynamic Game Host Route
│   └── settings.tsx          # Sound FX, Music, Haptics, and Data wipe settings
├── src/
│   ├── components/shared/    # Standardized Game Framework components
│   │   ├── Header.tsx
│   │   ├── GameCard.tsx
│   │   ├── GameContainer.tsx
│   │   ├── GameIntro.tsx
│   │   ├── GameCountdown.tsx
│   │   ├── GameHUD.tsx
│   │   ├── GamePauseModal.tsx
│   │   ├── GameResult.tsx
│   │   ├── AchievementModal.tsx
│   │   └── LevelUpModal.tsx
│   ├── constants/            # Theme tokens & Games Registry
│   │   ├── theme.ts
│   │   └── gamesRegistry.ts
│   ├── context/              # ArcadeContext global React state
│   │   └── ArcadeContext.tsx
│   ├── games/                # Modular isolated game engines & screens
│   │   ├── snake/
│   │   ├── breakout/
│   │   ├── game2048/
│   │   ├── minesweeper/
│   │   ├── reaction/
│   │   └── tictactoe/
│   ├── services/             # Core singleton service engines
│   │   ├── audioService.ts
│   │   ├── hapticsService.ts
│   │   ├── progressionService.ts
│   │   ├── achievementService.ts
│   │   ├── dailyChallengeService.ts
│   │   └── storageService.ts
│   └── types/
│       └── arcade.ts
```

---

## 🚀 Running the Project

```bash
cd mini-arcade

# Install dependencies (already installed)
npm install

# Run on Android emulator / physical device
npm run android

# Run on iOS simulator (macOS)
npm run ios

# Run on Web browser
npm run web
```
