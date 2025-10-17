'use client';

/**
 * Procedural Grass System
 * 
 * Generates low-cost grass tufts around trees using instanced rendering
 * for performance. Grass placement is deterministic based on tree seed.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vector3 } from '@/types/game';

interface ProceduralGrassProps {
  treePositions: Vector3[];
  treeSeeds: (number | undefined)[];
  density?: number;
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Generate grass tuft positions around a tree
 */
function generateGrassTufts(
  treePosition: Vector3,
  seed: number,
  count: number
): Array<{ position: [number, number, number]; rotation: number; scale: number }> {
  const rng = seededRandom(seed);
  const tufts = [];
  const radius = 2.5; // Grass spawns within 2.5m of tree
  
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const distance = rng() * radius;
    const x = treePosition.x + Math.cos(angle) * distance;
    const z = treePosition.z + Math.sin(angle) * distance;
    const scale = 0.3 + rng() * 0.4; // Random scale 0.3-0.7
    const rotation = rng() * Math.PI * 2;
    
    tufts.push({
      position: [x, treePosition.y, z] as [number, number, number],
      rotation,
      scale,
    });
  }
  
  return tufts;
}

export function ProceduralGrass({
  treePositions,
  treeSeeds,
  density = 6,
}: ProceduralGrassProps): JSX.Element {
  // Generate all grass tufts
  const grassTufts = useMemo(() => {
    const tufts: Array<{ position: [number, number, number]; rotation: number; scale: number }> = [];
    
    // Defensive check: ensure treePositions is a valid array
    if (!Array.isArray(treePositions) || treePositions.length === 0) {
      return tufts;
    }
    
    for (let i = 0; i < treePositions.length; i++) {
      const tree = treePositions[i];
      const seed = treeSeeds[i] || Math.floor(tree.x * 1000 + tree.z * 1000);
      const treeTufts = generateGrassTufts(tree, seed, density);
      tufts.push(...treeTufts);
    }
    
    return tufts;
  }, [treePositions, treeSeeds, density]);
  
  // Create instanced mesh data
  const { instancedMesh, count } = useMemo(() => {
    const tuftCount = grassTufts.length;
    const dummy = new THREE.Object3D();
    const instancedMesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.15, 0.2, 4),
      new THREE.MeshStandardMaterial({
        color: '#7cb342',
        roughness: 0.9,
        flatShading: true,
      }),
      tuftCount
    );
    
    grassTufts.forEach((tuft, i) => {
      dummy.position.set(...tuft.position);
      dummy.rotation.set(0, tuft.rotation, 0);
      dummy.scale.set(tuft.scale, tuft.scale, tuft.scale);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    
    return { instancedMesh, count: tuftCount };
  }, [grassTufts]);
  
  if (count === 0) return <></>;
  
  return <primitive object={instancedMesh} />;
}

/**
 * Grass tuft cluster component (single instance for preview)
 */
export function GrassTuftCluster({ position }: { position: [number, number, number] }): JSX.Element {
  const tufts = useMemo(() => {
    const result = [];
    const rng = seededRandom(Math.floor(position[0] * 1000 + position[2] * 1000));
    
    for (let i = 0; i < 4; i++) {
      const angle = rng() * Math.PI * 2;
      const distance = rng() * 0.5;
      const x = position[0] + Math.cos(angle) * distance;
      const z = position[2] + Math.sin(angle) * distance;
      const scale = 0.3 + rng() * 0.3;
      const rotation = rng() * Math.PI * 2;
      
      result.push({
        position: [x, position[1], z] as [number, number, number],
        rotation,
        scale,
      });
    }
    
    return result;
  }, [position]);
  
  return (
    <>
      {tufts.map((tuft, i) => (
        <mesh key={i} position={tuft.position} rotation={[0, tuft.rotation, 0]} scale={tuft.scale}>
          <coneGeometry args={[0.15, 0.2, 4]} />
          <meshStandardMaterial color="#7cb342" roughness={0.9} flatShading />
        </mesh>
      ))}
    </>
  );
}
