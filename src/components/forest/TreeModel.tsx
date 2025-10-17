'use client';

/**
 * TreeModel - Unified tree rendering component
 * 
 * Wrapper for EnhancedTreeModel with backward compatibility.
 * Now uses procedural variation system for unique tree visuals.
 */

import { EnhancedTreeModel } from './EnhancedTreeModel';
import type { SeedTier } from '@/lib/seed-system';
import type { TreeSpecies } from '@/lib/tree-models';

export interface TreeModelProps {
  species: TreeSpecies;
  tier?: SeedTier;
  growthStage: 'seed' | 'sprout' | 'young' | 'mature' | 'ancient';
  position?: [number, number, number];
  isPreview?: boolean;
  onClick?: () => void;
  treeId?: string;
  visualSeed?: number;
}

export function TreeModel({
  species,
  tier,
  growthStage = 'seed',
  position = [0, 0, 0],
  isPreview = false,
  onClick,
  treeId,
  visualSeed,
}: TreeModelProps): JSX.Element {
  // Use enhanced tree model with procedural variations
  // This provides consistent visuals across sessions using visual seeds
  return (
    <EnhancedTreeModel
      species={species}
      tier={tier}
      growthStage={growthStage}
      position={position}
      isPreview={isPreview}
      onClick={onClick}
      treeId={treeId}
      visualSeed={visualSeed}
    />
  );
}
