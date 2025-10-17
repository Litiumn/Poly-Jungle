'use client';

/**
 * AnimatedTree - Tree component with lifecycle animations
 * 
 * Features:
 * - Smooth planting animation with scale and particles
 * - Tree cutting animation with tilt, fall, and leaf scatter
 * - Unified visual model for preview and planted states
 * - Consistent visual seed usage
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group as ThreeGroup } from 'three';
import * as THREE from 'three';
import { applyWindToGroup } from '@/lib/wind-system';
import type { Tree as TreeType } from '@/types/game';
import { TreeModel } from './TreeModel';
import type { TreeSpecies } from '@/lib/tree-models';
import { getValidSpecies } from '@/lib/tree-migration';
import {
  type TreeAnimationState,
  createPlantingAnimation,
  createCuttingAnimation,
  updateAnimationProgress,
  applyPlantingAnimation,
  applyCuttingAnimation,
  getRandomFallDirection,
  generatePlantingParticles,
  updatePlantingParticles,
  generateCuttingParticles,
  updateCuttingParticles,
  type PlantingParticle,
  type CuttingParticle,
} from '@/lib/tree-animations';
import { getTreeModel } from '@/lib/tree-models';
import { getTerrainYPosition } from '@/lib/terrain-utils';

interface AnimatedTreeProps {
  tree: TreeType;
  onClick: () => void;
  animationType?: 'planting' | 'cutting' | 'none';
  onAnimationComplete?: () => void;
}

export function AnimatedTree({ 
  tree, 
  onClick, 
  animationType = 'none',
  onAnimationComplete 
}: AnimatedTreeProps): JSX.Element {
  const groupRef = useRef<ThreeGroup>(null);
  const [animState, setAnimState] = useState<TreeAnimationState | null>(
    animationType === 'planting' ? createPlantingAnimation() :
    animationType === 'cutting' ? createCuttingAnimation() :
    null
  );
  
  // Particle systems
  const [plantingParticles, setPlantingParticles] = useState<PlantingParticle[]>([]);
  const [cuttingParticles, setCuttingParticles] = useState<CuttingParticle[]>([]);
  
  // Extract tree data
  const tier = (tree.metadata?.tier as string) || undefined;
  const validSpecies = getValidSpecies(tree.species as string);
  const visualSeed = (tree.metadata?.visualSeed as number) || undefined;
  
  // Get foliage color for particle effects
  const treeModel = useMemo(() => getTreeModel(validSpecies), [validSpecies]);
  
  // Calculate terrain height at tree position for proper placement
  const terrainY = getTerrainYPosition(tree.position.x, tree.position.z);
  
  // Initialize particles on cutting animation start
  useEffect(() => {
    if (animationType === 'cutting' && groupRef.current) {
      const particles = generateCuttingParticles(
        new THREE.Vector3(tree.position.x, tree.position.y, tree.position.z),
        treeModel.foliageColor,
        20
      );
      setCuttingParticles(particles);
    } else if (animationType === 'planting' && groupRef.current) {
      const particles = generatePlantingParticles(
        new THREE.Vector3(tree.position.x, tree.position.y, tree.position.z),
        12
      );
      setPlantingParticles(particles);
    }
  }, [animationType, tree.position, treeModel.foliageColor]);
  
  // Animation frame loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Apply wind animation when not animating planting/cutting
    if (!animState || !animState.isAnimating) {
      const treeHeight = tree.growthStage === 'ancient' ? 4 : 
                         tree.growthStage === 'mature' ? 3 : 
                         tree.growthStage === 'young' ? 2 : 1;
      
      applyWindToGroup(
        groupRef.current,
        new THREE.Vector3(tree.position.x, tree.position.y, tree.position.z),
        treeHeight,
        state.clock.elapsedTime
      );
    }
    
    if (!animState) return;
    
    // Update animation progress
    const updatedState = updateAnimationProgress(animState, Date.now());
    setAnimState(updatedState);
    
    // Apply animation effects
    if (updatedState.animationType === 'planting') {
      applyPlantingAnimation(groupRef.current, updatedState.progress);
      
      // Update planting particles
      setPlantingParticles(prev => updatePlantingParticles(prev, delta));
    } else if (updatedState.animationType === 'cutting') {
      const fallDir = getRandomFallDirection(visualSeed || Date.now());
      const { opacity } = applyCuttingAnimation(
        groupRef.current, 
        updatedState.progress,
        fallDir
      );
      
      // Update material opacity for all children
      groupRef.current.traverse((child) => {
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.transparent !== undefined) {
            material.transparent = true;
            material.opacity = opacity;
          }
        }
      });
      
      // Update cutting particles
      setCuttingParticles(prev => updateCuttingParticles(prev, delta));
    }
    
    // Check for completion
    if (!updatedState.isAnimating && onAnimationComplete) {
      onAnimationComplete();
    }
  });
  
  return (
    <group position={[tree.position.x, terrainY, tree.position.z]}>
      {/* Animated tree model */}
      <group ref={groupRef}>
        <TreeModel
          species={validSpecies}
          tier={tier}
          growthStage={tree.growthStage}
          onClick={onClick}
          treeId={tree.id}
          visualSeed={visualSeed}
        />
      </group>

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
      
      {/* Planting particles */}
      {plantingParticles.map(particle => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[particle.size, 6, 6]} />
          <meshBasicMaterial 
            color={particle.color} 
            transparent 
            opacity={particle.life * 0.8} 
          />
        </mesh>
      ))}
      
      {/* Cutting particles (falling leaves) */}
      {cuttingParticles.map(particle => (
        <mesh 
          key={particle.id} 
          position={particle.position}
          rotation={particle.rotation}
        >
          <planeGeometry args={[particle.size, particle.size * 0.7]} />
          <meshBasicMaterial 
            color={particle.color} 
            transparent 
            opacity={particle.life * 0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
