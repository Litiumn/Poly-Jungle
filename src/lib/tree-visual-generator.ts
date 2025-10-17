/**
 * Tree Visual Generator - Procedural Variation System
 * 
 * Generates deterministic visual variations for each tree instance
 * using seeded randomness to ensure consistency across sessions.
 * Enhanced with species archetypes, bark textures, leaf shapes,
 * and advanced wind simulation.
 */

import type { TreeSpecies } from './tree-models';
import type { SeedTier } from './seed-system';

export type BarkTextureType = 'smooth' | 'cracked' | 'mossy' | 'enchanted' | 'ancient' | 'metallic';
export type LeafShapeType = 'broad' | 'needle' | 'cluster' | 'glowing' | 'crystalline' | 'ethereal';
export type SpeciesArchetype = 'broadleaf' | 'conifer' | 'ancient' | 'mystical' | 'celestial';

export interface TreeVisualVariation {
  visualSeed: number;
  
  // Species archetype
  archetype: SpeciesArchetype;
  
  // Trunk variations
  trunkHeightMultiplier: number;
  trunkThicknessMultiplier: number;
  trunkBarkRoughness: number;
  trunkColorShift: { h: number; s: number; l: number };
  trunkTwist: number;
  barkTextureType: BarkTextureType;
  multiTrunkProbability: number;
  hasMulitpleTrunks: boolean;
  rootFlareIntensity: number;
  
  // Canopy variations
  canopySizeMultiplier: number;
  canopyDensity: number;
  canopyAsymmetry: { x: number; z: number };
  leafColorShift: { h: number; s: number; l: number };
  leafShapeType: LeafShapeType;
  canopySpread: number;
  secondaryCanopyChance: number;
  hasSecondaryCanopy: boolean;
  
  // Branch variations
  branchCount: number;
  branchCurvature: number;
  branchSpread: number;
  branchAngleVariance: number;
  
  // Special effects
  glowPulseSpeed: number;
  glowPulseIntensity: number;
  particleCount: number;
  windSwayIntensity: number;
  windPhaseOffset: number;
  
  // Emissive layers for high-tier trees
  emissiveLayerIntensity: number;
}

/**
 * Global wind system state
 */
export interface WindSystemState {
  direction: { x: number; z: number };
  strength: number;
  baseSpeed: number;
  gustActive: boolean;
  gustStrength: number;
  lastGustTime: number;
}

// Global wind state (can be modified by game systems)
export const WIND_SYSTEM: WindSystemState = {
  direction: { x: 1, z: 0.3 },
  strength: 0.5,
  baseSpeed: 0.001,
  gustActive: false,
  gustStrength: 0,
  lastGustTime: 0,
};

/**
 * Trigger a wind gust event
 */
export function triggerWindGust(duration: number = 2000, intensity: number = 0.8): void {
  WIND_SYSTEM.gustActive = true;
  WIND_SYSTEM.gustStrength = intensity;
  WIND_SYSTEM.lastGustTime = Date.now();
  
  setTimeout(() => {
    WIND_SYSTEM.gustActive = false;
    WIND_SYSTEM.gustStrength = 0;
  }, duration);
}

/**
 * Update wind direction smoothly
 */
export function setWindDirection(x: number, z: number): void {
  WIND_SYSTEM.direction.x = x;
  WIND_SYSTEM.direction.z = z;
}

/**
 * Set wind strength (0-1)
 */
export function setWindStrength(strength: number): void {
  WIND_SYSTEM.strength = Math.max(0, Math.min(1, strength));
}

/**
 * Seeded random number generator (PRNG)
 * Uses mulberry32 algorithm for deterministic randomness
 */
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

/**
 * Get species archetype based on species name
 */
function getSpeciesArchetype(species: TreeSpecies): SpeciesArchetype {
  // Conifer species (cone-shaped, needle leaves)
  const conifers: TreeSpecies[] = ['Pine', 'Spruce', 'Douglas Fir', 'Hemlock', 'Bristlecone Pine', 'Yew', 'Cedar of Lebanon'];
  
  // Ancient species (massive, old-growth characteristics)
  const ancients: TreeSpecies[] = ['Giant Sequoia', 'Baobab', 'Dragon\'s Blood', 'Yggdrasil Sapling', 'Ironwood'];
  
  // Mystical species (magical, ethereal qualities)
  const mysticals: TreeSpecies[] = ['Ghostwood', 'Dreamroot', 'Bodhi', 'Starwillow'];
  
  // Celestial species (cosmic, otherworldly)
  const celestials: TreeSpecies[] = ['Moonshade', 'Nebulark', 'Genesis Oak', 'Primeval Heartwood'];
  
  if (conifers.includes(species)) return 'conifer';
  if (ancients.includes(species)) return 'ancient';
  if (mysticals.includes(species)) return 'mystical';
  if (celestials.includes(species)) return 'celestial';
  return 'broadleaf';
}

