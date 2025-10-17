# EcoForest Base — Enhanced Leaderboard System

## 🎯 Overview

The leaderboard system has been completely overhauled with multiple categories, reward tiers, hidden scoring formulas, and enhanced visuals. This creates a more engaging, competitive, and fair ranking experience for all players.

---

## ✨ Key Features

### 1. **Multiple Leaderboard Categories**

Players can now compete across three distinct leaderboards:

#### 🌍 **Global Leaderboard**
- **Description**: Ranks all players worldwide by overall forest score
- **Top 100 players** displayed with pagination
- **Scoring factors** (hidden from UI):
  - Unique tree species (×8 points each)
  - Unique decorations (×3 points each)
  - Average tree maturity (×5 points)
  - Rarity score (weighted by item rarity)
  - Community rating (×15 points)
  - Badge collection (×3 points per badge)
  - Login streak bonus (×2 points per day)
  - Eco-points contribution (×0.1 points)

#### 👥 **Friends Leaderboard**
- **Description**: Shows rankings among connected friends
- **Integration**: Syncs via Web3 social graph (currently mocked with sample data)
- **Use case**: Friendly competition with people you know

#### 💎 **Stake Leaderboard**
- **Description**: Ranks players by staked token amount
- **Features**:
  - Shows total stake value
  - Displays APY boost multipliers
  - Top 50 stakers compete for exclusive rewards

---

### 2. **Tier-Based Ranking System**

Players are assigned visual **tier badges** based on their global rank:

| Tier | Rank Range | Badge | Color Gradient |
|------|------------|-------|----------------|
| 👑 **Celestial** | #1 | Crown | Purple-Pink-Blue |
| 💎 **Platinum** | #2-5 | Diamond | Cyan-Blue |
| 🏆 **Gold** | #6-20 | Trophy | Yellow-Orange |
| 🥈 **Silver** | #21-50 | Medal | Gray-Silver |
| 🥉 **Bronze** | #51-100 | Bronze | Orange-Brown |

**Features**:
- **Animated badges** with gradient backgrounds
- **Tier preservation**: Players keep their tier until the next weekly reset
- **Visual distinction**: Each tier has unique styling and effects

---

### 3. **Reward Distribution System**

#### **Global Leaderboard Rewards** (Weekly Reset)

- **Rank #1**:
  - 👑 **Celestial Crown** (exclusive cosmetic)
  - 🌟 **Origin Tree Seed** (rarest seed in game)

- **Ranks #2-5**:
  - 🎁 **Premium Seed Pack** (5× Epic Seeds)

- **Ranks #6-20**:
  - 📦 **Rare Seed Pack** (3× Rare Seeds)

- **Ranks #21-100**:
  - ⭐ **Eco Points Bonus** (+50 Eco Points)

#### **Stake Leaderboard Rewards** (Monthly Reset)

- **Top 10 Stakers**:
  - 🔥 **Stake Multiplier Badge** (1.5× APY boost for 7 days)

#### **Reward Claiming**
- Rewards appear in **hover cards** next to player entries
- **One-click claiming** from the leaderboard UI
- Instant delivery to inventory

---

### 4. **Search & Filter System**

**Search Functionality**:
- Search by **player username** or **user ID**
- Real-time filtering as you type
- Case-insensitive matching

**Tier Filter**:
- Filter by specific tier (Celestial, Platinum, Gold, Silver, Bronze)
- View "All Tiers" option for complete rankings
- Dropdown selector for easy navigation

---

### 5. **Seasonal System**

**Season Structure**:
- Each season lasts **4 weeks** (28 days)
- Automatic rollover to next season
- **Season number** displayed in UI

**Season Features**:
- **Countdown timer**: Shows time remaining in current season
- **Archived leaderboards**: View past season winners (planned feature)
- **Seasonal trophies**: Permanent badges for top performers
- **Achievement history**: Track your best season performance

**Current Season Info** (displayed in header):
- `Season [Number]` badge
- `⏳ Ends in: [Time]` countdown

---

### 6. **Enhanced UI/UX**

#### **Profile Hover Cards**
Hovering over any player reveals a detailed card with:
- 🏅 **Rank & Tier**
- 📊 **Forest Level**
- 🌳 **Total Trees**
- 🏆 **Badge Count**
- 💰 **Staked Amount** (on Stake leaderboard)
- 🎁 **Available Rewards** (with claim buttons)

#### **Current Player Highlighting**
- **Green gradient background** for your own entry
- **(You)** label next to username
- **Emphasized styling** to stand out from other players

#### **Responsive Layout**
- **Tabs** for category switching (Global, Friends, Stake)
- **Scrollable list** with smooth animations
- **Card-based design** with shadow and hover effects
- **Color-coded badges** for each tier

#### **Empty States**
- Friendly messages when no players match search/filter
- Suggestions to adjust search criteria

---

## 🔒 Security & Fairness

### **Hidden Scoring Formula**

