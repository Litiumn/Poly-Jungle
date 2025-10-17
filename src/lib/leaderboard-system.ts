/**
 * EcoForest Base — Enhanced Leaderboard System
 * 
 * Features:
 * - Multiple leaderboard categories (Global, Friends, Stake)
 * - Hidden scoring formulas (backend abstraction)
 * - Tier-based ranking system (Bronze, Silver, Gold, Platinum, Celestial)
 * - Reward distribution and claiming
 * - Seasonal leaderboard resets
 * - Performance-optimized with caching
 */

import type { GameState, Tree, LeaderboardEntry } from '@/types/game';
import { loadGameState, saveGameState, loadSampleForests } from './storage';

// ============================================================
// SAFE ARRAY UTILITY
// ============================================================

/**
 * Ensures a value is always a valid array (never undefined/null)
 */
export function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type LeaderboardTab = 'global' | 'friends' | 'stake';

export type RankTier = 'wood' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'celestial';

export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  tier: RankTier;
  avatar?: string;
  forestLevel: number;
  totalTrees: number;
  badges: string[];
  stake?: number;
  rewards?: LeaderboardReward[];
  tierProgress?: number; // 0-100 percentage to next tier
  nextTierRank?: number; // Rank needed for next tier
}

export interface LeaderboardReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  claimed: boolean;
}

export interface SeasonData {
  seasonId: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'ended';
}

export interface LeaderboardCache {
  global: EnhancedLeaderboardEntry[];
  friends: EnhancedLeaderboardEntry[];
  stake: EnhancedLeaderboardEntry[];
  lastUpdate: number;
  cacheDuration: number;
}

// ============================================================
// CONSTANTS
// ============================================================

// Expanded tier structure for large-scale player bases
const TIER_RANGES: Record<RankTier, { min: number; max: number }> = {
  celestial: { min: 1, max: 100 },
  platinum: { min: 101, max: 400 },
  gold: { min: 401, max: 1000 },
  silver: { min: 1001, max: 5000 },
  bronze: { min: 5001, max: 20000 },
  wood: { min: 20001, max: 999999 },
};

// Dynamic percentile-based thresholds (used when total players > 50,000)
const TIER_PERCENTILES: Record<RankTier, number> = {
  celestial: 0.002, // Top 0.2%
  platinum: 0.008, // Next 0.6% (0.2% + 0.6% = 0.8%)
  gold: 0.020, // Next 1.2% (0.8% + 1.2% = 2.0%)
  silver: 0.100, // Next 8% (2.0% + 8% = 10%)
  bronze: 0.400, // Next 30% (10% + 30% = 40%)
  wood: 1.0, // Remaining 60%
};

const TIER_COLORS: Record<RankTier, string> = {
  celestial: 'from-purple-400 via-pink-400 to-blue-400',
  platinum: 'from-cyan-300 to-blue-400',
  gold: 'from-yellow-400 to-orange-500',
  silver: 'from-gray-300 to-gray-400',
  bronze: 'from-orange-600 to-orange-800',
  wood: 'from-amber-700 to-amber-900',
};

const TIER_EMBLEMS: Record<RankTier, string> = {
  celestial: '✨',
  platinum: '💠',
  gold: '⭐',
  silver: '🌟',
  bronze: '🔶',
  wood: '🌱',
};

const SEASON_DURATION_WEEKS = 4;
const CACHE_DURATION_MS = 30000; // 30 seconds

// ============================================================
// LEADERBOARD CACHE
// ============================================================

let leaderboardCache: LeaderboardCache | null = null;

function initializeCache(): LeaderboardCache {
  return {
    global: [],
    friends: [],
    stake: [],
    lastUpdate: 0,
    cacheDuration: CACHE_DURATION_MS,
  };
}

function isCacheValid(cache: LeaderboardCache): boolean {
  return Date.now() - cache.lastUpdate < cache.cacheDuration;
}

// ============================================================
// SCORING ABSTRACTION (HIDDEN FROM UI)
// ============================================================

/**
 * Calculate player score using hidden formula
 * This function is NOT exposed to the UI to prevent exploitation
 */
