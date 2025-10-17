/**
 * Self-Contained Storage — Demo/Prototype Storage System
 * 
 * This module provides a SELF-CONTAINED demo mode with:
 * - GameStateData type (extended with demo-specific fields)
 * - Mock API functions for testing without backend
 * - Sample forest generation
 * - Mission system
 * 
 * Architecture Decision:
 * - This coexists with storage.ts (production mode)
 * - Used for standalone demos, prototypes, and offline testing
 * - No external network calls or APIs
 * 
 * @see storage.ts for production storage system
 */

import type { TreeSpecies, GrowthStage } from '@/types/game';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}
export type Weather = 'sunny' | 'cloudy' | 'rain';
export type DecorationType = 'SmallFlower' | 'Bush' | 'Rock' | 'Bench' | 'Lantern' | 'Fence';

export interface TreeData {
  id: string;
  species: TreeSpecies;
  position: Vector3;
  plantedAt: number; // ISO timestamp
  lastWatered: number | null;
  growthStage: GrowthStage;
  wateringBonusPercent: number; // accumulated watering bonus
  isMinted: boolean; // NFT status
  mintedAt: number | null;
  // New seed system fields
  seedId?: string; // Link to seed from seed pack
  tier?: string; // Seed rarity tier
  // Visual diversity system
  visualSeed?: number; // Seed for procedural variation (ensures consistency)
}

export interface DecorationData {
  id: string;
  type: DecorationType;
  position: Vector3;
  placedAt: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'plant' | 'water' | 'clean' | 'visit';
  target: number;
  current: number;
  reward: {
    ecoPoints: number;
    decoration?: DecorationType;
  };
  completed: boolean;
  claimed: boolean;
}

export interface NFTData {
  treeId: string;
  tokenId: string;
  mintedAt: number;
  txHash: string;
}

export interface TrashData {
  id: string;
  position: Vector3;
}

export interface GameStateData {
  userId: string;
  username: string;
  walletAddress: string;
  ecoPoints: number;
  trees: TreeData[];
  decorations: DecorationData[];
  trash: TrashData[];
  inventory: {
    [species: string]: number; // seed counts (legacy)
  };
  stats: {
    treesPlanted: number;
    trashCleaned: number;
    treesWatered: number;
    nftsMinted: number;
    treesCut: number;
  };
  missions: Mission[];
  nfts: NFTData[];
  streak: {
    count: number;
    lastLogin: number;
  };
  lastDailyReset: number;
  tutorialCompleted: boolean;
  // New seed pack system
  seedPackState?: {
    ownedSeeds: Array<{
      id: string;
      tier: string;
      species: string;
      obtainedAt: number;
      planted: boolean;
    }>;
    packsOpened: number;
    totalSeedsObtained: number;
    lastPackOpenedAt: number | null;
  };
  // Building logs economy
  buildingLogs: number;
  // Furniture system
  furniturePackState?: {
    ownedFurniture: Array<{
      id: string;
      name: string;
      rarity: string;
      category: string;
      obtainedAt: number;
      placed: boolean;
      placedAt?: number;
      position?: { x: number; y: number; z: number };
      fromLimitedPack?: boolean;
    }>;
    packsOpened: number;
    totalFurnitureObtained: number;
    lastPackOpenedAt: number | null;
  };
}

export interface SampleForest {
  id: string;
  username: string;
  ecoPoints: number;
  trees: TreeData[];
  decorations: DecorationData[];
  rating: number; // average rating
  visits: number;
}

const STORAGE_KEY = 'ecoforest_self_contained';
const SAMPLE_KEY = 'ecoforest_sample_forests';

const SEED_COSTS: Partial<Record<TreeSpecies, number>> = {
  Oak: 50,
  Pine: 60,
  Cherry: 80,
  Baobab: 100,
  Mangrove: 90,
};

const DECORATION_COSTS: Record<DecorationType, number> = {
  SmallFlower: 20,
  Bush: 30,
  Rock: 25,
  Bench: 100,
  Lantern: 80,
  Fence: 40,
};

export function getDecorationCost(type: DecorationType): number {
  return DECORATION_COSTS[type];
}

