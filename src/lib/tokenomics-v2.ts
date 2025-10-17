/**
 * EcoForest Base - Rebalanced Tokenomics System V2
 * 
 * Philosophy: Cozy, free-to-play friendly economy with social prestige mechanics
 * 
 * Three-Token Economy:
 * - $FOREST: Governance token (voting, prestige minting)
 * - $LEAF: Utility token (gameplay currency, marketplace)
 * - $WOOD: Crafting resource (furniture, structures)
 * 
 * Player Tiers:
 * - Free Growers 🌱: Daily activities, small missions, decorative NFTs
 * - Caretakers 🌿: Staking rewards, exclusive cosmetics, seasonal species
 * - Patrons 🌳: Growth boosters, prestige collections, time skip
 * 
 * Features:
 * - Dynamic APY adjustment based on global supply
 * - Daily earning caps to prevent inflation
 * - Social showcase & brag mechanics
 * - Blockchain-ready modular architecture (Base network)
 * - Deflationary burn mechanics with progressive taxation
 */

import type { Tree, GameState } from '@/types/game';

// ============================================================
// TOKEN CONSTANTS & SUPPLY
// ============================================================

export const TOKEN_CONFIG = {
  FOREST: {
    name: 'FOREST',
    symbol: '$FOREST',
    decimals: 18,
    totalSupply: 1_000_000_000, // 1 billion
    emoji: '🌲',
    circulatingSupply: 0, // Updated dynamically
  },
  LEAF: {
    name: 'LEAF',
    symbol: '$LEAF',
    decimals: 18,
    totalSupply: 10_000_000_000, // 10 billion
    emoji: '🍃',
    circulatingSupply: 0,
  },
  WOOD: {
    name: 'WOOD',
    symbol: '$WOOD',
    decimals: 0,
    totalSupply: Infinity, // Generated from gameplay
    emoji: '🪵',
  },
} as const;

// Token distribution (percentages of total supply)
export const TOKEN_DISTRIBUTION = {
  FOREST: {
    stakingRewards: 35, // 35% - reduced from 40%
    communityTreasury: 25, // 25% - increased for governance
    freePlayRewards: 15, // 15% - NEW: for free players
    teamVesting: 10, // 10% - reduced
    liquidityPool: 10, // 10%
    partnerships: 5, // 5%
  },
  LEAF: {
    freePlayRewards: 40, // 40% - increased for free players
    stakingRewards: 20, // 20%
    gameRewards: 20, // 20% - reduced
    marketplace: 10, // 10%
    teamVesting: 5, // 5% - reduced
    initialDistribution: 5, // 5%
  },
} as const;

// ============================================================
// PLAYER TIER SYSTEM
// ============================================================

export type PlayerTier = 'free_grower' | 'caretaker' | 'patron';

export interface PlayerTierInfo {
  tier: PlayerTier;
  emoji: string;
  name: string;
  description: string;
  benefits: string[];
  requirements: string;
}

export const PLAYER_TIERS: Record<PlayerTier, PlayerTierInfo> = {
  free_grower: {
    tier: 'free_grower',
    emoji: '🌱',
    name: 'Free Grower',
    description: 'Nurture your forest through daily care and patience',
    benefits: [
      'Earn $LEAF through daily activities',
      'Trade on marketplace',
      'Collect decorative NFT drops',
      'Join seasonal events',
      'Complete missions for rewards',
    ],
    requirements: 'Default tier - available to all players',
  },
  caretaker: {
    tier: 'caretaker',
    emoji: '🌿',
    name: 'Caretaker',
    description: 'Stake your trees and earn exclusive rewards',
    benefits: [
      'Stake mature trees for $FOREST multipliers',
      'Access exclusive cosmetic items',
      'Unlock seasonal limited NFT species',
      'Early access to new features',
      'Prestige badges & showcase slots',
    ],
    requirements: 'Stake at least 3 mature trees',
  },
  patron: {
    tier: 'patron',
    emoji: '🌳',
    name: 'Patron',
    description: 'Support the ecosystem and gain prestige benefits',
    benefits: [
      'Growth rate & rarity chance boosters',
      'Seasonal passes for exclusive content',
      'Prestige collection NFTs',
      'Golden name badge & forest frame',
      'Priority support & beta access',
    ],
    requirements: 'Purchase a seasonal pass or growth booster',
  },
};

// ============================================================
// DAILY EARNING CAPS (Anti-Inflation)
// ============================================================

