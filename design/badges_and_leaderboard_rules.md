# EcoForest Base — Badges & Leaderboard Rules

## Badge System

### Badge Types

Badges are awarded for specific achievements and displayed on the user's profile. They serve as visual recognition of milestones and encourage continued engagement.

### Badge Catalog

| Badge ID | Name | Description | Award Criteria | Icon | Rarity |
|----------|------|-------------|----------------|------|--------|
| `first_tree` | First Tree | Planted your very first tree | Plant 1 tree | 🌱 | Common |
| `seven_day_streak` | 7-Day Streak | Logged in for 7 consecutive days | 7-day login streak | 🔥 | Rare |
| `tree_collector` | Tree Collector | Planted all 5 tree species | Plant Oak, Pine, Cherry, Baobab, Mangrove | 🌳 | Epic |
| `forest_builder` | Forest Builder | Grew a large forest | Plant 20 total trees | 🏗️ | Rare |
| `ancient_grove` | Ancient Grove | Cultivated ancient trees | 3 trees reach Ancient stage | 🌲 | Epic |
| `top_eco_helper` | Top Eco Helper | Ranked in top 10 leaderboard | Place in top 10 of any category | ⭐ | Legendary |
| `cleanup_hero` | Cleanup Hero | Removed 100 pieces of trash | Clean 100 trash items | 🧹 | Rare |
| `water_master` | Water Master | Watered 50 trees | Water 50 total trees | 💧 | Rare |
| `community_star` | Community Star | Received 50+ hearts from visitors | 50 hearts given by others | ❤️ | Epic |
| `base_builder` | Base Builder | Completed Base ecosystem mission | Complete "Base Builder" mission | 🏛️ | Epic |
| `group_gardener` | Group Gardener | Planted a group tree | Plant 1 group tree | 👥 | Rare |
| `rare_collector` | Rare Collector | Owns 5+ rare items | Own 5 rare/epic/legendary items | 💎 | Epic |

### Badge Awarding Logic

**Trigger**: Badges are checked and awarded immediately after relevant actions.

**Implementation**:
```javascript
function checkAndAwardBadges(gameState, action) {
  const badges = gameState.badges || [];
  
  // First Tree
  if (action === 'plant_tree' && gameState.trees.length === 1) {
    awardBadge(gameState, 'first_tree');
  }
  
  // 7-Day Streak
  if (action === 'login' && gameState.streak.count === 7) {
    awardBadge(gameState, 'seven_day_streak');
  }
  
  // Tree Collector
  if (action === 'plant_tree' && countUniqueSpecies(gameState.trees) === 5) {
    awardBadge(gameState, 'tree_collector');
  }
  
  // Forest Builder
  if (action === 'plant_tree' && gameState.trees.length === 20) {
    awardBadge(gameState, 'forest_builder');
  }
  
  // Ancient Grove
  if (action === 'growth_update') {
    const ancientCount = gameState.trees.filter(t => t.growthStage === 'ancient').length;
    if (ancientCount === 3) {
      awardBadge(gameState, 'ancient_grove');
    }
  }
  
  // Cleanup Hero
  if (action === 'clean_trash') {
    const totalCleaned = gameState.stats.totalTrashCleaned || 0;
    if (totalCleaned === 100) {
      awardBadge(gameState, 'cleanup_hero');
    }
  }
  
  // Water Master
  if (action === 'water_tree') {
    const totalWatered = gameState.stats.totalTreesWatered || 0;
    if (totalWatered === 50) {
      awardBadge(gameState, 'water_master');
    }
  }
  
  // Community Star
  if (action === 'receive_heart') {
    const totalHearts = gameState.stats.totalHeartsReceived || 0;
    if (totalHearts === 50) {
      awardBadge(gameState, 'community_star');
    }
  }
  
  // Top Eco Helper
  if (action === 'leaderboard_update') {
    const rank = getPlayerRank(gameState.userId);
    if (rank <= 10) {
      awardBadge(gameState, 'top_eco_helper');
    }
  }
  
  // Group Gardener
  if (action === 'plant_group_tree') {
    awardBadge(gameState, 'group_gardener');
  }
  
  // Rare Collector
  if (action === 'acquire_item') {
    const rareCount = countRareItems(gameState);
    if (rareCount >= 5) {
      awardBadge(gameState, 'rare_collector');
    }
  }
}
```

**Display**:
- Show badge notification toast on award
- Display all earned badges on profile page
- Show badge count and progress on HUD

---

## Leaderboard System

### Leaderboard Categories

EcoForest Base features **5 distinct leaderboard categories**, each measuring different aspects of gameplay. This encourages diverse strategies and play styles.

#### 1. Top EcoForests
**Metric**: Total Eco Score  
**Calculation**: See formula below  
**Description**: Overall forest quality and diversity  
**Refresh**: On every action that affects score (plant, grow, acquire, rate)

#### 2. Most Loved
**Metric**: Average Visitor Rating (1-5 stars)  
**Calculation**: `sum(all_ratings) / count(ratings)`  
**Description**: Community favorite forests  
**Refresh**: On every rating given  
**Minimum**: At least 3 ratings to qualify

#### 3. Tree Collector
**Metric**: Number of Unique Species Planted  
**Calculation**: `count(distinct species in trees)`  
**Description**: Biodiversity champions  
**Refresh**: On plant tree action  
**Maximum**: 5 (Oak, Pine, Cherry, Baobab, Mangrove)

#### 4. Rare Finds
**Metric**: Cumulative Rarity Score  
**Calculation**: `sum(rarity_value of all items)`  
**Description**: Collectors of rare and legendary items  
**Refresh**: On acquire item action  
**Rarity Values**: Common=0, Rare=10, Epic=25, Legendary=50