function calculatePlayerScore(userData: GameState): number {
  // Complex scoring formula (hidden from UI)
  const uniqueSpecies = new Set(userData.trees.map((t: Tree) => t.species)).size;
  const uniqueDecos = new Set(userData.decorations.map((d) => d.type)).size;
  const avgMaturity = calculateAvgTreeMaturity(userData.trees);
  const rarityScore = calculateRarityScore(userData);
  const communityRating = calculateAvgRating(userData.userId);
  const badgeBonus = userData.badges.length * 3;
  const streakBonus = userData.streak.count * 2;
  
  // Weighted formula with multiple factors
  const score =
    uniqueSpecies * 8 +
    uniqueDecos * 3 +
    avgMaturity * 5 +
    rarityScore +
    communityRating * 15 +
    badgeBonus +
    streakBonus +
    userData.ecoPoints * 0.1;
  
  return Math.round(score);
}

function calculateAvgTreeMaturity(trees: Tree[]): number {
  if (trees.length === 0) return 0;
  
  const stageValues: Record<string, number> = {
    seed: 1,
    sprout: 2,
    young: 3,
    mature: 5,
    ancient: 8,
  };
  
  let sum = 0;
  for (const tree of trees) {
    sum += stageValues[tree.growthStage] || 1;
  }
  
  return sum / trees.length;
}

function calculateRarityScore(userData: GameState): number {
  const rarityPoints: Record<string, number> = {
    'Common Grove': 1,
    'Wildwood': 3,
    'Sacred Canopy': 8,
    'Elderbark': 15,
    'Mythroot': 30,
    'Celestial Bough': 60,
    'Origin Tree': 100,
  };
  
  let score = 0;
  for (const tree of userData.trees) {
    score += rarityPoints[tree.rarityTier] || 0;
  }
  for (const deco of userData.decorations) {
    score += rarityPoints[deco.rarityTier] || 0;
  }
  
  return score;
}

function calculateAvgRating(forestId: string): number {
  // Mock implementation - in real app this would query backend
  return Math.random() * 5;
}

function calculateForestLevel(userData: GameState): number {
  // Level based on total progress
  const totalProgress = userData.trees.length + userData.badges.length + userData.stats.totalTreesPlanted;
  return Math.floor(totalProgress / 10) + 1;
}

// ============================================================
// TIER CALCULATION
// ============================================================

/**
 * Calculate tier based on rank and optionally total player count
 * Uses percentile-based thresholds for large player bases (>50,000)
 */
function calculateTier(rank: number, totalPlayers: number = 0): RankTier {
  // Use dynamic percentile scaling for large player bases
  if (totalPlayers > 50000) {
    const percentile = rank / totalPlayers;
    
    if (percentile <= TIER_PERCENTILES.celestial) return 'celestial';
    if (percentile <= TIER_PERCENTILES.platinum) return 'platinum';
    if (percentile <= TIER_PERCENTILES.gold) return 'gold';
    if (percentile <= TIER_PERCENTILES.silver) return 'silver';
    if (percentile <= TIER_PERCENTILES.bronze) return 'bronze';
    return 'wood';
  }
  
  // Use fixed rank ranges for smaller player bases
  for (const [tier, range] of Object.entries(TIER_RANGES)) {
    if (rank >= range.min && rank <= range.max) {
      return tier as RankTier;
    }
  }
  
  return 'wood';
}

/**
 * Calculate progress towards next tier (0-100%)
 */
function calculateTierProgress(rank: number, tier: RankTier, totalPlayers: number = 0): { progress: number; nextTierRank: number } {
  const tierOrder: RankTier[] = ['wood', 'bronze', 'silver', 'gold', 'platinum', 'celestial'];
  const currentTierIndex = tierOrder.indexOf(tier);
  
  if (currentTierIndex === tierOrder.length - 1) {
    // Already at top tier
    return { progress: 100, nextTierRank: 1 };
  }
  
  const nextTier = tierOrder[currentTierIndex + 1];
  const currentRange = TIER_RANGES[tier];
  const nextRange = TIER_RANGES[nextTier];
  
  // Calculate progress within current tier
  const tierSpan = currentRange.max - currentRange.min + 1;
  const positionInTier = rank - currentRange.min;
  const progress = Math.max(0, Math.min(100, ((tierSpan - positionInTier) / tierSpan) * 100));
  
  return {
    progress: Math.round(progress),
    nextTierRank: nextRange.max,
  };
}

