/**
 * Seed Pack and Rarity System
 * 
 * Complete seed pack mechanics with weighted rarity drops
 * and tier-based seed progression system.
 */

export type SeedTier = 
  | 'Common Grove'
  | 'Wildwood'
  | 'Sacred Canopy'
  | 'Elderbark'
  | 'Mythroot'
  | 'Celestial Bough'
  | 'Origin Tree';

export type PackType = 'Basic' | 'Premium' | 'Limited';

export interface SeedData {
  id: string;
  tier: SeedTier;
  species: string;
  obtainedAt: number;
  planted: boolean;
}

export interface SeedPackDefinition {
  type: PackType;
  name: string;
  cost: number;
  seedCount: number;
  description: string;
  emoji: string;
  dropRates: Record<SeedTier, number>;
  isLimited?: boolean;
  limitedUntil?: number;
}

export interface SeedPackState {
  ownedSeeds: SeedData[];
  packsOpened: number;
  totalSeedsObtained: number;
  lastPackOpenedAt: number | null;
}

// Tier information with visual metadata
export const SEED_TIER_INFO: Record<SeedTier, {
  emoji: string;
  color: string;
  glowColor: string;
  growthSpeedMultiplier: number;
  ecoPointYield: number;
  description: string;
  rarity: number;
}> = {
  'Common Grove': {
    emoji: '🌱',
    color: '#7cb342',
    glowColor: '#8bc34a',
    growthSpeedMultiplier: 1.0,
    ecoPointYield: 2,
    description: 'A humble beginning',
    rarity: 1,
  },
  'Wildwood': {
    emoji: '🌿',
    color: '#66bb6a',
    glowColor: '#81c784',
    growthSpeedMultiplier: 0.95,
    ecoPointYield: 3,
    description: 'Nature\'s resilience',
    rarity: 2,
  },
  'Sacred Canopy': {
    emoji: '🌳',
    color: '#4caf50',
    glowColor: '#66bb6a',
    growthSpeedMultiplier: 0.90,
    ecoPointYield: 5,
    description: 'Blessed by the forest',
    rarity: 3,
  },
  'Elderbark': {
    emoji: '🌲',
    color: '#2e7d32',
    glowColor: '#43a047',
    growthSpeedMultiplier: 0.85,
    ecoPointYield: 8,
    description: 'Ancient wisdom',
    rarity: 4,
  },
  'Mythroot': {
    emoji: '✨',
    color: '#9c27b0',
    glowColor: '#ba68c8',
    growthSpeedMultiplier: 0.80,
    ecoPointYield: 12,
    description: 'Touched by magic',
    rarity: 5,
  },
  'Celestial Bough': {
    emoji: '🌌',
    color: '#3f51b5',
    glowColor: '#5c6bc0',
    growthSpeedMultiplier: 0.75,
    ecoPointYield: 20,
    description: 'Starlight incarnate',
    rarity: 6,
  },
  'Origin Tree': {
    emoji: '🕊️',
    color: '#ffd700',
    glowColor: '#ffeb3b',
    growthSpeedMultiplier: 0.70,
    ecoPointYield: 35,
    description: 'The first seed',
    rarity: 7,
  },
};

// Pack definitions with different drop rates
export const PACK_DEFINITIONS: Record<PackType, SeedPackDefinition> = {
  Basic: {
    type: 'Basic',
    name: 'Basic Seed Pack',
    cost: 100,
    seedCount: 3,
    description: 'A starter pack with common seeds',
    emoji: '📦',
    dropRates: {
      'Common Grove': 0.40,
      'Wildwood': 0.25,
      'Sacred Canopy': 0.15,
      'Elderbark': 0.10,
      'Mythroot': 0.06,
      'Celestial Bough': 0.03,
      'Origin Tree': 0.01,
    },
  },
  Premium: {
    type: 'Premium',
    name: 'Premium Seed Pack',
    cost: 250,
    seedCount: 5,
    description: 'Better odds for rare seeds',
    emoji: '🎁',
    dropRates: {
      'Common Grove': 0.25,
      'Wildwood': 0.25,
      'Sacred Canopy': 0.20,
      'Elderbark': 0.15,
      'Mythroot': 0.10,
      'Celestial Bough': 0.04,
      'Origin Tree': 0.01,
    },
  },
  Limited: {
    type: 'Limited',
    name: 'Limited Edition Pack',
    cost: 500,
    seedCount: 7,
    description: 'Exclusive pack with boosted legendary rates',
    emoji: '🌟',
    isLimited: true,
    limitedUntil: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    dropRates: {
      'Common Grove': 0.15,
      'Wildwood': 0.20,
      'Sacred Canopy': 0.20,
      'Elderbark': 0.20,
      'Mythroot': 0.15,
      'Celestial Bough': 0.08,
      'Origin Tree': 0.02,
    },
  },
};