export function canAffordDecoration(ecoPoints: number, type: DecorationType): boolean {
  return ecoPoints >= getDecorationCost(type);
}

export const DECORATION_INFO: Record<DecorationType, { name: string; emoji: string; description: string }> = {
  SmallFlower: { name: 'Small Flower', emoji: '🌸', description: 'A delicate blossom' },
  Bush: { name: 'Bush', emoji: '🌿', description: 'Lush greenery' },
  Rock: { name: 'Rock', emoji: '⛰️', description: 'Natural stone' },
  Bench: { name: 'Bench', emoji: '🪑', description: 'Rest spot' },
  Lantern: { name: 'Lantern', emoji: '🏮', description: 'Warm light' },
  Fence: { name: 'Fence', emoji: '🚧', description: 'Wooden barrier' },
};

const GROWTH_DURATIONS_HOURS: Partial<Record<TreeSpecies, { sprout: number; young: number; mature: number }>> = {
  Oak: { sprout: 0.5, young: 1, mature: 2 }, // Faster for demo
  Pine: { sprout: 0.5, young: 1, mature: 2 },
  Cherry: { sprout: 0.5, young: 1, mature: 2 },
  Baobab: { sprout: 0.5, young: 1, mature: 2 },
  Mangrove: { sprout: 0.5, young: 1, mature: 2 },
};

/**
 * Calculate growth stage based on planted time and watering bonus
 */
export function calculateGrowthStage(
  plantedAt: number,
  species: TreeSpecies,
  wateringBonusPercent: number,
  tier?: string
): GrowthStage {
  const now = Date.now();
  const elapsedHours = (now - plantedAt) / (1000 * 60 * 60);
  
  // Apply watering bonus (reduces time needed)
  const effectiveHours = elapsedHours * (1 + wateringBonusPercent / 100);
  
  // Get growth durations - use tier-based if available, otherwise species-based
  let durations: { sprout: number; young: number; mature: number };
  
  if (tier) {
    // Tier-based trees use getTierGrowthDuration
    // Import it dynamically to avoid circular dependency
    try {
      const { getTierGrowthDuration } = require('@/lib/seed-system');
      const tierDurations = getTierGrowthDuration(tier);
      durations = {
        sprout: tierDurations.sprout,
        young: tierDurations.young,
        mature: tierDurations.mature,
      };
    } catch {
      // Fallback to default durations if import fails
      durations = { sprout: 0.5, young: 1.0, mature: 2.0 };
    }
  } else {
    // Legacy species-based trees
    durations = GROWTH_DURATIONS_HOURS[species] || { sprout: 0.5, young: 1.0, mature: 2.0 };
  }
  
  // Safety check: ensure durations exists and has required properties
  if (!durations || typeof durations.sprout !== 'number') {
    durations = { sprout: 0.5, young: 1.0, mature: 2.0 };
  }
  
  if (effectiveHours < durations.sprout) return 'seed';
  if (effectiveHours < durations.young) return 'sprout';
  if (effectiveHours < durations.mature) return 'young';
  return 'mature';
}

/**
 * Safe array initialization helper
 */
function ensureArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

export function loadGameState(): GameStateData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('No saved state found, will initialize new game');
      return null;
    }
    
    let state: GameStateData;
    try {
      state = JSON.parse(data) as GameStateData;
    } catch (parseError) {
      console.error('JSON parse error, clearing corrupted data:', parseError);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Validate state structure and ensure all arrays exist
    if (!state || typeof state !== 'object') {
      console.error('Invalid state structure, clearing data');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Ensure all arrays are initialized (critical for safety)
    state.trees = ensureArray<TreeData>(state.trees);
    state.decorations = ensureArray<DecorationData>(state.decorations);
    state.trash = ensureArray<TrashData>(state.trash);
    state.missions = ensureArray<Mission>(state.missions);
    state.nfts = ensureArray<NFTData>(state.nfts);
    
    // Initialize missing properties
    if (!state.inventory || typeof state.inventory !== 'object') {
      state.inventory = {};
    }
    if (!state.stats || typeof state.stats !== 'object') {
      state.stats = {
        treesPlanted: 0,
        trashCleaned: 0,
        treesWatered: 0,
        nftsMinted: 0,
        treesCut: 0,
      };
    }
    if (typeof state.buildingLogs !== 'number') {
      state.buildingLogs = 0;
    }
    if (!state.streak || typeof state.streak !== 'object') {
      state.streak = { count: 1, lastLogin: Date.now() };
    }
    
    // Recompute growth stages on load with safety checks
    state.trees = state.trees.map((tree: TreeData) => {
      // Ensure tree has required properties
      const safeTree = {
        ...tree,
        growthStage: tree.growthStage || 'sprout',
        tier: tree.tier || undefined,
      };
      
      // Recalculate growth stage with tier parameter
      return {
        ...safeTree,
        growthStage: calculateGrowthStage(
          tree.plantedAt,
          tree.species,
          tree.wateringBonusPercent || 0,
          tree.tier
        ),
      };
    });
    
    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    return null;
  }
}