export const DAILY_EARNING_CAPS = {
  free_grower: {
    leaf: 500, // Max 500 $LEAF per day
    forest: 5, // Max 5 $FOREST per day
  },
  caretaker: {
    leaf: 1000, // Max 1000 $LEAF per day
    forest: 20, // Max 20 $FOREST per day
  },
  patron: {
    leaf: 2000, // Max 2000 $LEAF per day
    forest: 50, // Max 50 $FOREST per day
  },
};

// ============================================================
// DYNAMIC STAKING SYSTEM
// ============================================================

export type StakingLockPeriod = 'flexible' | '7days' | '30days' | '90days';

export interface StakingTier {
  lockPeriod: StakingLockPeriod;
  lockDays: number;
  baseAPY: number; // Base annual percentage yield
  earlyUnstakePenalty: number; // Percentage penalty
  label: string;
  emoji: string;
}

// Reduced APYs for sustainability
export const STAKING_TIERS: Record<StakingLockPeriod, StakingTier> = {
  flexible: {
    lockPeriod: 'flexible',
    lockDays: 0,
    baseAPY: 3, // Reduced from 5%
    earlyUnstakePenalty: 0,
    label: 'Flexible',
    emoji: '🔓',
  },
  '7days': {
    lockPeriod: '7days',
    lockDays: 7,
    baseAPY: 8, // Reduced from 12%
    earlyUnstakePenalty: 5,
    label: '7 Days',
    emoji: '🔒',
  },
  '30days': {
    lockPeriod: '30days',
    lockDays: 30,
    baseAPY: 18, // Reduced from 25%
    earlyUnstakePenalty: 10,
    label: '30 Days',
    emoji: '🔐',
  },
  '90days': {
    lockPeriod: '90days',
    lockDays: 90,
    baseAPY: 35, // Reduced from 50%
    earlyUnstakePenalty: 20,
    label: '90 Days',
    emoji: '🏆',
  },
} as const;

// Rebalanced rarity multipliers
export const RARITY_MULTIPLIERS: Record<string, number> = {
  'Common Grove': 1.0,
  'Wildwood': 1.3, // Reduced from 1.5
  'Sacred Canopy': 1.6, // Reduced from 2.0
  'Elderbark': 2.0, // Reduced from 3.0
  'Mythroot': 3.0, // Reduced from 5.0
  'Celestial Bough': 4.5, // Reduced from 8.0
  'Origin Tree': 8.0, // Reduced from 15.0
} as const;

// ============================================================
// DYNAMIC APY CALCULATION
// ============================================================

/**
 * Calculates effective APY based on global supply vs demand
 * Formula: effectiveAPY = baseAPY * (1 - globalSupply / maxSupply)
 * This prevents runaway inflation as more tokens are staked
 */
export function calculateDynamicAPY(
  baseAPY: number,
  circulatingSupply: number,
  maxSupply: number
): number {
  const supplyRatio = Math.min(circulatingSupply / maxSupply, 0.9); // Cap at 90%
  const dynamicMultiplier = 1 - supplyRatio * 0.5; // Reduces APY by up to 50%
  return baseAPY * dynamicMultiplier;
}

// ============================================================
// STAKING TYPES & FUNCTIONS
// ============================================================

export interface StakedTree {
  treeId: string;
  stakedAt: number;
  lockPeriod: StakingLockPeriod;
  unlockAt: number;
  lastClaimAt: number;
  accumulatedRewards: {
    forest: number;
    leaf: number;
  };
  tier: string;
  rarityMultiplier: number;
}

export interface StakingStats {
  totalStaked: number;
  totalRewardsEarned: {
    forest: number;
    leaf: number;
  };
  activeStakes: number;
  averageAPY: number;
}

export function calculateStakingRewards(
  stake: StakedTree,
  currentTime: number,
  globalCirculatingSupply: number = 0
): {
  forest: number;
  leaf: number;
} {
  const stakingDuration = currentTime - stake.lastClaimAt;
  const stakingHours = stakingDuration / (1000 * 60 * 60);
  
  const tier = STAKING_TIERS[stake.lockPeriod];
  const rarityMultiplier = stake.rarityMultiplier;
  
  // Apply dynamic APY adjustment
  const dynamicAPY = calculateDynamicAPY(
    tier.baseAPY,
    globalCirculatingSupply,
    TOKEN_CONFIG.FOREST.totalSupply
  );
  
  // Calculate hourly rewards with reduced base amounts
  const baseForestPerHour = (dynamicAPY / 100 / 365 / 24) * 50; // Reduced from 100
  const baseLeafPerHour = baseForestPerHour * 8; // Reduced multiplier from 10x to 8x
  
  const forestRewards = baseForestPerHour * stakingHours * rarityMultiplier;
  const leafRewards = baseLeafPerHour * stakingHours * rarityMultiplier;
  
  return {
    forest: Math.floor(forestRewards * 100) / 100,
    leaf: Math.floor(leafRewards * 100) / 100,
  };
}

