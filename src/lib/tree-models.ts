/**
 * Tree Models & Visual System
 * 
 * Complete tree visual definitions for all 35 species across 7 rarity tiers.
 * Each tree has unique visual properties and model variants.
 */

import type { SeedTier } from '@/lib/seed-system';

export type TreeSpecies =
  // Common Grove (8)
  | 'Oak' | 'Pine' | 'Maple' | 'Birch' | 'Spruce' | 'Alder' | 'Elm' | 'Willow'
  // Wildwood (7)
  | 'Douglas Fir' | 'Chestnut' | 'Sassafras' | 'Hemlock' | 'Aspen' | 'Black Walnut' | 'Sweetgum'
  // Sacred Canopy (6)
  | 'Banyan' | 'Bodhi' | 'Yew' | 'Cedar of Lebanon' | 'Olive' | 'Ginkgo'
  // Elderbark (5)
  | 'Giant Sequoia' | 'Bristlecone Pine' | 'Monkey Puzzle' | 'Baobab' | 'Dragon\'s Blood'
  // Mythroot (4)
  | 'Yggdrasil Sapling' | 'Ironwood' | 'Ghostwood' | 'Dreamroot'
  // Celestial Bough (3)
  | 'Starwillow' | 'Moonshade' | 'Nebulark'
  // Origin Tree (2)
  | 'Genesis Oak' | 'Primeval Heartwood';

export type FoliageShape = 'sphere' | 'cone' | 'cloud' | 'oval' | 'star' | 'wide' | 'tall';

export interface TreeModelDefinition {
  species: TreeSpecies;
  tier: SeedTier;
  foliageShape: FoliageShape;
  trunkColor: string;
  foliageColor: string;
  secondaryFoliageColor?: string;
  hasGlow: boolean;
  glowIntensity: number;
  modelVariants?: string[]; // For future GLB model support
  description: string;
}

// Rarity-based color system
export const RARITY_COLORS: Record<SeedTier, { primary: string; glow: string; accent: string }> = {
  'Common Grove': {
    primary: '#8BC34A',
    glow: '#9CCC65',
    accent: '#7CB342',
  },
  'Wildwood': {
    primary: '#2196F3',
    glow: '#42A5F5',
    accent: '#1976D2',
  },
  'Sacred Canopy': {
    primary: '#9C27B0',
    glow: '#AB47BC',
    accent: '#7B1FA2',
  },
  'Elderbark': {
    primary: '#FFC107',
    glow: '#FFD54F',
    accent: '#FFA000',
  },
  'Mythroot': {
    primary: '#00BCD4',
    glow: '#26C6DA',
    accent: '#0097A7',
  },
  'Celestial Bough': {
    primary: '#E0E0E0',
    glow: '#EEEEEE',
    accent: '#BDBDBD',
  },
  'Origin Tree': {
    primary: '#FFD700',
    glow: '#FFEB3B',
    accent: '#FFC107',
  },
};

