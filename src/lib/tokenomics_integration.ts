/**
 * Tokenomics V2 Integration with Game State
 * Bridges V2 tokenomics system with existing game mechanics
 */

import type { GameState } from '@/types/game';
import {
  getPlayerTier,
  checkDailyEarningCap,
  calculateActivityRewards,
  DAILY_EARNING_CAPS,
  type PlayerTier,
} from './tokenomics-v2';
import { saveGameState } from './storage';

// ============================================================
// DAILY EARNINGS TRACKING
// ============================================================

export function initializeDailyEarnings(gameState: GameState): void {
  if (!gameState.dailyEarnings) {
    gameState.dailyEarnings = {
      leaf: 0,
      forest: 0,
      lastReset: Date.now(),
    };
  }
}

export function checkDailyReset(gameState: GameState): void {
  if (!gameState.dailyEarnings) {
    initializeDailyEarnings(gameState);
    return;
  }

  const now = Date.now();
  const lastReset = new Date(gameState.dailyEarnings.lastReset);
  const today = new Date(now);

  if (lastReset.toDateString() !== today.toDateString()) {
    // Reset daily earnings
    gameState.dailyEarnings = {
      leaf: 0,
      forest: 0,
      lastReset: now,
    };
  }
}

export function rewardActivity(
  gameState: GameState,
  activity: string
): {
  success: boolean;
  rewards: { leaf: number; forest: number };
  cappedOut: boolean;
  message: string;
} {
  initializeDailyEarnings(gameState);
  checkDailyReset(gameState);

  const tier = getPlayerTier(gameState);
  const baseRewards = calculateActivityRewards(activity, tier);

  // Check if already at daily cap
  const earnedToday = gameState.dailyEarnings!;
  const capCheck = checkDailyEarningCap(gameState, earnedToday);

  let actualLeaf = baseRewards.leaf;
  let actualForest = baseRewards.forest;
  let cappedOut = false;

  // Apply daily caps
  if (earnedToday.leaf + baseRewards.leaf > capCheck.leafRemaining + earnedToday.leaf) {
    actualLeaf = capCheck.leafRemaining;
    cappedOut = true;
  }

  if (earnedToday.forest + baseRewards.forest > capCheck.forestRemaining + earnedToday.forest) {
    actualForest = capCheck.forestRemaining;
    cappedOut = true;
  }

  if (actualLeaf <= 0 && actualForest <= 0) {
    return {
      success: false,
      rewards: { leaf: 0, forest: 0 },
      cappedOut: true,
      message: `Daily earning cap reached! Come back tomorrow 🌅`,
    };
  }

  // Apply rewards
  gameState.wallet.leafBalance += actualLeaf;
  gameState.wallet.forestBalance += actualForest;
  gameState.dailyEarnings!.leaf += actualLeaf;
  gameState.dailyEarnings!.forest += actualForest;

  // Also update total rewards earned
  gameState.totalRewardsEarned.leaf += actualLeaf;
  gameState.totalRewardsEarned.forest += actualForest;

  saveGameState(gameState);

  return {
    success: true,
    rewards: { leaf: actualLeaf, forest: actualForest },
    cappedOut,
    message: cappedOut
      ? `Earned ${actualLeaf.toFixed(1)} 🍃 and ${actualForest.toFixed(2)} 🌲 (Daily cap reached!)`
      : `Your forest loves this care! +${actualLeaf.toFixed(1)} 🍃 +${actualForest.toFixed(2)} 🌲`,
  };
}

// ============================================================
// PLAYER TIER MANAGEMENT
// ============================================================

export function updatePlayerTier(gameState: GameState): PlayerTier {
  const tier = getPlayerTier(gameState);
  gameState.playerTier = tier;
  saveGameState(gameState);
  return tier;
}

export function getDailyEarningInfo(gameState: GameState): {
  earnedToday: { leaf: number; forest: number };
  caps: { leaf: number; forest: number };
  remaining: { leaf: number; forest: number };
  percentUsed: { leaf: number; forest: number };
} {
  initializeDailyEarnings(gameState);
  checkDailyReset(gameState);

  const tier = getPlayerTier(gameState);
  const caps = DAILY_EARNING_CAPS[tier];
  const earnedToday = gameState.dailyEarnings!;

  return {
    earnedToday: { leaf: earnedToday.leaf, forest: earnedToday.forest },
    caps,
    remaining: {
      leaf: Math.max(0, caps.leaf - earnedToday.leaf),
      forest: Math.max(0, caps.forest - earnedToday.forest),
    },
    percentUsed: {
      leaf: Math.min(100, (earnedToday.leaf / caps.leaf) * 100),
      forest: Math.min(100, (earnedToday.forest / caps.forest) * 100),
    },
  };
}

// ============================================================
// WOOD HARVESTING (from mature trees)
// ============================================================

export function harvestWood(gameState: GameState, treeId: string): {
  success: boolean;
  amount: number;
  message: string;
} {
  const tree = gameState.trees.find((t) => t.id === treeId);

  if (!tree) {
    return { success: false, amount: 0, message: 'Tree not found' };
  }

  if (tree.growthStage !== 'mature' && tree.growthStage !== 'ancient') {
    return {
      success: false,
      amount: 0,
      message: 'Tree must be mature or ancient to harvest wood',
    };
  }

  // Ancient trees give more wood
  const woodAmount = tree.growthStage === 'ancient' ? 3 : 1;
  gameState.wallet.buildingLogs += woodAmount;

  // Remove the tree after harvesting
  const treeIndex = gameState.trees.findIndex((t) => t.id === treeId);
  if (treeIndex !== -1) {
    gameState.trees.splice(treeIndex, 1);
  }

  saveGameState(gameState);

  return {
    success: true,
    amount: woodAmount,
    message: `Harvested ${woodAmount} 🪵 Building Logs`,
  };
}

// ============================================================
// SEASONAL PASS
// ============================================================

export function purchaseSeasonalPass(gameState: GameState): {
  success: boolean;
  message: string;
} {
  // In production, this would integrate with payment system
  // For now, just mock the purchase
  gameState.hasSeasonalPass = true;
  updatePlayerTier(gameState);

  return {
    success: true,
    message: 'Welcome, Patron! 🌳 Enjoy your exclusive benefits!',
  };
}

// ============================================================
// MIGRATION HELPER (V1 to V2)
// ============================================================

export function migrateToV2Tokenomics(gameState: GameState): void {
  // Initialize new fields if they don't exist
  if (!gameState.dailyEarnings) {
    initializeDailyEarnings(gameState);
  }

  if (!gameState.playerTier) {
    gameState.playerTier = getPlayerTier(gameState);
  }

  if (!gameState.hasSeasonalPass) {
    gameState.hasSeasonalPass = false;
  }

  if (!gameState.friends) {
    gameState.friends = [];
  }

  if (!gameState.showcaseEntries) {
    gameState.showcaseEntries = [];
  }

  // Migrate ecoPoints to leafBalance if needed
  if (gameState.ecoPoints > 0 && gameState.wallet.leafBalance === 0) {
    gameState.wallet.leafBalance = gameState.ecoPoints;
  }

  saveGameState(gameState);
}