export function stakeTree(
  tree: Tree,
  lockPeriod: StakingLockPeriod,
  currentTime: number
): StakedTree {
  const tier = STAKING_TIERS[lockPeriod];
  const unlockAt = lockPeriod === 'flexible' 
    ? currentTime 
    : currentTime + (tier.lockDays * 24 * 60 * 60 * 1000);
  
  const rarityMultiplier = RARITY_MULTIPLIERS[tree.rarityTier] || 1.0;
  
  return {
    treeId: tree.id,
    stakedAt: currentTime,
    lockPeriod,
    unlockAt,
    lastClaimAt: currentTime,
    accumulatedRewards: {
      forest: 0,
      leaf: 0,
    },
    tier: tree.rarityTier,
    rarityMultiplier,
  };
}

export function unstakeTree(
  stake: StakedTree,
  currentTime: number,
  forceUnstake: boolean = false,
  globalCirculatingSupply: number = 0
): {
  success: boolean;
  rewards: { forest: number; leaf: number };
  penalty: { forest: number; leaf: number };
  canUnstake: boolean;
} {
  const canUnstake = currentTime >= stake.unlockAt;
  
  if (!canUnstake && !forceUnstake) {
    return {
      success: false,
      rewards: { forest: 0, leaf: 0 },
      penalty: { forest: 0, leaf: 0 },
      canUnstake: false,
    };
  }
  
  const rewards = calculateStakingRewards(stake, currentTime, globalCirculatingSupply);
  const totalRewards = {
    forest: rewards.forest + stake.accumulatedRewards.forest,
    leaf: rewards.leaf + stake.accumulatedRewards.leaf,
  };
  
  // Progressive penalty calculation (increases with stake value)
  let penalty = { forest: 0, leaf: 0 };
  if (!canUnstake && forceUnstake) {
    const tier = STAKING_TIERS[stake.lockPeriod];
    let penaltyPercent = tier.earlyUnstakePenalty / 100;
    
    // Progressive tax: higher value stakes pay more penalty
    if (totalRewards.forest > 100) {
      penaltyPercent += 0.05; // +5% for large stakes
    }
    if (totalRewards.forest > 500) {
      penaltyPercent += 0.05; // +10% total for very large stakes
    }
    
    penalty = {
      forest: totalRewards.forest * penaltyPercent,
      leaf: totalRewards.leaf * penaltyPercent,
    };
  }
  
  const finalRewards = {
    forest: totalRewards.forest - penalty.forest,
    leaf: totalRewards.leaf - penalty.leaf,
  };
  
  return {
    success: true,
    rewards: finalRewards,
    penalty,
    canUnstake,
  };
}

export function claimStakingRewards(
  stake: StakedTree,
  currentTime: number,
  globalCirculatingSupply: number = 0
): { forest: number; leaf: number } {
  const rewards = calculateStakingRewards(stake, currentTime, globalCirculatingSupply);
  
  // Update last claim time
  stake.lastClaimAt = currentTime;
  stake.accumulatedRewards.forest = 0;
  stake.accumulatedRewards.leaf = 0;
  
  return rewards;
}

// ============================================================
// NFT MINTING COSTS (Rebalanced)
// ============================================================

// Reduced costs for better accessibility
export const NFT_MINTING_COSTS: Record<string, { leaf: number; forest: number }> = {
  'Common Grove': { leaf: 50, forest: 0 }, // Reduced from 100
  'Wildwood': { leaf: 150, forest: 5 }, // Reduced
  'Sacred Canopy': { leaf: 300, forest: 15 }, // Reduced
  'Elderbark': { leaf: 600, forest: 30 }, // Reduced
  'Mythroot': { leaf: 1500, forest: 60 }, // Reduced
  'Celestial Bough': { leaf: 3000, forest: 150 }, // Reduced
  'Origin Tree': { leaf: 6000, forest: 300 }, // Reduced
} as const;