// Complete tree definitions for all 35 species
export const TREE_MODELS: Record<TreeSpecies, TreeModelDefinition> = {
  // === COMMON GROVE (8) ===
  'Oak': {
    species: 'Oak',
    tier: 'Common Grove',
    foliageShape: 'sphere',
    trunkColor: '#6B4423',
    foliageColor: '#7CB342',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A sturdy oak tree with round canopy',
  },
  'Pine': {
    species: 'Pine',
    tier: 'Common Grove',
    foliageShape: 'cone',
    trunkColor: '#5D4037',
    foliageColor: '#558B2F',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A conical evergreen pine',
  },
  'Maple': {
    species: 'Maple',
    tier: 'Common Grove',
    foliageShape: 'oval',
    trunkColor: '#795548',
    foliageColor: '#FF8A65',
    secondaryFoliageColor: '#FFAB91',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A maple tree with autumn-colored leaves',
  },
  'Birch': {
    species: 'Birch',
    tier: 'Common Grove',
    foliageShape: 'oval',
    trunkColor: '#EEEEEE',
    foliageColor: '#9CCC65',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A birch tree with distinctive white bark',
  },
  'Spruce': {
    species: 'Spruce',
    tier: 'Common Grove',
    foliageShape: 'cone',
    trunkColor: '#4E342E',
    foliageColor: '#4CAF50',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A tall spruce with needle-like foliage',
  },
  'Alder': {
    species: 'Alder',
    tier: 'Common Grove',
    foliageShape: 'cloud',
    trunkColor: '#6D4C41',
    foliageColor: '#689F38',
    hasGlow: false,
    glowIntensity: 0,
    description: 'An alder tree with cloud-like canopy',
  },
  'Elm': {
    species: 'Elm',
    tier: 'Common Grove',
    foliageShape: 'wide',
    trunkColor: '#5D4037',
    foliageColor: '#8BC34A',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A wide-spreading elm tree',
  },
  'Willow': {
    species: 'Willow',
    tier: 'Common Grove',
    foliageShape: 'tall',
    trunkColor: '#8D6E63',
    foliageColor: '#9CCC65',
    secondaryFoliageColor: '#C5E1A5',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A graceful weeping willow',
  },

  // === WILDWOOD (7) ===
  'Douglas Fir': {
    species: 'Douglas Fir',
    tier: 'Wildwood',
    foliageShape: 'cone',
    trunkColor: '#5D4037',
    foliageColor: '#1976D2',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A towering Douglas fir',
  },
  'Chestnut': {
    species: 'Chestnut',
    tier: 'Wildwood',
    foliageShape: 'sphere',
    trunkColor: '#6D4C41',
    foliageColor: '#2196F3',
    secondaryFoliageColor: '#42A5F5',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A chestnut tree with rich blue-green foliage',
  },
  'Sassafras': {
    species: 'Sassafras',
    tier: 'Wildwood',
    foliageShape: 'cloud',
    trunkColor: '#8D6E63',
    foliageColor: '#1E88E5',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A fragrant sassafras tree',
  },
  'Hemlock': {
    species: 'Hemlock',
    tier: 'Wildwood',
    foliageShape: 'cone',
    trunkColor: '#4E342E',
    foliageColor: '#1976D2',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A graceful hemlock evergreen',
  },
  'Aspen': {
    species: 'Aspen',
    tier: 'Wildwood',
    foliageShape: 'oval',
    trunkColor: '#FAFAFA',
    foliageColor: '#64B5F6',
    secondaryFoliageColor: '#90CAF9',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A quaking aspen with shimmering leaves',
  },
  'Black Walnut': {
    species: 'Black Walnut',
    tier: 'Wildwood',
    foliageShape: 'wide',
    trunkColor: '#3E2723',
    foliageColor: '#2196F3',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A majestic black walnut tree',
  },
  'Sweetgum': {
    species: 'Sweetgum',
    tier: 'Wildwood',
    foliageShape: 'star',
    trunkColor: '#6D4C41',
    foliageColor: '#42A5F5',
    secondaryFoliageColor: '#64B5F6',
    hasGlow: false,
    glowIntensity: 0,
    description: 'A sweetgum with star-shaped leaves',
  },

  // === SACRED CANOPY (6) ===
  'Banyan': {
    species: 'Banyan',
    tier: 'Sacred Canopy',
    foliageShape: 'wide',
    trunkColor: '#8D6E63',
    foliageColor: '#7B1FA2',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'A sacred banyan tree with aerial roots',
  },
  'Bodhi': {
    species: 'Bodhi',
    tier: 'Sacred Canopy',
    foliageShape: 'cloud',
    trunkColor: '#795548',
    foliageColor: '#9C27B0',
    secondaryFoliageColor: '#AB47BC',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'The sacred Bodhi tree of enlightenment',
  },
  'Yew': {
    species: 'Yew',
    tier: 'Sacred Canopy',
    foliageShape: 'cone',
    trunkColor: '#4E342E',
    foliageColor: '#8E24AA',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'An ancient yew tree steeped in mystery',
  },
  'Cedar of Lebanon': {
    species: 'Cedar of Lebanon',
    tier: 'Sacred Canopy',
    foliageShape: 'wide',
    trunkColor: '#6D4C41',
    foliageColor: '#9C27B0',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'A legendary cedar from ancient lands',
  },
  'Olive': {
    species: 'Olive',
    tier: 'Sacred Canopy',
    foliageShape: 'sphere',
    trunkColor: '#A1887F',
    foliageColor: '#BA68C8',
    secondaryFoliageColor: '#CE93D8',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'A sacred olive tree symbolizing peace',
  },
  'Ginkgo': {
    species: 'Ginkgo',
    tier: 'Sacred Canopy',
    foliageShape: 'star',
    trunkColor: '#8D6E63',
    foliageColor: '#AB47BC',
    secondaryFoliageColor: '#BA68C8',
    hasGlow: true,
    glowIntensity: 0.2,
    description: 'A living fossil with fan-shaped leaves',
  },

  // === ELDERBARK (5) ===
  'Giant Sequoia': {
    species: 'Giant Sequoia',
    tier: 'Elderbark',
    foliageShape: 'tall',
    trunkColor: '#5D4037',
    foliageColor: '#FFA000',
    hasGlow: true,
    glowIntensity: 0.3,
    description: 'A colossal sequoia touching the sky',
  },
  'Bristlecone Pine': {
    species: 'Bristlecone Pine',
    tier: 'Elderbark',
    foliageShape: 'cone',
    trunkColor: '#6D4C41',
    foliageColor: '#FFB300',
    hasGlow: true,
    glowIntensity: 0.3,
    description: 'One of Earth\'s oldest living organisms',
  },
  'Monkey Puzzle': {
    species: 'Monkey Puzzle',
    tier: 'Elderbark',
    foliageShape: 'star',
    trunkColor: '#5D4037',
    foliageColor: '#FFC107',
    secondaryFoliageColor: '#FFD54F',
    hasGlow: true,
    glowIntensity: 0.3,
    description: 'An ancient conifer with distinctive scales',
  },
  'Baobab': {
    species: 'Baobab',
    tier: 'Elderbark',
    foliageShape: 'cloud',
    trunkColor: '#A1887F',
    foliageColor: '#FFB300',
    hasGlow: true,
    glowIntensity: 0.3,
    description: 'The legendary upside-down tree',
  },
  'Dragon\'s Blood': {
    species: 'Dragon\'s Blood',
    tier: 'Elderbark',
    foliageShape: 'sphere',
    trunkColor: '#8D6E63',
    foliageColor: '#FF6F00',
    secondaryFoliageColor: '#FF8F00',
    hasGlow: true,
    glowIntensity: 0.4,
    description: 'A mystical tree with crimson sap',
  },

  // === MYTHROOT (4) ===
  'Yggdrasil Sapling': {
    species: 'Yggdrasil Sapling',
    tier: 'Mythroot',
    foliageShape: 'wide',
    trunkColor: '#6D4C41',
    foliageColor: '#0097A7',
    secondaryFoliageColor: '#00ACC1',
    hasGlow: true,
    glowIntensity: 0.5,
    description: 'A sapling of the world tree',
  },
  'Ironwood': {
    species: 'Ironwood',
    tier: 'Mythroot',
    foliageShape: 'sphere',
    trunkColor: '#424242',
    foliageColor: '#00BCD4',
    hasGlow: true,
    glowIntensity: 0.5,
    description: 'A tree with bark harder than steel',
  },
  'Ghostwood': {
    species: 'Ghostwood',
    tier: 'Mythroot',
    foliageShape: 'cloud',
    trunkColor: '#EEEEEE',
    foliageColor: '#26C6DA',
    secondaryFoliageColor: '#4DD0E1',
    hasGlow: true,
    glowIntensity: 0.6,
    description: 'A spectral tree that glows in moonlight',
  },
  'Dreamroot': {
    species: 'Dreamroot',
    tier: 'Mythroot',
    foliageShape: 'star',
    trunkColor: '#9C27B0',
    foliageColor: '#00E5FF',
    secondaryFoliageColor: '#18FFFF',
    hasGlow: true,
    glowIntensity: 0.6,
    description: 'A tree from the realm of dreams',
  },

  // === CELESTIAL BOUGH (3) ===
  'Starwillow': {
    species: 'Starwillow',
    tier: 'Celestial Bough',
    foliageShape: 'tall',
    trunkColor: '#EEEEEE',
    foliageColor: '#F5F5F5',
    secondaryFoliageColor: '#FAFAFA',
    hasGlow: true,
    glowIntensity: 0.7,
    description: 'A willow woven from starlight',
  },
  'Moonshade': {
    species: 'Moonshade',
    tier: 'Celestial Bough',
    foliageShape: 'sphere',
    trunkColor: '#E0E0E0',
    foliageColor: '#EEEEEE',
    secondaryFoliageColor: '#F5F5F5',
    hasGlow: true,
    glowIntensity: 0.8,
    description: 'A tree that casts moonlight shadows',
  },
  'Nebulark': {
    species: 'Nebulark',
    tier: 'Celestial Bough',
    foliageShape: 'cloud',
    trunkColor: '#BDBDBD',
    foliageColor: '#FAFAFA',
    secondaryFoliageColor: '#FFFFFF',
    hasGlow: true,
    glowIntensity: 0.9,
    description: 'A tree born from cosmic clouds',
  },

  // === ORIGIN TREE (2) ===
  'Genesis Oak': {
    species: 'Genesis Oak',
    tier: 'Origin Tree',
    foliageShape: 'wide',
    trunkColor: '#6D4C41',
    foliageColor: '#FFD700',
    secondaryFoliageColor: '#FFEB3B',
    hasGlow: true,
    glowIntensity: 1.0,
    description: 'The first oak, mother of all forests',
  },
  'Primeval Heartwood': {
    species: 'Primeval Heartwood',
    tier: 'Origin Tree',
    foliageShape: 'sphere',
    trunkColor: '#5D4037',
    foliageColor: '#FFC107',
    secondaryFoliageColor: '#FFD54F',
    hasGlow: true,
    glowIntensity: 1.0,
    description: 'The heartwood of creation itself',
  },
};

/**
 * Get tree model definition by species
 */
export function getTreeModel(species: TreeSpecies): TreeModelDefinition {
  return TREE_MODELS[species] || TREE_MODELS['Oak'];
}

/**
 * Get random tree species for a given tier
 */
export function getRandomSpeciesForTier(tier: SeedTier): TreeSpecies {
  const speciesForTier = Object.values(TREE_MODELS)
    .filter(model => model.tier === tier)
    .map(model => model.species);
  
  return speciesForTier[Math.floor(Math.random() * speciesForTier.length)];
}

/**
 * Get all species for a tier
 */
export function getSpeciesForTier(tier: SeedTier): TreeSpecies[] {
  return Object.values(TREE_MODELS)
    .filter(model => model.tier === tier)
    .map(model => model.species);
}

/**
 * Check if a species exists
 */
export function isValidSpecies(species: string): species is TreeSpecies {
  return species in TREE_MODELS;
}