export function saveGameState(state: GameStateData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const jsonString = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('Failed to save game state:', error);
    // Try to recover from quota exceeded errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded, attempting to clear old data');
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (retryError) {
        console.error('Failed to save even after clearing:', retryError);
      }
    }
  }
}

export function initializeGameState(): GameStateData {
  const newState: GameStateData = {
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    username: 'EcoExplorer',
    walletAddress: '0x' + Math.random().toString(36).substr(2, 40).toUpperCase(),
    ecoPoints: 500, // Starting points for demo
    trees: [],
    decorations: [],
    trash: generateInitialTrash(),
    inventory: {
      Oak: 2,
      Pine: 2,
      Cherry: 1,
      Baobab: 1,
      Mangrove: 1,
    },
    stats: {
      treesPlanted: 0,
      trashCleaned: 0,
      treesWatered: 0,
      nftsMinted: 0,
      treesCut: 0,
    },
    buildingLogs: 0,
    missions: initializeMissions(),
    nfts: [],
    streak: {
      count: 1,
      lastLogin: Date.now(),
    },
    lastDailyReset: Date.now(),
    tutorialCompleted: false,
  };
  
  saveGameState(newState);
  initializeSampleForests();
  
  return newState;
}

function generateInitialTrash(): TrashData[] {
  const trash: TrashData[] = [];
  for (let i = 0; i < 5; i++) {
    trash.push({
      id: 'trash_' + i,
      position: {
        x: (Math.random() - 0.5) * 18,
        y: 0,
        z: (Math.random() - 0.5) * 18,
      },
    });
  }
  return trash;
}

function initializeMissions(): Mission[] {
  return [
    {
      id: 'mission_plant_1',
      title: 'First Planting',
      description: 'Plant your first tree',
      type: 'plant',
      target: 1,
      current: 0,
      reward: { ecoPoints: 50, decoration: 'SmallFlower' },
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_water_5',
      title: 'Dedicated Gardener',
      description: 'Water trees 5 times',
      type: 'water',
      target: 5,
      current: 0,
      reward: { ecoPoints: 100 },
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_clean_10',
      title: 'Clean Environment',
      description: 'Remove 10 pieces of trash',
      type: 'clean',
      target: 10,
      current: 0,
      reward: { ecoPoints: 150, decoration: 'Bench' },
      completed: false,
      claimed: false,
    },
  ];
}

export function loadSampleForests(): SampleForest[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(SAMPLE_KEY);
    if (!data) return [];
    
    try {
      const forests = JSON.parse(data);
      return Array.isArray(forests) ? forests : [];
    } catch (parseError) {
      console.error('JSON parse error for sample forests:', parseError);
      localStorage.removeItem(SAMPLE_KEY);
      return [];
    }
  } catch (error) {
    console.error('Failed to load sample forests:', error);
    return [];
  }
}