/**
 * Get bark texture type based on archetype and tier
 */
function getBarkTextureType(
  archetype: SpeciesArchetype, 
  tier: SeedTier | undefined,
  rng: SeededRandom
): BarkTextureType {
  const tierLevel = getTierLevel(tier);
  
  if (archetype === 'celestial' || tierLevel >= 6) {
    return rng.next() > 0.5 ? 'enchanted' : 'metallic';
  }
  if (archetype === 'mystical' || tierLevel >= 5) {
    return rng.next() > 0.5 ? 'enchanted' : 'ancient';
  }
  if (archetype === 'ancient' || tierLevel >= 4) {
    return rng.next() > 0.6 ? 'ancient' : 'cracked';
  }
  if (archetype === 'conifer') {
    return rng.next() > 0.7 ? 'cracked' : 'smooth';
  }
  
  // Broadleaf trees
  const options: BarkTextureType[] = ['smooth', 'cracked', 'mossy'];
  return options[rng.int(0, options.length - 1)];
}

/**
 * Get leaf shape type based on archetype and tier
 */
function getLeafShapeType(
  archetype: SpeciesArchetype, 
  tier: SeedTier | undefined,
  rng: SeededRandom
): LeafShapeType {
  const tierLevel = getTierLevel(tier);
  
  if (archetype === 'celestial' || tierLevel >= 6) {
    return rng.next() > 0.5 ? 'crystalline' : 'ethereal';
  }
  if (archetype === 'mystical' || tierLevel >= 5) {
    return rng.next() > 0.5 ? 'glowing' : 'ethereal';
  }
  if (archetype === 'conifer') {
    return 'needle';
  }
  if (tierLevel >= 4) {
    return rng.next() > 0.5 ? 'glowing' : 'cluster';
  }
  
  // Lower tier trees
  const options: LeafShapeType[] = ['broad', 'cluster'];
  return options[rng.int(0, options.length - 1)];
}

/**
 * Get tier level (1-7)
 */
function getTierLevel(tier: SeedTier | undefined): number {
  const tierMap: Record<string, number> = {
    'Common Grove': 1,
    'Wildwood': 2,
    'Sacred Canopy': 3,
    'Elderbark': 4,
    'Mythroot': 5,
    'Celestial Bough': 6,
    'Origin Tree': 7,
  };
  return tier ? tierMap[tier] : 1;
}

/**
 * Generate visual variation for a tree instance
 */