/**
 * Roll a random seed tier based on weighted probabilities
 */
export function rollSeedTier(dropRates: Record<SeedTier, number>): SeedTier {
  const random = Math.random();
  let cumulative = 0;
  
  for (const tier of Object.keys(dropRates) as SeedTier[]) {
    cumulative += dropRates[tier];
    if (random <= cumulative) {
      return tier;
    }
  }
  
  // Fallback to Common Grove (should never happen with proper rates)
  return 'Common Grove';
}

/**
 * Open a seed pack and return the rolled seeds
 */
export function openSeedPack(packType: PackType): SeedData[] {
  const pack = PACK_DEFINITIONS[packType];
  const seeds: SeedData[] = [];
  
  for (let i = 0; i < pack.seedCount; i++) {
    const tier = rollSeedTier(pack.dropRates);
    const seed: SeedData = {
      id: 'seed_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 9),
      tier,
      species: generateSpeciesName(tier),
      obtainedAt: Date.now(),
      planted: false,
    };
    seeds.push(seed);
  }
  
  return seeds;
}

/**
 * Generate a species name based on tier (matches tree-models.ts definitions)
 */
function generateSpeciesName(tier: SeedTier): string {
  const speciesByTier: Record<SeedTier, string[]> = {
    'Common Grove': ['Oak', 'Pine', 'Maple', 'Birch', 'Spruce', 'Alder', 'Elm', 'Willow'],
    'Wildwood': ['Douglas Fir', 'Chestnut', 'Sassafras', 'Hemlock', 'Aspen', 'Black Walnut', 'Sweetgum'],
    'Sacred Canopy': ['Banyan', 'Bodhi', 'Yew', 'Cedar of Lebanon', 'Olive', 'Ginkgo'],
    'Elderbark': ['Giant Sequoia', 'Bristlecone Pine', 'Monkey Puzzle', 'Baobab', 'Dragon\'s Blood'],
    'Mythroot': ['Yggdrasil Sapling', 'Ironwood', 'Ghostwood', 'Dreamroot'],
    'Celestial Bough': ['Starwillow', 'Moonshade', 'Nebulark'],
    'Origin Tree': ['Genesis Oak', 'Primeval Heartwood'],
  };
  
  const names = speciesByTier[tier];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Check if a seed is rare enough to require onchain minting (Mythroot+)
 */
export function requiresOnchainMint(tier: SeedTier): boolean {
  return ['Mythroot', 'Celestial Bough', 'Origin Tree'].includes(tier);
}

/**
 * Get tier info with safety fallback
 */
export function getTierInfo(tier?: string) {
  const defaultTier = {
    emoji: '🌱',
    color: '#7cb342',
    glowColor: '#8bc34a',
    growthSpeedMultiplier: 1.0,
    ecoPointYield: 2,
    description: 'A humble beginning',
    rarity: 1,
  };
  
  if (!tier) return defaultTier;
  
  return SEED_TIER_INFO[tier as SeedTier] || defaultTier;
}

/**
 * Calculate growth duration based on tier
 */
export function getTierGrowthDuration(tier: SeedTier): {
  seed: number;
  sprout: number;
  young: number;
  mature: number;
} {
  // Safety check: ensure tier exists in SEED_TIER_INFO
  const tierInfo = SEED_TIER_INFO[tier] || SEED_TIER_INFO['Common Grove'];
  const multiplier = tierInfo.growthSpeedMultiplier;
  
  // Base durations in hours
  const base = {
    seed: 0,
    sprout: 0.5,
    young: 1.0,
    mature: 2.0,
  };
  
  // Apply multiplier (lower = faster growth for higher tiers)
  return {
    seed: base.seed,
    sprout: base.sprout / multiplier,
    young: base.young / multiplier,
    mature: base.mature / multiplier,
  };
}

/**
 * Get seed pack state from localStorage
 */
export function loadSeedPackState(): SeedPackState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem('ecoforest_seed_packs');
    if (!data) return null;
    
    const state = JSON.parse(data) as SeedPackState;
    
    // Validate structure
    if (!state || typeof state !== 'object') return null;
    if (!Array.isArray(state.ownedSeeds)) return null;
    
    return state;
  } catch (error) {
    console.error('Failed to load seed pack state:', error);
    return null;
  }
}

/**
 * Save seed pack state to localStorage
 */
export function saveSeedPackState(state: SeedPackState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('ecoforest_seed_packs', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save seed pack state:', error);
  }
}

/**
 * Initialize seed pack state (first time setup)
 */
export function initializeSeedPackState(): SeedPackState {
  const state: SeedPackState = {
    ownedSeeds: [],
    packsOpened: 0,
    totalSeedsObtained: 0,
    lastPackOpenedAt: null,
  };
  
  saveSeedPackState(state);
  return state;
}
