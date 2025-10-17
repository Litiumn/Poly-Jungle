'use client';

import type { Tree as TreeType } from '@/types/game';
import { TreeModel } from './TreeModel';
import { AnimatedTree } from './AnimatedTree';
import type { TreeSpecies } from '@/lib/tree-models';
import { getValidSpecies } from '@/lib/tree-migration';
import { getTerrainYPosition } from '@/lib/terrain-utils';

interface TreeProps {
  tree: TreeType;
  onClick: () => void;
  animationType?: 'planting' | 'cutting' | 'none';
  onAnimationComplete?: () => void;
}

export function Tree({ 
  tree, 
  onClick, 
  animationType = 'none',
  onAnimationComplete 
}: TreeProps): JSX.Element {
  // If animation is requested, use AnimatedTree
  if (animationType !== 'none') {
    return (
      <AnimatedTree
        tree={tree}
        onClick={onClick}
        animationType={animationType}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }
  
  // Otherwise, render static tree (faster, no animation overhead)
  const tier = (tree.metadata?.tier as string) || undefined;
  const validSpecies = getValidSpecies(tree.species as string);
  const visualSeed = (tree.metadata?.visualSeed as number) || undefined;
  
  // Calculate terrain height at tree position for proper placement
  const terrainY = getTerrainYPosition(tree.position.x, tree.position.z);

  return (
    <group position={[tree.position.x, terrainY, tree.position.z]}>
      {/* Use unified TreeModel component */}
      <TreeModel
        species={validSpecies}
        tier={tier}
        growthStage={tree.growthStage}
        onClick={onClick}
        treeId={tree.id}
        visualSeed={visualSeed}
      />

      {/* Group tree indicator */}
      {tree.isGroupTree && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 16]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Watered indicator */}
      {tree.wateredToday && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#4fc3f7" />
        </mesh>
      )}
    </group>
  );
}
