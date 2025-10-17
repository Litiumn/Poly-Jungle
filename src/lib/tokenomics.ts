/**
 * EcoForest Base - Comprehensive Tokenomics System
 * 
 * Three-Token Economy:
 * - $FOREST: Governance token (earned through staking, achievements)
 * - $LEAF: Utility token (in-game currency, marketplace)
 * - Building Logs: Crafting material (from chopping trees)
 * 
 * Features:
 * - Tree staking with APY rewards
 * - Lock periods (7, 30, 90 days)
 * - NFT minting costs
 * - Marketplace fees & royalties
 * - Token distribution & emissions
 * - Deflationary burn mechanics
 */

import type { Tree, GameState } from '@/types/game';

// ============================================================
// TOKEN CONSTANTS
// ============================================================

export const TOKEN_CONFIG = {
  FOREST: {
    name: 'FOREST',
    symbol: '$FOREST',
    decimals: 18,
    totalSupply: 1_000_000_000, // 1 billion
    emoji: '🌲',
  },
  LEAF: {
    name: 'LEAF',
    symbol: '$LEAF',
    decimals: 18,
    totalSupply: 10_000_000_000, // 10 billion
    emoji: '🍃',
  },
} as const;

// Token distribution (percentages of total supply)
export const TOKEN_DISTRIBUTION = {
  FOREST: {
    stakingRewards: 40, // 40%
    teamVesting: 15, // 15%
    communityTreasury: 20, // 20%
    liquidityPool: 10, // 10%
    publicSale: 10, // 10%
    partnerships: 5, // 5%
  },
  LEAF: {
    gameRewards: 50, // 50%
    stakingRewards: 20, // 20%
    marketplace: 15, // 15%
    teamVesting: 10, // 10%
    initialDistribution: 5, // 5%
  },
} as const;

// ============================================================
// STAKING CONFIGURATION
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

export const STAKING_TIERS: Record<StakingLockPeriod, StakingTier> = {
  flexible: {
    lockPeriod: 'flexible',
    lockDays: 0,
    baseAPY: 5,
    earlyUnstakePenalty: 0,
    label: 'Flexible',
    emoji: '🔓',
  },
  '7days': {
    lockPeriod: '7days',
    lockDays: 7,
    baseAPY: 12,
    earlyUnstakePenalty: 5,
    label: '7 Days',
    emoji: '🔒',
  },
  '30days': {
    lockPeriod: '30days',
    lockDays: 30,
    baseAPY: 25,
    earlyUnstakePenalty: 10,
    label: '30 Days',
    emoji: '🔐',
  },
  '90days': {
    lockPeriod: '90days',
    lockDays: 90,
    baseAPY: 50,
    earlyUnstakePenalty: 20,
    label: '90 Days',
    emoji: '🏆',
  },
} as const;

// Rarity multipliers for staking rewards
export const RARITY_MULTIPLIERS: Record<string, number> = {
  'Common Grove': 1.0,
  'Wildwood': 1.5,
  'Sacred Canopy': 2.0,
  'Elderbark': 3.0,
  'Mythroot': 5.0,
  'Celestial Bough': 8.0,
  'Origin Tree': 15.0,
} as const;

// ============================================================
// STAKING TYPES
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

// ============================================================
// NFT MINTING COSTS
// ============================================================

export const NFT_MINTING_COSTS: Record<string, { leaf: number; forest: number }> = {
  'Common Grove': { leaf: 100, forest: 0 },
  'Wildwood': { leaf: 250, forest: 10 },
  'Sacred Canopy': { leaf: 500, forest: 25 },
  'Elderbark': { leaf: 1000, forest: 50 },
  'Mythroot': { leaf: 2500, forest: 100 },
  'Celestial Bough': { leaf: 5000, forest: 250 },
  'Origin Tree': { leaf: 10000, forest: 500 },
} as const;

// ============================================================
// MARKETPLACE FEES
// ============================================================

export const MARKETPLACE_FEES = {
  listingFee: 2, // 2% of listing price in $LEAF
  platformFee: 2.5, // 2.5% platform fee on sales
  creatorRoyalty: 5, // 5% goes to original minter
  auctionFee: 1, // 1% to start auction
  minBidIncrement: 50, // Minimum bid increase in $LEAF
} as const;

// ============================================================
// STAKING FUNCTIONS
// ============================================================