function initializeSampleForests(): void {
  const sampleForests: SampleForest[] = [
    {
      id: 'forest_alice',
      username: 'Alice',
      ecoPoints: 1250,
      trees: [
        {
          id: 't1',
          species: 'Oak',
          position: { x: -3, y: 0, z: -3 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 10,
          lastWatered: Date.now() - 1000 * 60 * 60 * 2,
          growthStage: 'mature',
          wateringBonusPercent: 20,
        },
        {
          id: 't2',
          species: 'Cherry',
          position: { x: 3, y: 0, z: -3 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 8,
          lastWatered: Date.now() - 1000 * 60 * 60 * 1,
          growthStage: 'young',
          wateringBonusPercent: 15,
        },
      ],
      decorations: [],
      rating: 4.5,
      visits: 12,
    },
    {
      id: 'forest_bob',
      username: 'Bob',
      ecoPoints: 890,
      trees: [
        {
          id: 't3',
          species: 'Pine',
          position: { x: 0, y: 0, z: 0 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 15,
          lastWatered: Date.now() - 1000 * 60 * 60 * 5,
          growthStage: 'mature',
          wateringBonusPercent: 25,
        },
      ],
      decorations: [],
      rating: 4.0,
      visits: 8,
    },
    {
      id: 'forest_charlie',
      username: 'Charlie',
      ecoPoints: 1560,
      trees: [
        {
          id: 't4',
          species: 'Baobab',
          position: { x: -4, y: 0, z: 2 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 20,
          lastWatered: Date.now() - 1000 * 60 * 60 * 3,
          growthStage: 'mature',
          wateringBonusPercent: 30,
        },
        {
          id: 't5',
          species: 'Mangrove',
          position: { x: 4, y: 0, z: 2 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 12,
          lastWatered: null,
          growthStage: 'young',
          wateringBonusPercent: 10,
        },
        {
          id: 't6',
          species: 'Oak',
          position: { x: 0, y: 0, z: -5 },
          plantedAt: Date.now() - 1000 * 60 * 60 * 6,
          lastWatered: Date.now() - 1000 * 60 * 60 * 1,
          growthStage: 'sprout',
          wateringBonusPercent: 5,
        },
      ],
      decorations: [],
      rating: 4.8,
      visits: 23,
    },
  ];
  
  localStorage.setItem(SAMPLE_KEY, JSON.stringify(sampleForests));
}

export function getSeedCost(species: TreeSpecies): number {
  return SEED_COSTS[species] || 50; // Default cost if species not in map
}

export function canAffordSeed(ecoPoints: number, species: TreeSpecies): boolean {
  return ecoPoints >= getSeedCost(species);
}

/**
 * Get the number of likes received by a forest
 */
function getLikesReceived(state: GameStateData): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const data = localStorage.getItem('ecoforest_friend_forests');
    if (!data) return 0;
    
    const forests = JSON.parse(data);
    if (!Array.isArray(forests)) return 0;
    
    const forest = forests.find((f: { id: string; liked: boolean }) => f.id === state.userId);
    return forest && forest.liked ? 1 : 0;
  } catch (error) {
    console.error('Failed to get likes received:', error);
    return 0;
  }
}

/**
 * Mock API functions (all local, no network calls)
 */
export const mockAPI = {
  walletConnect(): { address: string; connected: boolean } {
    return {
      address: '0x' + Math.random().toString(36).substr(2, 40).toUpperCase(),
      connected: true,
    };
  },
  
  mintNFT(treeId: string): { success: boolean; txHash: string; tokenId: string } {
    return {
      success: true,
      txHash: '0x' + Math.random().toString(36).substr(2, 64),
      tokenId: 'NFT_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
  },
  
  computeLeaderboard(allForests: Array<{ username: string; state: GameStateData }>): Array<{ username: string; score: number; rank: number }> {
    const scores = allForests.map(f => ({
      username: f.username,
      score: this.calculateEcoScore(f.state),
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    return scores.map((s, i) => ({ ...s, rank: i + 1 }));
  },
  
  calculateEcoScore(state: GameStateData): number {
    // Safe array access with defaults
    const trees = Array.isArray(state.trees) ? state.trees : [];
    const decorations = Array.isArray(state.decorations) ? state.decorations : [];
    
    // Updated formula: (treeCount * 3) + (decorations * 2) + (likesReceived * 5)
    const treeCount = trees.length;
    const decorationCount = decorations.length;
    const likesReceived = getLikesReceived(state);
    
    const score =
      treeCount * 3 +
      decorationCount * 2 +
      likesReceived * 5;
    
    return Math.round(score);
  },
};