export function getTierColor(tier: RankTier): string {
  return TIER_COLORS[tier];
}

export function getTierBadge(tier: RankTier): string {
  const badges: Record<RankTier, string> = {
    celestial: '👑',
    platinum: '💎',
    gold: '🏆',
    silver: '🥈',
    bronze: '🥉',
    wood: '🪵',
  };
  return badges[tier];
}

export function getTierEmblem(tier: RankTier): string {
  return TIER_EMBLEMS[tier];
}

export function getTierName(tier: RankTier): string {
  const names: Record<RankTier, string> = {
    celestial: 'Celestial',
    platinum: 'Platinum',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    wood: 'Growing Forest',
  };
  return names[tier];
}

// ============================================================
// REWARD SYSTEM
// ============================================================

function generateRewards(rank: number, tier: RankTier, category: LeaderboardTab): LeaderboardReward[] {
  const rewards: LeaderboardReward[] = [];
  
  if (category === 'global') {
    // Celestial Tier (Ranks 1-100)
    if (tier === 'celestial') {
      if (rank === 1) {
        rewards.push({
          id: 'celestial_crown',
          name: 'Celestial Crown',
          description: 'Legendary cosmetic for #1 Guardian',
          icon: '👑',
          rarity: 'legendary',
          claimed: false,
        });
        rewards.push({
          id: 'origin_seed',
          name: 'Origin Tree Seed',
          description: 'Rarest seed in existence',
          icon: '🌟',
          rarity: 'legendary',
          claimed: false,
        });
        rewards.push({
          id: 'celestial_title',
          name: 'Supreme Guardian Title',
          description: 'Exclusive profile title',
          icon: '✨',
          rarity: 'legendary',
          claimed: false,
        });
      } else if (rank <= 10) {
        rewards.push({
          id: 'celestial_pack',
          name: 'Celestial Seed Pack',
          description: '3x Legendary Seeds + Exclusive Furniture',
          icon: '🎁',
          rarity: 'legendary',
          claimed: false,
        });
        rewards.push({
          id: 'top_10_badge',
          name: 'Elite Guardian Badge',
          description: 'Top 10 achievement',
          icon: '🏅',
          rarity: 'epic',
          claimed: false,
        });
      } else if (rank <= 50) {
        rewards.push({
          id: 'premium_pack_large',
          name: 'Premium Seed Bundle',
          description: '5x Epic Seeds + 200 Eco Points',
          icon: '🎁',
          rarity: 'epic',
          claimed: false,
        });
      } else {
        rewards.push({
          id: 'celestial_bonus',
          name: 'Celestial Tier Reward',
          description: '3x Rare Seeds + 100 Eco Points',
          icon: '⭐',
          rarity: 'rare',
          claimed: false,
        });
      }
    }
    
    // Platinum Tier (Ranks 101-400)
    else if (tier === 'platinum') {
      rewards.push({
        id: 'platinum_pack',
        name: 'Platinum Seed Pack',
        description: '3x Epic Seeds + Platinum Badge',
        icon: '💎',
        rarity: 'epic',
        claimed: false,
      });
    }
    
    // Gold Tier (Ranks 401-1000)
    else if (tier === 'gold') {
      rewards.push({
        id: 'gold_pack',
        name: 'Gold Seed Pack',
        description: '2x Rare Seeds + 50 Eco Points',
        icon: '🏆',
        rarity: 'rare',
        claimed: false,
      });
    }
    
    // Silver Tier (Ranks 1001-5000)
    else if (tier === 'silver') {
      rewards.push({
        id: 'silver_bonus',
        name: 'Silver Tier Reward',
        description: '+30 Eco Points',
        icon: '🥈',
        rarity: 'common',
        claimed: false,
      });
    }
    
    // Bronze & Wood tiers get motivational milestones instead
  }
  
  if (category === 'stake' && rank <= 10) {
    rewards.push({
      id: 'stake_multiplier',
      name: 'Stake Multiplier Badge',
      description: '1.5x APY boost for 7 days',
      icon: '🔥',
      rarity: 'epic',
      claimed: false,
    });
  }
  
  return rewards;
}