// NEW: Prestige minting (exclusive cosmetic NFTs for patrons)
export const PRESTIGE_MINTING_COSTS: Record<string, { leaf: number; forest: number }> = {
  'Golden Sapling': { leaf: 1000, forest: 100 },
  'Crystal Tree': { leaf: 2000, forest: 200 },
  'Aurora Blossom': { leaf: 3000, forest: 300 },
  'Celestial Guardian': { leaf: 5000, forest: 500 },
} as const;

// ============================================================
// MARKETPLACE FEES (Rebalanced with Burns)
// ============================================================

export const MARKETPLACE_FEES = {
  listingFee: 1, // 1% - reduced from 2%
  platformFee: 2, // 2% - reduced from 2.5%
  creatorRoyalty: 5, // 5% - same
  burnRate: 1, // 1% - NEW: burned on every sale
  auctionFee: 0.5, // 0.5% - reduced from 1%
  minBidIncrement: 25, // Reduced from 50
} as const;

// ============================================================
// ACTIVITY REWARDS (Rebalanced with Daily Caps)
// ============================================================

export function calculateActivityRewards(
  activity: string,
  playerTier: PlayerTier = 'free_grower'
): {
  leaf: number;
  forest: number;
} {
  const tierMultiplier = {
    free_grower: 1.0,
    caretaker: 1.2,
    patron: 1.5,
  };
  
  const baseRewards: Record<string, { leaf: number; forest: number }> = {
    plant_tree: { leaf: 8, forest: 0.08 }, // Reduced from 10/0.1
    water_tree: { leaf: 3, forest: 0.03 }, // Reduced from 5/0.05
    clean_trash: { leaf: 5, forest: 0.05 }, // Reduced from 8/0.08
    remove_weed: { leaf: 2, forest: 0.02 }, // Reduced from 3/0.03
    complete_mission: { leaf: 30, forest: 0.5 }, // Reduced from 50/1.0
    daily_login: { leaf: 15, forest: 0.15 }, // Reduced from 20/0.2
    visit_forest: { leaf: 3, forest: 0 }, // Reduced from 5/0
    receive_heart: { leaf: 5, forest: 0.05 }, // Reduced from 10/0.1
    seasonal_event: { leaf: 50, forest: 1.0 }, // NEW
    friend_referral: { leaf: 100, forest: 2.0 }, // NEW
  };
  
  const rewards = baseRewards[activity] || { leaf: 0, forest: 0 };
  const multiplier = tierMultiplier[playerTier];
  
  return {
    leaf: Math.floor(rewards.leaf * multiplier * 100) / 100,
    forest: Math.floor(rewards.forest * multiplier * 100) / 100,
  };
}

// ============================================================
// BURN MECHANICS (Enhanced Deflationary System)
// ============================================================

export function calculateBurnAmount(activity: string, amount: number): {
  leaf: number;
  forest: number;
} {
  const burnRates: Record<string, { leafPercent: number; forestPercent: number }> = {
    marketplace_sale: { leafPercent: 1, forestPercent: 0 },
    failed_transaction: { leafPercent: 0.5, forestPercent: 0 },
    name_change: { leafPercent: 5, forestPercent: 0 },
    forest_rename: { leafPercent: 2, forestPercent: 0 },
    prestige_mint: { leafPercent: 10, forestPercent: 5 }, // NEW: high burn for prestige
    auction_cancel: { leafPercent: 1, forestPercent: 0 }, // NEW
  };
  
  const rate = burnRates[activity] || { leafPercent: 0, forestPercent: 0 };
  
  return {
    leaf: Math.floor(amount * (rate.leafPercent / 100)),
    forest: Math.floor(amount * (rate.forestPercent / 100)),
  };
}

// ============================================================
// SOCIAL FEATURES
// ============================================================

export interface ShowcaseEntry {
  userId: string;
  username: string;
  treeId: string;
  species: string;
  rarityTier: string;
  showcasedAt: number;
  likes: number;
}

export interface BragGarden {
  userId: string;
  username: string;
  displayTrees: string[]; // Up to 5 tree IDs
  theme: 'natural' | 'mystical' | 'ancient' | 'celestial';
  visitors: number;
  likes: number;
  createdAt: number;
}

export interface FriendLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  badge: string;
  isFriend: boolean;
}

