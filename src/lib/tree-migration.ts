import type { Tree } from '@/types/game';
import type { TreeSpecies } from '@/lib/tree-models';
import { TREE_MODELS } from '@/lib/tree-models';

/**
 * Migration map for old tree species names to new ones
 */
const SPECIES_MIGRATION_MAP: Record<string, TreeSpecies> = {
  'Cherry': 'Sakura',
  'Baobab': 'Baobab',
  'Mangrove': 'Red Mangrove',
  'Oak': 'Oak',
  'Pine': 'Pine',
};

/**
 * Migrates a single tree's species from old format to new format
 */
export function migrateTreeSpecies(tree: Tree): Tree {
  const oldSpecies = tree.species as string;
  
  // If species exists in migration map, use the mapped value
  if (oldSpecies in SPECIES_MIGRATION_MAP) {
    return {
      ...tree,
      species: SPECIES_MIGRATION_MAP[oldSpecies] as TreeSpecies,
    };
  }
  
  // If species already exists in new tree models, keep it
  if (oldSpecies in TREE_MODELS) {
    return tree;
  }
  
  // Fallback to Oak if species is unknown
  console.warn(`Unknown tree species "${oldSpecies}", migrating to Oak`);
  return {
    ...tree,
    species: 'Oak' as TreeSpecies,
  };
}

/**
 * Migrates all trees in an array from old format to new format
 */
export function migrateAllTrees(trees: Tree[]): Tree[] {
  return trees.map(migrateTreeSpecies);
}

/**
 * Validates that a species name is valid in the new system
 */
export function isValidSpecies(species: string): species is TreeSpecies {
  return species in TREE_MODELS;
}

/**
 * Gets a valid species name, with fallback to Oak
 */
export function getValidSpecies(species: string): TreeSpecies {
  if (isValidSpecies(species)) {
    return species as TreeSpecies;
  }
  
  // Check migration map
  if (species in SPECIES_MIGRATION_MAP) {
    return SPECIES_MIGRATION_MAP[species] as TreeSpecies;
  }
  
  // Default fallback
  return 'Oak' as TreeSpecies;
}