export function claimReward(userId: string, rewardId: string): boolean {
  const state = loadGameState();
  if (!state || state.userId !== userId) return false;
  
  // Mark reward as claimed
  // In production, this would update backend
  const rewardMapping: Record<string, { ecoPoints?: number; items?: string[] }> = {
    celestial_crown: { items: ['celestial_crown_cosmetic'] },
    origin_seed: { items: ['origin_tree_seed'] },
    premium_pack: { items: ['epic_seed', 'epic_seed', 'epic_seed', 'epic_seed', 'epic_seed'] },
    rare_pack: { items: ['rare_seed', 'rare_seed', 'rare_seed'] },
    eco_bonus: { ecoPoints: 50 },
    stake_multiplier: { items: ['stake_boost_badge'] },
  };
  
  const reward = rewardMapping[rewardId];
  if (!reward) return false;
  
  if (reward.ecoPoints) {
    state.ecoPoints += reward.ecoPoints;
  }
  
  if (reward.items) {
    for (const item of reward.items) {
      state.inventory[item] = (state.inventory[item] || 0) + 1;
    }
  }
  
  saveGameState(state);
  return true;
}

// ============================================================
// LEADERBOARD GENERATION
// ============================================================

/**
 * Generate filler leaderboard data for testing and demo purposes
 */
function generateFillerUsers(count: number = 50): GameState[] {
  const fillerUsers: GameState[] = [];
  
  const usernames = [
    'ForestGuardian', 'TreeHugger', 'EcoWarrior', 'NatureLover', 'GreenThumb',
    'PlantWhisperer', 'WoodlandSage', 'CanopyKing', 'RootMaster', 'LeafCollector',
    'BranchBuilder', 'SeedSower', 'GroveTender', 'ForestMage', 'TimberLord',
    'MossyStone', 'PineKeeper', 'OakWarden', 'MapleGuard', 'CherryBloom',
    'WillowWeaver', 'BirchBard', 'ElmEnchanter', 'AshAdept', 'CedarSage',
    'SpruceSpirit', 'FirFriend', 'HemlockHero', 'RedwoodRanger', 'SequoiaSoul',
    'BaobabBoss', 'MangroveMaster', 'BambooBeacon', 'TeakTitan', 'MahoganyMaven',
    'EbonyEmpress', 'IvoryIdol', 'SandalwoodStar', 'RosewoodRogue', 'CypressChampion',
    'JuniperJester', 'HazelHarbor', 'PoplarPrince', 'LarchLegend', 'YewYogi',
    'SycamoreSeer', 'LocustLord', 'HickoryHawk', 'WalnutWizard', 'ChestnutChief'
  ];
  
  for (let i = 0; i < count; i++) {
    const userId = `filler_user_${i + 1}`;
    const username = `${usernames[i % usernames.length]}${i > 49 ? Math.floor(i / 50) : ''}`;
    
    // Generate realistic stats
    const treeCount = Math.floor(Math.random() * 20) + 1;
    const ecoPoints = Math.floor(Math.random() * 500) + 50;
    const badges = Math.floor(Math.random() * 8);
    const streak = Math.floor(Math.random() * 30);
    
    const fillerUser: GameState = {
      userId,
      username,
      wallet: { address: `0x${userId}`, connected: false },
      ecoPoints,
      trees: Array(treeCount).fill(null).map((_, j) => ({
        id: `tree_${userId}_${j}`,
        species: ['Oak', 'Pine', 'Cherry', 'Maple', 'Birch'][Math.floor(Math.random() * 5)] as any,
        position: { x: 0, y: 0, z: 0 },
        plantedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        growthStage: ['sprout', 'young', 'mature', 'ancient'][Math.floor(Math.random() * 4)] as any,
        wateredToday: Math.random() > 0.5,
        lastWatered: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        rarityTier: ['Common Grove', 'Wildwood', 'Sacred Canopy', 'Elderbark'][Math.floor(Math.random() * 4)] as any,
        ecoImpactKgCO2: Math.floor(Math.random() * 100) + 10,
      })),
      decorations: [],
      inventory: {},
      missions: [],
      groups: [],
      mintedNFTs: [],
      badges: Array(badges).fill('🏆'),
      streak: { count: streak, lastLogin: Date.now() },
      stats: {
        totalTreesPlanted: treeCount + Math.floor(Math.random() * 10),
        totalTrashCleaned: Math.floor(Math.random() * 30),
        totalTreesWatered: Math.floor(Math.random() * 50),
        totalHeartsReceived: Math.floor(Math.random() * 20),
      },
      visitCount: Math.floor(Math.random() * 100),
      interactables: { trash: [], weeds: [] },
      lastDailyReset: Date.now(),
      tutorialCompleted: true,
    };
    
    fillerUsers.push(fillerUser);
  }
  
  return fillerUsers;
}