// ============================================================
// CRAFTING SYSTEM ($WOOD)
// ============================================================

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  cost: {
    wood: number;
    leaf: number;
    forest: number;
  };
  output: string;
  category: 'furniture' | 'decoration' | 'structure';
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'wooden_bench',
    name: 'Wooden Bench',
    description: 'A cozy place to rest in your forest',
    cost: { wood: 10, leaf: 50, forest: 0 },
    output: 'wooden_bench',
    category: 'furniture',
  },
  {
    id: 'tree_house',
    name: 'Tree House',
    description: 'A charming dwelling among the branches',
    cost: { wood: 50, leaf: 200, forest: 5 },
    output: 'tree_house',
    category: 'structure',
  },
  {
    id: 'garden_path',
    name: 'Garden Path',
    description: 'Stone path winding through your grove',
    cost: { wood: 20, leaf: 100, forest: 0 },
    output: 'garden_path',
    category: 'decoration',
  },
  {
    id: 'fountain',
    name: 'Mystical Fountain',
    description: 'Flowing water brings life and beauty',
    cost: { wood: 30, leaf: 300, forest: 10 },
    output: 'fountain',
    category: 'decoration',
  },
];

// ============================================================
// BLOCKCHAIN MODULE INTERFACES (Base Network Ready)
// ============================================================

export interface StakingModule {
  stake: (treeId: string, lockPeriod: StakingLockPeriod) => Promise<string>; // Returns tx hash
  unstake: (treeId: string) => Promise<string>;
  claimRewards: (treeId: string) => Promise<string>;
  getStakedTrees: (address: string) => Promise<StakedTree[]>;
  getRewards: (address: string) => Promise<{ forest: number; leaf: number }>;
}

export interface RewardModule {
  claimDailyRewards: () => Promise<string>;
  claimMissionRewards: (missionId: string) => Promise<string>;
  claimSeasonalRewards: (seasonId: string) => Promise<string>;
  getClaimableRewards: (address: string) => Promise<{ leaf: number; forest: number }>;
}

export interface GovernanceModule {
  createProposal: (title: string, description: string) => Promise<string>;
  vote: (proposalId: string, support: boolean) => Promise<string>;
  getVotingPower: (address: string) => Promise<number>;
  executeProposal: (proposalId: string) => Promise<string>;
}

export interface MintingModule {
  mintTreeNFT: (treeId: string) => Promise<string>;
  mintPrestigeNFT: (nftId: string) => Promise<string>;
  transferNFT: (tokenId: string, to: string) => Promise<string>;
  getNFTsByOwner: (address: string) => Promise<string[]>;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function formatTokenAmount(amount: number, decimals: number = 2): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(decimals)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(decimals)}K`;
  }
  return amount.toFixed(decimals);
}

export function getStakingAPY(
  lockPeriod: StakingLockPeriod,
  rarityTier: string,
  globalCirculatingSupply: number = 0
): number {
  const baseTier = STAKING_TIERS[lockPeriod];
  const multiplier = RARITY_MULTIPLIERS[rarityTier] || 1.0;
  const dynamicAPY = calculateDynamicAPY(
    baseTier.baseAPY,
    globalCirculatingSupply,
    TOKEN_CONFIG.FOREST.totalSupply
  );
  return dynamicAPY * multiplier;
}

export function getPlayerTier(gameState: GameState): PlayerTier {
  // Check if patron (has purchased seasonal pass)
  if ((gameState as GameState & { hasSeasonalPass?: boolean }).hasSeasonalPass) {
    return 'patron';
  }
  
  // Check if caretaker (has 3+ staked trees)
  if (gameState.stakedTrees && gameState.stakedTrees.length >= 3) {
    return 'caretaker';
  }
  
  return 'free_grower';
}

export function checkDailyEarningCap(
  gameState: GameState,
  earnedToday: { leaf: number; forest: number }
): {
  canEarnLeaf: boolean;
  canEarnForest: boolean;
  leafRemaining: number;
  forestRemaining: number;
} {
  const tier = getPlayerTier(gameState);
  const caps = DAILY_EARNING_CAPS[tier];
  
  return {
    canEarnLeaf: earnedToday.leaf < caps.leaf,
    canEarnForest: earnedToday.forest < caps.forest,
    leafRemaining: Math.max(0, caps.leaf - earnedToday.leaf),
    forestRemaining: Math.max(0, caps.forest - earnedToday.forest),
  };
}
