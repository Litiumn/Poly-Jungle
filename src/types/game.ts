// EcoForest Base — TypeScript Type Definitions

import type { TreeSpecies } from '@/lib/tree-models';

export type { TreeSpecies };

export type GrowthStage = 'seed' | 'sprout' | 'young' | 'mature' | 'ancient';

export type RarityTier = 
  | 'Common Grove'
  | 'Wildwood'
  | 'Sacred Canopy'
  | 'Elderbark'
  | 'Mythroot'
  | 'Celestial Bough'
  | 'Origin Tree';
export type MissionType = 'tutorial' | 'daily' | 'milestone' | 'streak' | 'social' | 'cooperative' | 'ecosystem';
export type LeaderboardCategory = 'top_ecoforests' | 'most_loved' | 'tree_collector' | 'rare_finds' | 'most_visited';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Tree {
  id: string;
  species: TreeSpecies;
  position: Vector3;
  plantedAt: number | null;
  growthStage: GrowthStage;
  wateredToday: boolean;
  lastWatered: number | null;
  rarityTier: RarityTier;
  ecoImpactKgCO2: number;
  isGroupTree?: boolean;
  groupId?: string;
  weedBonusUntil?: number;
  metadata?: Record<string, unknown>;
  visualSeed?: number; // Deterministic seed for visual appearance
  seed?: number; // Alias for backward compatibility
}

export interface Decoration {
  id: string;
  type: string;
  position: Vector3;
  rarityTier: RarityTier;
}

export interface TrashItem {
  id: string;
  position: Vector3;
  type: 'trash';
}

export interface WeedClump {
  id: string;
  position: Vector3;
  type: 'weed';
}

export interface Wallet {
  address: string;
  connected: boolean;
  forestBalance: number; // $FOREST governance token
  leafBalance: number; // $LEAF utility token (replaces ecoPoints)
  buildingLogs: number; // Crafting material
}

export interface Inventory {
  [itemId: string]: number;
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  goal: {
    action: string;
    target: number;
    external?: boolean;
  };
  reward: {
    ecoPoints: number;
    items?: string[];
    badge?: string;
  };
  repeatable: boolean;
  duration: string | null;
  mockTrigger?: string;
  currentProgress?: number;
  completed?: boolean;
  completedAt?: number;
  claimed?: boolean;
  claimedAt?: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  pooledEcoPoints: number;
  threshold: number;
  createdAt: number;
  contributors?: Record<string, number>;
  readyToPlant?: boolean;
  planted?: boolean;
  treeId?: string;
}

export interface NFT {
  tokenId: string;
  itemId: string;
  owner: string;
  mintedAt: number;
  metadata: {
    name: string;
    description: string;
    traits: Record<string, unknown>;
    image: string;
  };
  txHash: string;
}

export interface GameStats {
  totalTreesPlanted: number;
  totalTrashCleaned: number;
  totalTreesWatered: number;
  totalHeartsReceived: number;
  totalWeedsRemoved?: number;
  totalVisits?: number;
}

export interface Streak {
  count: number;
  lastLogin: number;
}

export interface StakedTree {
  treeId: string;
  stakedAt: number;
  lockPeriod: 'flexible' | '7days' | '30days' | '90days';
  unlockAt: number;
  lastClaimAt: number;
  accumulatedRewards: {
    forest: number;
    leaf: number;
  };
  tier: string;
  rarityMultiplier: number;
}

export interface GameState {
  userId: string;
  username: string;
  wallet: Wallet;
  ecoPoints: number; // Legacy - being phased out in favor of wallet.leafBalance
  trees: Tree[];
  decorations: Decoration[];
  inventory: Inventory;
  missions: Mission[];
  groups: Group[];
  mintedNFTs: NFT[];
  badges: string[];
  streak: Streak;
  stats: GameStats;
  visitCount: number;
  interactables: {
    trash: TrashItem[];
    weeds: WeedClump[];
  };
  lastDailyReset: number;
  tutorialCompleted: boolean;
  stakedTrees: StakedTree[]; // Staking system
  totalRewardsEarned: {
    forest: number;
    leaf: number;
  };
  // NEW V2 Tokenomics
  hasSeasonalPass?: boolean;
  dailyEarnings?: {
    leaf: number;
    forest: number;
    lastReset: number;
  };
  playerTier?: 'free_grower' | 'caretaker' | 'patron';
  friends?: string[]; // Array of friend user IDs
  bragGardenId?: string;
  showcaseEntries?: string[]; // Array of showcase entry IDs
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
}

export interface Rating {
  rating: number;
  timestamp: number;
}

export interface RatingsStorage {
  [key: string]: Rating;
}

export interface SpeciesConfig {
  youngHours: number;
  matureHours: number;
  ancientHours: number;
  ecoImpact: number;
  rarity: RarityTier;
  seedCost: number;
}

export interface SpeciesConfigs {
  [species: string]: SpeciesConfig;
}

export interface NFTCatalogItem {
  id: string;
  name: string;
  rarity: RarityTier;
  category: string;
  description: string;
  mintPrice: number;
  totalSupply: number;
  currentMinted: number;
  traits: Record<string, unknown>;
  imageReference: string;
  metadataURI: string;
}

export interface VisualAsset {
  id: string;
  filename: string;
  category: string;
  triBudget?: number;
  textureSize?: string;
  loadPriority: 'immediate' | 'deferred';
}
