'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Mesh } from 'three';
import * as THREE from 'three';
import type { Vector3 } from '@/types/game';
import type { SeedTier } from '@/lib/seed-system';
import { TreeModel } from './TreeModel';
import { getRandomSpeciesForTier } from '@/lib/tree-models';
import { getTerrainYPosition } from '@/lib/terrain-utils';

interface PlacementPreviewProps {
  position: Vector3 | null;
  rotation: number;
  type: 'tree' | 'furniture';
  isValid: boolean;
  treeType?: SeedTier;
  furnitureType?: string;
  terrainNormal?: THREE.Vector3;
  onVisualSeedGenerated?: (seed: number, species: string) => void;
  validationReason?: string;
}

export function PlacementPreview({
  position,
  rotation,
  type,
  isValid,
  treeType,
  furnitureType,
  terrainNormal = new THREE.Vector3(0, 1, 0),
  onVisualSeedGenerated,
  validationReason,
}: PlacementPreviewProps): JSX.Element | null {
  const meshRef = useRef<Mesh>(null);

  // Calculate slope-aligned rotation
  const slopeRotation = useRef(new THREE.Euler()).current;
  useEffect(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, terrainNormal.clone().normalize());
    
    slopeRotation.setFromQuaternion(quaternion);
    slopeRotation.y += rotation;
  }, [rotation, terrainNormal, slopeRotation]);

  if (!position) return null;

  const previewColor = isValid ? '#4ade80' : '#ef4444';
  const previewOpacity = 0.4;
  
  // Calculate terrain height for proper preview placement
  const terrainY = getTerrainYPosition(position.x, position.z);

  return (
    <group position={[position.x, terrainY, position.z]} rotation={slopeRotation}>
      {type === 'tree' && treeType && (
        <TreePreview 
          tier={treeType} 
          color={previewColor} 
          opacity={previewOpacity} 
          isValid={isValid}
          onVisualSeedGenerated={onVisualSeedGenerated}
        />
      )}
      
      {type === 'furniture' && furnitureType && (
        <FurniturePreview type={furnitureType} color={previewColor} opacity={previewOpacity} />
      )}
      
      {/* Grid snap indicator */}
      {isValid && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={previewColor} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Rotation indicator arrow */}
      <mesh position={[0, 0.1, 1]} rotation={[0, 0, 0]} ref={meshRef}>
        <coneGeometry args={[0.2, 0.5, 4]} />
        <meshBasicMaterial color={previewColor} transparent opacity={0.6} />
      </mesh>
      
      {/* Validation feedback (render invalid reason text in HTML overlay - handled by parent) */}
    </group>
  );
}

function TreePreview({
  tier,
  color,
  opacity,
  isValid,
  onVisualSeedGenerated,
}: {
  tier: SeedTier;
  color: string;
  opacity: number;
  isValid: boolean;
  onVisualSeedGenerated?: (seed: number, species: string) => void;
}): JSX.Element {
  // Memoize species and visual seed to prevent random flipping on every render
  const species = useMemo(() => getRandomSpeciesForTier(tier), [tier]);
  const visualSeed = useMemo(() => Math.floor(Math.random() * 1000000), [tier]);
  
  // Notify parent of visual seed and species for consistent planting
  useEffect(() => {
    if (onVisualSeedGenerated) {
      onVisualSeedGenerated(visualSeed, species);
    }
  }, [visualSeed, species, onVisualSeedGenerated]);
  
  return (
    <group>
      <TreeModel
        species={species}
        tier={tier}
        growthStage="mature"
        isPreview={true}
        visualSeed={visualSeed}
      />
      
      {/* Highlight ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.8} />
      </mesh>
    </group>
  );
}

function FurniturePreview({
  type,
  color,
  opacity,
}: {
  type: string;
  color: string;
  opacity: number;
}): JSX.Element {
  // Simple box preview for furniture
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b4513" transparent opacity={opacity} />
      </mesh>
      
      {/* Highlight ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.8} />
      </mesh>
    </group>
  );
}