The exact scoring algorithm is **NOT exposed to the UI** to prevent:
- **Score exploitation**: Players can't reverse-engineer optimal strategies
- **Gaming the system**: No way to min-max based on visible formulas
- **Unfair advantages**: Keeps competition organic and balanced

Players see:
- ✅ Their **total score** (numerical value)
- ✅ Their **rank** (#1, #2, etc.)
- ✅ Their **tier** (Celestial, Platinum, etc.)

Players **do NOT** see:
- ❌ Exact formula breakdown
- ❌ Individual component scores
- ❌ Weight coefficients

### **Backend Calculation**

All scoring is computed **server-side** (in production) using:
```typescript
calculatePlayerScore(userData: GameState): number
```

This function is **private** and only accessible by the leaderboard system.

---

## 🚀 Performance Optimizations

### **Caching System**

- **30-second cache duration**: Leaderboards refresh every 30s
- **Automatic refresh**: Happens in background without user interaction
- **Manual force refresh**: Option to reload immediately

### **Pagination**

- **Global**: Top 100 (can load more on demand)
- **Friends**: Top 50 dynamically loaded
- **Stake**: Top 50 displayed

### **Optimistic UI Updates**

- **Instant feedback** on reward claims
- **Smooth transitions** when ranks change
- **No blocking operations**

---

## 📊 Technical Implementation

### **Core Files**

1. **`src/lib/leaderboard-system.ts`**
   - Scoring calculation (hidden from UI)
   - Tier assignment logic
   - Reward generation
   - Caching management
   - Seasonal system
   - Search & filter utilities

2. **`src/components/ui-game/EnhancedLeaderboardPanel.tsx`**
   - React component with tabs, search, filters
   - Hover cards for player details
   - Reward claiming interface
   - Season countdown display

3. **`src/components/forest/StableForest.tsx`** (updated)
   - Integration with game state
   - Trigger leaderboard panel on button click

### **Key Functions**

```typescript
// Generate leaderboard for specific category
getLeaderboard(category: 'global' | 'friends' | 'stake'): EnhancedLeaderboardEntry[]

// Calculate player tier based on rank
calculateTier(rank: number): RankTier

// Get tier visual styling
getTierColor(tier: RankTier): string
getTierBadge(tier: RankTier): string

// Seasonal system
getCurrentSeason(): SeasonData
getSeasonTimeRemaining(): string

// Search & filter
searchLeaderboard(entries, query): EnhancedLeaderboardEntry[]
filterByTier(entries, tier): EnhancedLeaderboardEntry[]

// Reward system
claimReward(userId, rewardId): boolean
```

---

## 🎮 User Flow

### **Opening Leaderboard**

1. Click **🏆 Leaderboard** button in HUD
2. Panel opens showing **Global** tab by default
3. See your rank highlighted with green background
4. View top 100 players with tier badges

### **Navigating Tabs**

1. Click **👥 Friends** tab to see friend rankings
2. Click **💎 Stake** tab to see stake-based rankings
3. Each tab loads instantly with cached data

### **Searching Players**

1. Type username in **search bar**
2. Results filter in real-time
3. Clear search to see full list again

### **Filtering by Tier**

1. Select tier from **dropdown** (Celestial, Platinum, Gold, etc.)
2. Only players in that tier are shown
3. Select "All Tiers" to reset filter

### **Viewing Player Details**

1. **Hover** over any player entry
2. Hover card appears with detailed stats
3. See available rewards (if any)

### **Claiming Rewards**

1. Find your entry (highlighted in green)
2. Hover to view rewards
3. Click **Claim** button next to each reward
4. Reward instantly added to inventory
5. Notification confirms successful claim

---

## 🛠️ Future Enhancements

### **Planned Features**

- **Live Updates**: WebSocket integration for real-time rank changes
- **Historical Charts**: Graph showing rank progression over time
- **Achievement Milestones**: Special badges for reaching certain ranks
- **Clan/Guild Leaderboards**: Team-based competitions
- **Tournament Mode**: Limited-time competitive events
- **Replay System**: View top players' forests in 3D
- **Social Integration**: Share achievements on social media

---

## 📖 API Reference

### **LeaderboardTab**

```typescript
type LeaderboardTab = 'global' | 'friends' | 'stake';
```

### **RankTier**

```typescript
type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'celestial';
```

### **EnhancedLeaderboardEntry**

```typescript
interface EnhancedLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  tier: RankTier;
  forestLevel: number;
  totalTrees: number;
  badges: string[];
  stake?: number; // Only on Stake leaderboard
  rewards?: LeaderboardReward[];
}
```

### **LeaderboardReward**

```typescript
interface LeaderboardReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  claimed: boolean;
}
```

### **SeasonData**

```typescript
interface SeasonData {
  seasonId: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'ended';
}
```

---

## 🎉 Conclusion

The enhanced leaderboard system transforms EcoForest Base into a **truly competitive experience** while maintaining **fairness, engagement, and clarity**. With hidden scoring, tier-based rewards, and multiple competition categories, players have more ways than ever to climb the ranks and showcase their forest-building skills!

**Happy Ranking! 🏆🌲**