export function calculateStakingRewards(stake: StakedTree, currentTime: number): {
  forest: number;
  leaf: number;
} {
  const stakingDuration = currentTime - stake.lastClaimAt;
  const stakingHours = stakingDuration / (1000 * 60 * 60);
  
  const tier = STAKING_TIERS[stake.lockPeriod];
  const rarityMultiplier = stake.rarityMultiplier;
  
  // Calculate hourly rewards
  const baseForestPerHour = (tier.baseAPY / 100 / 365 / 24) * 100; // Base: 100 FOREST units
  const baseLeafPerHour = baseForestPerHour * 10; // LEAF is 10x more abundant
  
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
  forceUnstake: boolean = false
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
  
  const rewards = calculateStakingRewards(stake, currentTime);
  const totalRewards = {
    forest: rewards.forest + stake.accumulatedRewards.forest,
    leaf: rewards.leaf + stake.accumulatedRewards.leaf,
  };
  
  // Calculate early unstake penalty
  let penalty = { forest: 0, leaf: 0 };
  if (!canUnstake && forceUnstake) {
    const tier = STAKING_TIERS[stake.lockPeriod];
    const penaltyPercent = tier.earlyUnstakePenalty / 100;
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
  currentTime: number
): { forest: number; leaf: number } {
  const rewards = calculateStakingRewards(stake, currentTime);
  
  // Update last claim time
  stake.lastClaimAt = currentTime;
  stake.accumulatedRewards.forest = 0;
  stake.accumulatedRewards.leaf = 0;
  
  return rewards;
}

// ============================================================
// NFT MINTING FUNCTIONS
// ============================================================

export function calculateMintingCost(tree: Tree): {
  leaf: number;
  forest: number;
  canMint: boolean;
  reason?: string;
} {
  if (tree.growthStage !== 'mature' && tree.growthStage !== 'ancient') {
    return {
      leaf: 0,
      forest: 0,
      canMint: false,
      reason: 'Tree must be at least mature to mint',
    };
  }
  
  const cost = NFT_MINTING_COSTS[tree.rarityTier] || NFT_MINTING_COSTS['Common Grove'];
  
  return {
    leaf: cost.leaf,
    forest: cost.forest,
    canMint: true,
  };
}

export function mintTreeNFT(
  gameState: GameState,
  tree: Tree
): {
  success: boolean;
  cost: { leaf: number; forest: number };
  reason?: string;
} {
  const mintCost = calculateMintingCost(tree);
  
  if (!mintCost.canMint) {
    return {
      success: false,
      cost: { leaf: 0, forest: 0 },
      reason: mintCost.reason,
    };
  }
  
  // Check if player has enough tokens (using ecoPoints as LEAF for now)
  const playerLeaf = gameState.ecoPoints;
  const playerForest = (gameState as GameState & { forestTokens?: number }).forestTokens || 0;
  
  if (playerLeaf < mintCost.leaf || playerForest < mintCost.forest) {
    return {
      success: false,
      cost: mintCost,
      reason: 'Insufficient tokens',
    };
  }
  
  return {
    success: true,
    cost: mintCost,
  };
}

// ============================================================
// MARKETPLACE FUNCTIONS
// ============================================================

export function calculateListingFee(price: number): number {
  return Math.ceil(price * (MARKETPLACE_FEES.listingFee / 100));
}

export function calculateSaleFees(salePrice: number): {
  platformFee: number;
  creatorRoyalty: number;
  sellerReceives: number;
} {
  const platformFee = Math.ceil(salePrice * (MARKETPLACE_FEES.platformFee / 100));
  const creatorRoyalty = Math.ceil(salePrice * (MARKETPLACE_FEES.creatorRoyalty / 100));
  const sellerReceives = salePrice - platformFee - creatorRoyalty;
  
  return {
    platformFee,
    creatorRoyalty,
    sellerReceives,
  };
}

export function calculateAuctionFee(startingBid: number): number {
  return Math.ceil(startingBid * (MARKETPLACE_FEES.auctionFee / 100));
}

// ============================================================
// TOKEN REWARDS & EMISSIONS
// ============================================================

export function calculateActivityRewards(activity: string): {
  leaf: number;
  forest: number;
} {
  const rewards: Record<string, { leaf: number; forest: number }> = {
    plant_tree: { leaf: 10, forest: 0.1 },
    water_tree: { leaf: 5, forest: 0.05 },
    clean_trash: { leaf: 8, forest: 0.08 },
    remove_weed: { leaf: 3, forest: 0.03 },
    complete_mission: { leaf: 50, forest: 1.0 },
    daily_login: { leaf: 20, forest: 0.2 },
    visit_forest: { leaf: 5, forest: 0 },
    receive_heart: { leaf: 10, forest: 0.1 },
  };
  
  return rewards[activity] || { leaf: 0, forest: 0 };
}

// ============================================================
// BURN MECHANICS (Deflationary)
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
  };
  
  const rate = burnRates[activity] || { leafPercent: 0, forestPercent: 0 };
  
  return {
    leaf: Math.floor(amount * (rate.leafPercent / 100)),
    forest: Math.floor(amount * (rate.forestPercent / 100)),
  };
}

// ============================================================
// VESTING SCHEDULES
// ============================================================

export interface VestingSchedule {
  totalAmount: number;
  startTime: number;
  cliffDuration: number; // milliseconds
  vestingDuration: number; // milliseconds
  claimed: number;
}

export function calculateVestedAmount(
  schedule: VestingSchedule,
  currentTime: number
): {
  vested: number;
  claimable: number;
  locked: number;
} {
  const timeSinceStart = currentTime - schedule.startTime;
  
  // Check if cliff period has passed
  if (timeSinceStart < schedule.cliffDuration) {
    return {
      vested: 0,
      claimable: 0,
      locked: schedule.totalAmount,
    };
  }
  
  // Calculate vested amount
  const vestingProgress = Math.min(1, timeSinceStart / schedule.vestingDuration);
  const totalVested = schedule.totalAmount * vestingProgress;
  const claimable = totalVested - schedule.claimed;
  const locked = schedule.totalAmount - totalVested;
  
  return {
    vested: totalVested,
    claimable,
    locked,
  };
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

export function getStakingAPY(lockPeriod: StakingLockPeriod, rarityTier: string): number {
  const baseTier = STAKING_TIERS[lockPeriod];
  const multiplier = RARITY_MULTIPLIERS[rarityTier] || 1.0;
  return baseTier.baseAPY * multiplier;
}