export function generateTreeVariation(
  species: TreeSpecies,
  tier: SeedTier | undefined,
  visualSeed?: number
): TreeVisualVariation {
  // Use provided seed or generate from species + timestamp
  const seed = visualSeed || hashString(species + Date.now().toString());
  const rng = new SeededRandom(seed);
  
  // Determine archetype
  const archetype = getSpeciesArchetype(species);
  
  // Rarity-based variation ranges
  const rarityMultiplier = getRarityMultiplier(tier);
  const tierLevel = getTierLevel(tier);
  
  // Trunk variations - enhanced ranges
  const trunkHeightMultiplier = rng.range(0.8, 1.2) * rarityMultiplier.height;
  const trunkThicknessMultiplier = rng.range(0.85, 1.15);
  const trunkBarkRoughness = rng.range(0.1, 0.95);
  const trunkTwist = rng.range(-0.08, 0.08) * rarityMultiplier.twist;
  
  // Bark texture
  const barkTextureType = getBarkTextureType(archetype, tier, rng);
  
  // Multi-trunk trees (more common for ancient/mystical)
  const multiTrunkBaseProbability = archetype === 'ancient' ? 0.3 : archetype === 'mystical' ? 0.2 : 0.1;
  const multiTrunkProbability = multiTrunkBaseProbability * (tierLevel / 7);
  const hasMulitpleTrunks = rng.next() < multiTrunkProbability;
  
  // Root flare intensity
  const rootFlareIntensity = rng.range(0.1, 0.5) * (tierLevel / 7);
  
  // Color shifts (hue, saturation, lightness) - more variation
  const trunkColorShift = {
    h: rng.range(-10, 10),
    s: rng.range(-0.08, 0.08),
    l: rng.range(-0.08, 0.08),
  };
  
  // Canopy variations - enhanced
  const canopySizeMultiplier = rng.range(0.85, 1.3) * rarityMultiplier.size;
  const canopyDensity = rng.range(0.6, 1.0);
  const canopySpread = rng.range(0.8, 1.4);
  
  // Asymmetry (more pronounced for ancient/mystical)
  const asymmetryRange = archetype === 'ancient' || archetype === 'mystical' ? 0.25 : 0.18;
  const canopyAsymmetry = {
    x: rng.range(-asymmetryRange, asymmetryRange),
    z: rng.range(-asymmetryRange, asymmetryRange),
  };
  
  // Leaf color shifts - more variation
  const leafColorShift = {
    h: rng.range(-12, 12),
    s: rng.range(-0.1, 0.1),
    l: rng.range(-0.1, 0.1),
  };
  
  // Leaf shape type
  const leafShapeType = getLeafShapeType(archetype, tier, rng);
  
  // Secondary canopy (more common on high-tier trees)
  const secondaryCanopyChance = rng.range(0.1, 0.4) * (tierLevel / 7);
  const hasSecondaryCanopy = rng.next() < secondaryCanopyChance;
  
  // Branch variations - enhanced ranges
  const branchCount = rng.int(3, 8);
  const branchCurvature = rng.range(0.05, 0.5);
  const branchSpread = rng.range(0.6, 1.4);
  const branchAngleVariance = rng.range(0.1, 0.4);
  
  // Wind animation parameters
  const windSwayIntensity = rng.range(0.25, 1.2);
  const windPhaseOffset = rng.range(0, Math.PI * 2);
  
  // Special effects (stronger for higher tiers)
  const glowPulseSpeed = rng.range(0.4, 2.5) * rarityMultiplier.effects;
  const glowPulseIntensity = rng.range(0.15, 0.7) * rarityMultiplier.effects;
  const particleCount = rng.int(
    Math.floor(2 * rarityMultiplier.effects),
    Math.floor(10 * rarityMultiplier.effects)
  );
  
  // Emissive layers for high-tier trees
  const emissiveLayerIntensity = tierLevel >= 5 ? rng.range(0.2, 0.6) : 0;
  
  return {
    visualSeed: seed,
    archetype,
    trunkHeightMultiplier,
    trunkThicknessMultiplier,
    trunkBarkRoughness,
    trunkColorShift,
    trunkTwist,
    barkTextureType,
    multiTrunkProbability,
    hasMulitpleTrunks,
    rootFlareIntensity,
    canopySizeMultiplier,
    canopyDensity,
    canopyAsymmetry,
    leafColorShift,
    leafShapeType,
    canopySpread,
    secondaryCanopyChance,
    hasSecondaryCanopy,
    branchCount,
    branchCurvature,
    branchSpread,
    branchAngleVariance,
    glowPulseSpeed,
    glowPulseIntensity,
    particleCount,
    windSwayIntensity,
    windPhaseOffset,
    emissiveLayerIntensity,
  };
}

/**
 * Get rarity-based multipliers
 */
function getRarityMultiplier(tier: SeedTier | undefined): {
  height: number;
  size: number;
  twist: number;
  effects: number;
} {
  const multipliers: Record<string, { height: number; size: number; twist: number; effects: number }> = {
    'Common Grove': { height: 1.0, size: 1.0, twist: 1.0, effects: 1.0 },
    'Wildwood': { height: 1.05, size: 1.05, twist: 1.1, effects: 1.2 },
    'Sacred Canopy': { height: 1.1, size: 1.1, twist: 1.2, effects: 1.5 },
    'Elderbark': { height: 1.2, size: 1.15, twist: 1.3, effects: 1.8 },
    'Mythroot': { height: 1.3, size: 1.2, twist: 1.5, effects: 2.2 },
    'Celestial Bough': { height: 1.4, size: 1.3, twist: 1.7, effects: 2.5 },
    'Origin Tree': { height: 1.5, size: 1.4, twist: 2.0, effects: 3.0 },
  };
  
  return tier ? multipliers[tier] : multipliers['Common Grove'];
}

/**
 * Hash a string to a number for seed generation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Apply HSL color shift to a hex color
 */
export function applyColorShift(
  hexColor: string,
  shift: { h: number; s: number; l: number }
): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Apply shifts
  h = (h * 360 + shift.h + 360) % 360;
  s = Math.max(0, Math.min(1, s + shift.s));
  const newL = Math.max(0, Math.min(1, l + shift.l));
  
  // Convert back to RGB
  const hueToRgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  
  let newR: number;
  let newG: number;
  let newB: number;
  
  if (s === 0) {
    newR = newG = newB = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
    const p = 2 * newL - q;
    newR = hueToRgb(p, q, h / 360 + 1 / 3);
    newG = hueToRgb(p, q, h / 360);
    newB = hueToRgb(p, q, h / 360 - 1 / 3);
  }
  
  // Convert to hex
  const toHex = (n: number): string => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Get or generate visual seed for a tree
 */
export function getTreeVisualSeed(treeId: string, existingSeed?: number): number {
  if (existingSeed) return existingSeed;
  return hashString(treeId);
}
