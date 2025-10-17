/**
 * Tree Visual Profiles - Species-Consistent Procedural Parameters
 * 
 * Each species has a base visual profile that defines:
 * - Modular base parts (trunk/canopy types)
 * - Procedural parameter ranges for deterministic variation
 * - Sway animation parameters
 * 
 * This ensures trees of the same species look related but have unique characteristics
 * driven by their seed value.
 */

import type { TreeSpecies, FoliageShape } from '@/lib/tree-models';
import type { SeedTier } from '@/lib/seed-system';
import type { SpeciesArchetype } from '@/lib/tree-visual-generator';

export interface TreeVisualProfile {
  speciesId: TreeSpecies;
  rarityTier: SeedTier;
  archetype: SpeciesArchetype;
  
  // Base visual parts (consistent per species)
  baseParts: {
    trunkType: string;
    canopyType: FoliageShape;
    branchTemplate: string;
  };
  
  // Base scale (species characteristic)
  baseScale: number;
  
  // Procedural parameter ranges (applied with seed)
  paramRanges: {
    trunkHeight: [number, number];
    trunkThickness: [number, number];
    branchCount: [number, number];
    branchAngleVariance: [number, number];
    canopySpread: [number, number];
    multiTrunkChance: number;
    leafColorShiftHue: [number, number];
    rootFlareIntensity: [number, number];
  };
  
  // Wind animation parameters
  swayParams: {
    baseAmplitude: number;
    baseSpeed: number;
  };
  
  // Visual characteristics
  description: string;
}

/**
 * Get archetype for species
 */
function getArchetype(species: TreeSpecies): SpeciesArchetype {
  const conifers: TreeSpecies[] = ['Pine', 'Spruce', 'Douglas Fir', 'Hemlock', 'Bristlecone Pine', 'Yew', 'Cedar of Lebanon'];
  const ancients: TreeSpecies[] = ['Giant Sequoia', 'Baobab', 'Dragon\'s Blood', 'Yggdrasil Sapling', 'Ironwood'];
  const mysticals: TreeSpecies[] = ['Ghostwood', 'Dreamroot', 'Bodhi', 'Starwillow'];
  const celestials: TreeSpecies[] = ['Moonshade', 'Nebulark', 'Genesis Oak', 'Primeval Heartwood'];
  
  if (conifers.includes(species)) return 'conifer';
  if (ancients.includes(species)) return 'ancient';
  if (mysticals.includes(species)) return 'mystical';
  if (celestials.includes(species)) return 'celestial';
  return 'broadleaf';
}

/**
 * Create tree profile with species-specific parameters
 */
export function createTreeProfile(
  species: TreeSpecies,
  tier: SeedTier,
  foliageShape: FoliageShape,
  description: string
): TreeVisualProfile {
  const archetype = getArchetype(species);
  
  // Base scale varies by tier
  const tierScales: Record<SeedTier, number> = {
    'Common Grove': 1.0,
    'Wildwood': 1.05,
    'Sacred Canopy': 1.1,
    'Elderbark': 1.2,
    'Mythroot': 1.3,
    'Celestial Bough': 1.4,
    'Origin Tree': 1.5,
  };
  
  // Archetype-specific parameter ranges
  const archetypeParams: Record<SpeciesArchetype, Partial<TreeVisualProfile['paramRanges']>> = {
    'broadleaf': {
      trunkHeight: [0.9, 1.15],
      trunkThickness: [0.85, 1.1],
      branchCount: [4, 7],
      canopySpread: [0.85, 1.25],
      multiTrunkChance: 0.05,
    },
    'conifer': {
      trunkHeight: [1.0, 1.3],
      trunkThickness: [0.7, 0.95],
      branchCount: [5, 9],
      canopySpread: [0.7, 1.0],
      multiTrunkChance: 0.02,
    },
    'ancient': {
      trunkHeight: [0.8, 1.1],
      trunkThickness: [1.1, 1.5],
      branchCount: [3, 6],
      canopySpread: [1.0, 1.5],
      multiTrunkChance: 0.25,
    },
    'mystical': {
      trunkHeight: [0.85, 1.2],
      trunkThickness: [0.8, 1.2],
      branchCount: [4, 8],
      canopySpread: [0.9, 1.35],
      multiTrunkChance: 0.15,
    },
    'celestial': {
      trunkHeight: [0.9, 1.25],
      trunkThickness: [0.75, 1.1],
      branchCount: [5, 10],
      canopySpread: [0.95, 1.4],
      multiTrunkChance: 0.1,
    },
  };
  
  const params = archetypeParams[archetype];
  
  return {
    speciesId: species,
    rarityTier: tier,
    archetype,
    baseParts: {
      trunkType: archetype,
      canopyType: foliageShape,
      branchTemplate: foliageShape,
    },
    baseScale: tierScales[tier],
    paramRanges: {
      trunkHeight: params.trunkHeight || [0.9, 1.15],
      trunkThickness: params.trunkThickness || [0.85, 1.1],
      branchCount: params.branchCount || [4, 7],
      branchAngleVariance: [0.1, 0.35],
      canopySpread: params.canopySpread || [0.85, 1.25],
      multiTrunkChance: params.multiTrunkChance || 0.05,
      leafColorShiftHue: [-8, 8],
      rootFlareIntensity: [0.1, 0.4],
    },
    swayParams: {
      baseAmplitude: 0.015,
      baseSpeed: 0.001,
    },
    description,
  };
}

/**
 * Get tree profile for a species
 */
export function getTreeProfile(species: TreeSpecies): TreeVisualProfile {
  // Import tree models to get foliage shape and tier
  const { TREE_MODELS } = require('@/lib/tree-models');
  const model = TREE_MODELS[species];
  
  if (!model) {
    // Fallback to Oak
    const oakModel = TREE_MODELS['Oak'];
    return createTreeProfile('Oak', oakModel.tier, oakModel.foliageShape, oakModel.description);
  }
  
  return createTreeProfile(species, model.tier, model.foliageShape, model.description);
}