function getAllUserData(): GameState[] {
  const currentUser = loadGameState();
  const sampleForests = loadSampleForests();
  
  // Add filler users for demo/testing
  const fillerUsers = generateFillerUsers(50);
  
  const allUsers = currentUser 
    ? [currentUser, ...sampleForests, ...fillerUsers] 
    : [...sampleForests, ...fillerUsers];
  return safeArray(allUsers);
}

/**
 * Generate global leaderboard (top 100 players by score)
 */
export function generateGlobalLeaderboard(limit: number = 100): EnhancedLeaderboardEntry[] {
  const allUsers = safeArray(getAllUserData());
  
  if (allUsers.length === 0) {
    return [];
  }
  
  const entries: EnhancedLeaderboardEntry[] = allUsers.map((user: GameState) => {
    const score = calculatePlayerScore(user);
    
    return {
      userId: user?.userId || 'unknown',
      username: user?.username || 'Anonymous',
      score,
      rank: 0, // Will be set after sorting
      tier: 'bronze' as RankTier,
      forestLevel: calculateForestLevel(user),
      totalTrees: safeArray(user?.trees).length,
      badges: safeArray(user?.badges),
      rewards: [],
    };
  });
  
  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);
  
  // Assign ranks and tiers
  const totalPlayers = entries.length;
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.tier = calculateTier(entry.rank, totalPlayers);
    const tierProgressData = calculateTierProgress(entry.rank, entry.tier, totalPlayers);
    entry.tierProgress = tierProgressData.progress;
    entry.nextTierRank = tierProgressData.nextTierRank;
    entry.rewards = safeArray(generateRewards(entry.rank, entry.tier, 'global'));
  });
  
  return safeArray(entries.slice(0, limit));
}

/**
 * Generate friends leaderboard (mocked with sample data)
 */
export function generateFriendsLeaderboard(): EnhancedLeaderboardEntry[] {
  // In production, this would filter by connected friends via Web3 social graph
  const allUsers = safeArray(getAllUserData());
  const friendUsers = allUsers.slice(0, Math.min(10, allUsers.length));
  
  if (friendUsers.length === 0) {
    return [];
  }
  
  const entries: EnhancedLeaderboardEntry[] = friendUsers.map((user: GameState) => {
    const score = calculatePlayerScore(user);
    
    return {
      userId: user?.userId || 'unknown',
      username: user?.username || 'Anonymous',
      score,
      rank: 0,
      tier: 'bronze' as RankTier,
      forestLevel: calculateForestLevel(user),
      totalTrees: safeArray(user?.trees).length,
      badges: safeArray(user?.badges),
      rewards: [],
    };
  });
  
  entries.sort((a, b) => b.score - a.score);
  
  const totalPlayers = entries.length;
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.tier = calculateTier(entry.rank, totalPlayers);
    const tierProgressData = calculateTierProgress(entry.rank, entry.tier, totalPlayers);
    entry.tierProgress = tierProgressData.progress;
    entry.nextTierRank = tierProgressData.nextTierRank;
    entry.rewards = safeArray(generateRewards(entry.rank, entry.tier, 'friends'));
  });
  
  return safeArray(entries);
}

/**
 * Generate stake leaderboard (ranked by staked token amount)
 */