#### 5. Most Visited
**Metric**: Unique Visitor Count  
**Calculation**: `count(distinct visitors)`  
**Description**: Popular forests with high traffic  
**Refresh**: On visit action  
**Note**: Each visitor counted once per session

### Eco Score Formula (Detailed)

The **Eco Score** is the primary ranking metric, combining multiple factors:

```
ecoScore = (uniqueTreeSpecies * 5)      [max: 20 species → 100 points]
         + (uniqueDecorations * 2)      [max: 30 decorations → 60 points]
         + (avgTreeMaturity * 3)        [max: 4.0 maturity → 12 points]
         + (rarityScore)                [max: 500 points]
         + (communityRating * 10)       [max: 5.0 rating → 50 points]
```

**Component Breakdown**:

1. **Unique Tree Species** (0-100 points)
   - Count of distinct species planted (Oak, Pine, Cherry, Baobab, Mangrove)
   - Cap: 20 (theoretical; only 5 species exist currently)
   - Points per species: 5
   - Example: 5 species planted → 25 points

2. **Unique Decorations** (0-60 points)
   - Count of distinct decoration types placed
   - Cap: 30
   - Points per decoration type: 2
   - Example: 10 decoration types → 20 points

3. **Average Tree Maturity** (0-12 points)
   - Average growth stage across all trees
   - Stage values: Seedling=1, Young=2, Mature=3, Ancient=4
   - Formula: `sum(stage_values) / tree_count * 3`
   - Example: 3 ancient trees → 4.0 avg → 12 points

4. **Rarity Score** (0-500 points)
   - Sum of rarity values for all owned items (trees + decorations)
   - Rarity values: Common=0, Rare=10, Epic=25, Legendary=50
   - Cap: 500
   - Example: 2 rare, 1 epic, 1 legendary → 20+10+25+50 = 105 points

5. **Community Rating** (0-50 points)
   - Average rating from visitors (1-5 stars)
   - Multiplied by 10
   - Example: 4.5-star average → 45 points

**Maximum Possible Score**: 100 + 60 + 12 + 500 + 50 = **722 points**

### Leaderboard Ranking Logic

**Calculation Frequency**:
- **Immediate**: Recompute affected leaderboards on every relevant action
- **Serverless**: All computation happens client-side from localStorage data
- **Cached**: Rankings stored in memory for 10 minutes to reduce recomputation

**Tie-Breaking**:
1. Primary: Score (higher wins)
2. Secondary: Total trees planted (higher wins)
3. Tertiary: Account creation date (earlier wins)

**Display**:
- Show top 10 per category
- Highlight current user's rank (even if outside top 10)
- Show user's score and next milestone

**Refresh Rules**:
```javascript
function shouldRefreshLeaderboard(category, action) {
  const refreshTriggers = {
    top_ecoforests: ['plant_tree', 'grow_tree', 'acquire_item', 'receive_rating'],
    most_loved: ['receive_rating'],
    tree_collector: ['plant_tree'],
    rare_finds: ['acquire_item'],
    most_visited: ['receive_visit']
  };
  
  return refreshTriggers[category]?.includes(action) || false;
}
```

### Leaderboard Data Structure

**Storage**: `localStorage['ecoforest_leaderboards']`

```json
{
  "top_ecoforests": [
    { "rank": 1, "userId": "user_123", "username": "ForestMaster", "score": 520, "lastUpdated": 1699999999999 },
    { "rank": 2, "userId": "user_456", "username": "TreeLover", "score": 485, "lastUpdated": 1699999999999 }
  ],
  "most_loved": [...],
  "tree_collector": [...],
  "rare_finds": [...],
  "most_visited": [...]
}
```

### Preventing Spam & Cheating

1. **Rating Validation**:
   - One rating per visitor per forest per session
   - Store in `localStorage['ecoforest_ratings']` with key: `${visitorId}_${forestId}`
   - Validate before accepting rating

2. **Visit Counting**:
   - Track unique visitors by session ID
   - Store visited forests in `localStorage['visited_forests']`
   - Prevent self-visits (can't visit own forest)

3. **Score Caps**:
   - Enforce caps on each component of eco score
   - Prevent overflow or unrealistic scores

4. **Growth Validation**:
   - Tree growth based on real timestamps
   - Cannot fast-forward time (client-side only)
   - Server-side validation would prevent tampering (not implemented in prototype)

### Leaderboard UI

**Components**:
- Category tabs (5 tabs)
- Rank list (top 10)
- User highlight (if in top 10 or below)
- Score display with breakdown tooltip
- "Visit Forest" button per entry

**Refresh Button**:
- Manual refresh option
- Show last updated timestamp
- Auto-refresh every 10 minutes when panel open

**Animations**:
- Smooth rank transitions
- Highlight on rank change
- Confetti on entering top 10

---

## Implementation Notes

### Performance
- **Leaderboard Computation**: O(n log n) per category (sorting)
- **Badge Checks**: O(1) per action (simple conditions)
- **Caching**: Store computed rankings for 10 minutes
- **Batch Updates**: Recompute all affected categories at once

### Persistence
- Badges: `localStorage['ecoforest_gamestate'].badges`
- Leaderboards: Computed on-demand from all user data
- Ratings: `localStorage['ecoforest_ratings']`
- Visits: `localStorage['visited_forests']`

### Testing
- Seed 6 sample users with varying scores
- Ensure leaderboard shows correct rankings
- Test badge awarding on each trigger
- Validate rating/visit limits

### Future Enhancements
- Real-time leaderboard updates (WebSocket)
- Historical ranking charts
- Seasonal leaderboards (monthly resets)
- Leaderboard rewards (top 3 get special items)
- Multi-tiered badges (bronze/silver/gold)

---

**Last Updated**: 2025-10-12  
**Version**: 1.0