export function generateStakeLeaderboard(): EnhancedLeaderboardEntry[] {
  const allUsers = safeArray(getAllUserData());
  
  if (allUsers.length === 0) {
    return [];
  }
  
  const entries: EnhancedLeaderboardEntry[] = allUsers.map((user: GameState) => {
    // Mock stake amount based on user progress
    const mockStake = (user?.ecoPoints || 0) * 10 + safeArray(user?.trees).length * 50;
    
    return {
      userId: user?.userId || 'unknown',
      username: user?.username || 'Anonymous',
      score: mockStake,
      rank: 0,
      tier: 'bronze' as RankTier,
      forestLevel: calculateForestLevel(user),
      totalTrees: safeArray(user?.trees).length,
      badges: safeArray(user?.badges),
      stake: mockStake,
      rewards: [],
    };
  });
  
  entries.sort((a, b) => b.score - a.score);
  
  const totalPlayers = entries.length;
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.tier = calculateTier(entry.rank, totalPlayers);
    const tierProgressData = calculateTierProgress(entry.rank, entry.tier, totalPlayers);
    entry.tierProgress = tierProgressData.progress;
    entry.nextTierRank = tierProgressData.nextTierRank;
    entry.rewards = safeArray(generateRewards(entry.rank, entry.tier, 'stake'));
  });
  
  return safeArray(entries.slice(0, 50));
}

// ============================================================
// CACHED LEADERBOARD ACCESS
// ============================================================

export function getLeaderboard(category: LeaderboardTab, forceRefresh: boolean = false): EnhancedLeaderboardEntry[] {
  if (!leaderboardCache) {
    leaderboardCache = initializeCache();
  }
  
  if (!forceRefresh && isCacheValid(leaderboardCache)) {
    return safeArray(leaderboardCache[category]);
  }
  
  // Refresh cache
  try {
    leaderboardCache.global = safeArray(generateGlobalLeaderboard());
    leaderboardCache.friends = safeArray(generateFriendsLeaderboard());
    leaderboardCache.stake = safeArray(generateStakeLeaderboard());
    leaderboardCache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    // Return empty array on error
    return [];
  }
  
  return safeArray(leaderboardCache[category]);
}

// ============================================================
// SEASONAL SYSTEM
// ============================================================

export function getCurrentSeason(): SeasonData {
  const seasonStart = new Date('2024-01-01').getTime();
  const now = Date.now();
  const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
  const currentSeasonId = Math.floor(weeksSinceStart / SEASON_DURATION_WEEKS) + 1;
  
  const seasonStartDate = seasonStart + (currentSeasonId - 1) * SEASON_DURATION_WEEKS * 7 * 24 * 60 * 60 * 1000;
  const seasonEndDate = seasonStartDate + SEASON_DURATION_WEEKS * 7 * 24 * 60 * 60 * 1000;
  
  return {
    seasonId: currentSeasonId,
    startDate: seasonStartDate,
    endDate: seasonEndDate,
    status: now < seasonEndDate ? 'active' : 'ended',
  };
}

export function getSeasonTimeRemaining(): string {
  const season = getCurrentSeason();
  const remaining = season.endDate - Date.now();
  
  if (remaining <= 0) return 'Season Ended';
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

// ============================================================
// SEARCH & FILTER
// ============================================================

export function searchLeaderboard(
  entries: EnhancedLeaderboardEntry[],
  query: string
): EnhancedLeaderboardEntry[] {
  const safeEntries = safeArray(entries);
  const lowerQuery = (query || '').toLowerCase();
  
  if (!lowerQuery) return safeEntries;
  
  return safeEntries.filter((entry) =>
    (entry?.username || '').toLowerCase().includes(lowerQuery) ||
    (entry?.userId || '').toLowerCase().includes(lowerQuery)
  );
}

export function filterByTier(
  entries: EnhancedLeaderboardEntry[],
  tier: RankTier | 'all'
): EnhancedLeaderboardEntry[] {
  const safeEntries = safeArray(entries);
  if (tier === 'all') return safeEntries;
  return safeEntries.filter((entry) => entry?.tier === tier);
}
