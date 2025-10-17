'use client';

/**
 * Enhanced TreeModel - Advanced procedural tree rendering
 * 
 * Features:
 * - Procedural variation with seeded randomness
 * - Realistic wind sway animation using sin/cos oscillation
 * - Per-tree desynchronization for natural movement
 * - Enhanced particle effects for high-tier trees
 * - Level of Detail (LOD) optimization
 * - Consistent preview and planted appearance
 * - Species archetypes with unique characteristics
 * - Multiple trunk and root flare rendering
 */

import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group as ThreeGroup } from 'three';
import type { SeedTier } from '@/lib/seed-system';
import { SEED_TIER_INFO } from '@/lib/seed-system';
import { getTreeModel, type TreeSpecies, type FoliageShape } from '@/lib/tree-models';
import { 
  generateTreeVariation, 
  applyColorShift, 
  getTreeVisualSeed,
  WIND_SYSTEM,
  type TreeVisualVariation 
} from '@/lib/tree-visual-generator';

export interface EnhancedTreeModelProps {
  species: TreeSpecies;
  tier?: SeedTier;
  growthStage: 'seed' | 'sprout' | 'young' | 'mature' | 'ancient';
  position?: [number, number, number];
  isPreview?: boolean;
  onClick?: () => void;
  treeId?: string;
  visualSeed?: number;
}

export function EnhancedTreeModel({
  species,
  tier,
  growthStage = 'seed',
  position = [0, 0, 0],
  isPreview = false,
  onClick,
  treeId,
  visualSeed,
}: EnhancedTreeModelProps): JSX.Element {
  const groupRef = useRef<ThreeGroup>(null);
  const foliageRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const secondaryTrunkRef = useRef<Mesh>(null);
  
  // Get tree model definition
  const treeModel = useMemo(() => getTreeModel(species), [species]);
  
  // Generate or retrieve visual variation
  const variation = useMemo(() => {
    const seed = visualSeed || (treeId ? getTreeVisualSeed(treeId) : Date.now());
    return generateTreeVariation(species, tier, seed);
  }, [species, tier, visualSeed, treeId]);
  
  // Get tier-based info for effects
  const tierInfo = useMemo(() => {
    if (tier && SEED_TIER_INFO[tier]) {
      return SEED_TIER_INFO[tier];
    }
    return null;
  }, [tier]);
  
  // Size multiplier based on growth stage
  const sizeMap: Record<string, number> = {
    seed: 0.3,
    sprout: 0.6,
    young: 1.0,
    mature: 1.5,
    ancient: 2.0,
  };
  const baseSize = sizeMap[growthStage] || 1.0;
  const size = baseSize * variation.canopySizeMultiplier;
  const trunkHeight = size * variation.trunkHeightMultiplier;
  const trunkThickness = size * 0.15 * variation.trunkThicknessMultiplier;
  
  // Apply color shifts
  const trunkColor = applyColorShift(treeModel.trunkColor, variation.trunkColorShift);
  const foliageColor = applyColorShift(
    tierInfo?.glowColor || treeModel.foliageColor,
    variation.leafColorShift
  );
  const secondaryColor = treeModel.secondaryFoliageColor 
    ? applyColorShift(treeModel.secondaryFoliageColor, variation.leafColorShift)
    : foliageColor;
  
  // Glow configuration
  const hasGlow = treeModel.hasGlow || (tierInfo && ['Mythroot', 'Celestial Bough', 'Origin Tree'].includes(tier || ''));
  const glowIntensity = hasGlow ? treeModel.glowIntensity * (size / 1.5) : 0;
  
  // Preview effect
  const opacity = isPreview ? 0.7 : 1.0;
  
  // Randomized wind gust trigger (very occasional)
  useEffect(() => {
    if (Math.random() < 0.0005 && !WIND_SYSTEM.gustActive) {
      // Occasional wind gust
      const gustCheck = setInterval(() => {
        if (Math.random() < 0.001 && !WIND_SYSTEM.gustActive) {
          WIND_SYSTEM.gustActive = true;
          WIND_SYSTEM.gustStrength = Math.random() * 0.5 + 0.3;
          setTimeout(() => {
            WIND_SYSTEM.gustActive = false;
            WIND_SYSTEM.gustStrength = 0;
          }, 1500 + Math.random() * 1000);
        }
      }, 5000);
      
      return () => clearInterval(gustCheck);
    }
  }, []);
  
  // Realistic wind sway animation
  useFrame(({ clock }) => {
    if (!groupRef.current || growthStage === 'seed') return;
    
    const time = clock.getElapsedTime();
    
    // Global wind parameters
    const windSpeed = WIND_SYSTEM.baseSpeed * (1 + WIND_SYSTEM.strength);
    const gustMultiplier = WIND_SYSTEM.gustActive ? (1 + WIND_SYSTEM.gustStrength) : 1;
    const swayAmplitude = variation.windSwayIntensity * 0.1 * gustMultiplier * (size / 1.5);
    
    // Per-tree phase offset for desynchronization
    const phaseOffset = variation.windPhaseOffset;
    
    // Oscillation using sin/cos for realistic wind movement
    const swayX = Math.sin(time * windSpeed + phaseOffset) * swayAmplitude * WIND_SYSTEM.direction.x;
    const swayZ = Math.cos(time * windSpeed * 0.7 + phaseOffset * 0.5) * swayAmplitude * 0.8 * WIND_SYSTEM.direction.z;
    
    // Apply rotation with base rotation preserved
    groupRef.current.rotation.x = swayX;
    groupRef.current.rotation.z = swayZ;
    
    // Foliage wobble (separate oscillation for naturalism)
    if (foliageRef.current) {
      foliageRef.current.rotation.y = Math.sin(time * 0.8 + phaseOffset * 2) * swayAmplitude * 3;
    }
    
    // Secondary trunk sway (if exists)
    if (secondaryTrunkRef.current && variation.hasMulitpleTrunks) {
      secondaryTrunkRef.current.rotation.x = Math.sin(time * windSpeed * 1.2 + phaseOffset + 1) * swayAmplitude * 0.8;
      secondaryTrunkRef.current.rotation.z = Math.cos(time * windSpeed * 0.9 + phaseOffset + 1.5) * swayAmplitude * 0.6;
    }
    
    // Glow pulse for high-tier trees
    if (glowRef.current && hasGlow) {
      const pulse = Math.sin(time * variation.glowPulseSpeed) * variation.glowPulseIntensity;
      const material = glowRef.current.material as any;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = glowIntensity + pulse;
      }
    }
  });
  
  // Render foliage based on shape with variations
  const renderFoliage = () => {
    const baseY = trunkHeight * 0.8;
    const canopySize = 0.5 * size * variation.canopySpread;
    const asymmetryX = variation.canopyAsymmetry.x * size;
    const asymmetryZ = variation.canopyAsymmetry.z * size;
    
    switch (treeModel.foliageShape) {
      case 'sphere':
        return (
          <>
            <mesh 
              ref={foliageRef} 
              position={[asymmetryX, baseY, asymmetryZ]}
            >
              <sphereGeometry args={[canopySize, 18, 18]} />
              <meshStandardMaterial
                color={foliageColor}
                emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.8 - variation.canopyDensity * 0.2}
                metalness={variation.leafShapeType === 'metallic' ? 0.3 : 0}
              />
            </mesh>
            {(treeModel.secondaryFoliageColor || variation.hasSecondaryCanopy) && (
              <mesh position={[asymmetryX, baseY + 0.3 * size, asymmetryZ]}>
                <sphereGeometry args={[0.3 * size, 12, 12]} />
                <meshStandardMaterial
                  color={secondaryColor}
                  emissive={hasGlow ? tierInfo?.glowColor || secondaryColor : '#000000'}
                  emissiveIntensity={(glowIntensity + variation.emissiveLayerIntensity) * 1.2}
                  transparent={isPreview}
                  opacity={opacity}
                  roughness={0.7}
                />
              </mesh>
            )}
          </>
        );
      
      case 'cone':
        return (
          <>
            <mesh 
              ref={foliageRef} 
              position={[asymmetryX, baseY, asymmetryZ]}
            >
              <coneGeometry args={[canopySize, size * 1.2 * variation.trunkHeightMultiplier, 18]} />
              <meshStandardMaterial
                color={foliageColor}
                emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.85}
              />
            </mesh>
            {(treeModel.secondaryFoliageColor || variation.hasSecondaryCanopy) && (
              <mesh position={[asymmetryX, baseY + 0.4 * size, asymmetryZ]}>
                <coneGeometry args={[0.3 * size, size * 0.6, 12]} />
                <meshStandardMaterial
                  color={secondaryColor}
                  emissive={hasGlow ? tierInfo?.glowColor || secondaryColor : '#000000'}
                  emissiveIntensity={(glowIntensity + variation.emissiveLayerIntensity) * 1.2}
                  transparent={isPreview}
                  opacity={opacity}
                  roughness={0.8}
                />
              </mesh>
            )}
          </>
        );
      
      case 'cloud':
        const cloudSize = canopySize * 1.1;
        return (
          <>
            <mesh ref={foliageRef} position={[asymmetryX, baseY, asymmetryZ]}>
              <sphereGeometry args={[cloudSize, 16, 16]} />
              <meshStandardMaterial
                color={foliageColor}
                emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.9}
              />
            </mesh>
            <mesh position={[asymmetryX + 0.3 * size, baseY + 0.2 * size, asymmetryZ]}>
              <sphereGeometry args={[0.4 * size, 12, 12]} />
              <meshStandardMaterial
                color={secondaryColor}
                emissive={hasGlow ? tierInfo?.glowColor || secondaryColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.9}
              />
            </mesh>
            <mesh position={[asymmetryX - 0.3 * size, baseY + 0.15 * size, asymmetryZ]}>
              <sphereGeometry args={[0.35 * size, 12, 12]} />
              <meshStandardMaterial
                color={secondaryColor}
                emissive={hasGlow ? tierInfo?.glowColor || secondaryColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.9}
              />
            </mesh>
          </>
        );
      
      case 'wide':
        return (
          <>
            <mesh 
              ref={foliageRef} 
              position={[asymmetryX, baseY, asymmetryZ]} 
              scale={[1.5 * variation.branchSpread, 0.7, 1.5 * variation.branchSpread]}
            >
              <sphereGeometry args={[canopySize, 16, 16]} />
              <meshStandardMaterial
                color={foliageColor}
                emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.8}
              />
            </mesh>
            {[1, -1].map((dir, i) => (
              <mesh 
                key={i} 
                position={[asymmetryX + dir * 0.4 * size, baseY + 0.1 * size, asymmetryZ]} 
                scale={[1, 0.8, 1]}
              >
                <sphereGeometry args={[0.4 * size, 12, 12]} />
                <meshStandardMaterial
                  color={secondaryColor}
                  emissive={hasGlow ? tierInfo?.glowColor || secondaryColor : '#000000'}
                  emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
                  transparent={isPreview}
                  opacity={opacity}
                  roughness={0.8}
                />
              </mesh>
            ))}
          </>
        );
      
      case 'star':
        // Star shape with procedural variation
        return (
          <>
            {[0, 72, 144, 216, 288].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const spreadMult = variation.branchSpread;
              const x = Math.cos(rad) * 0.4 * size * spreadMult + asymmetryX;
              const z = Math.sin(rad) * 0.4 * size * spreadMult + asymmetryZ;
              return (
                <mesh key={i} position={[x, baseY, z]}>
                  <sphereGeometry args={[0.25 * size, 10, 10]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? foliageColor : secondaryColor}
                    emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                    emissiveIntensity={(glowIntensity + variation.emissiveLayerIntensity) * (i % 2 === 0 ? 1 : 1.2)}
                    transparent={isPreview}
                    opacity={opacity}
                    roughness={0.7}
                  />
                </mesh>
              );
            })}
            <mesh ref={foliageRef} position={[asymmetryX, baseY + 0.3 * size, asymmetryZ]}>
              <sphereGeometry args={[0.35 * size, 12, 12]} />
              <meshStandardMaterial
                color={foliageColor}
                emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
                emissiveIntensity={(glowIntensity + variation.emissiveLayerIntensity) * 1.5}
                transparent={isPreview}
                opacity={opacity}
                roughness={0.6}
              />
            </mesh>
          </>
        );
      
      default:
        return (
          <mesh ref={foliageRef} position={[asymmetryX, baseY, asymmetryZ]}>
            <sphereGeometry args={[canopySize, 16, 16]} />
            <meshStandardMaterial
              color={foliageColor}
              emissive={hasGlow ? tierInfo?.glowColor || foliageColor : '#000000'}
              emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
              transparent={isPreview}
              opacity={opacity}
              roughness={0.8}
            />
          </mesh>
        );
    }
  };
  
  // Render particle effects for legendary trees
  const renderParticles = () => {
    if (!hasGlow || glowIntensity < 0.5 || growthStage === 'seed') return null;
    if (!tierInfo || !['Mythroot', 'Celestial Bough', 'Origin Tree'].includes(tier || '')) return null;
    
    const particles = [];
    const count = Math.min(variation.particleCount, 12);
    
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const radius = size * 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = trunkHeight * 0.5 + Math.sin(i + variation.visualSeed) * size * 0.3;
      
      particles.push(
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.08 * size, 8, 8]} />
          <meshStandardMaterial
            color={tierInfo.glowColor}
            emissive={tierInfo.glowColor}
            emissiveIntensity={1.5}
            transparent
            opacity={opacity * 0.9}
          />
        </mesh>
      );
    }
    
    return <>{particles}</>;
  };
  
  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Root flare for ancient/mystical trees */}
      {(variation.archetype === 'ancient' || variation.archetype === 'mystical') && variation.rootFlareIntensity > 0.2 && (
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[trunkThickness * 1.8, trunkThickness * 2.2, 0.3, 12]} />
          <meshStandardMaterial
            color={trunkColor}
            transparent={isPreview}
            opacity={opacity}
            roughness={variation.trunkBarkRoughness}
          />
        </mesh>
      )}
      
      {/* Main trunk with twist and variation */}
      <mesh 
        position={[0, trunkHeight * 0.5, 0]} 
        rotation={[0, variation.trunkTwist, 0]}
      >
        <cylinderGeometry args={[trunkThickness * 0.7, trunkThickness, trunkHeight, 12]} />
        <meshStandardMaterial
          color={trunkColor}
          transparent={isPreview}
          opacity={opacity}
          roughness={variation.trunkBarkRoughness}
          metalness={variation.barkTextureType === 'metallic' ? 0.4 : 0}
        />
      </mesh>
      
      {/* Secondary trunk for multi-trunk trees */}
      {variation.hasMulitpleTrunks && (
        <mesh 
          ref={secondaryTrunkRef}
          position={[trunkThickness * 1.5, trunkHeight * 0.45, trunkThickness * 0.5]} 
          rotation={[0, -variation.trunkTwist * 0.7, 0]}
        >
          <cylinderGeometry args={[trunkThickness * 0.5, trunkThickness * 0.7, trunkHeight * 0.9, 10]} />
          <meshStandardMaterial
            color={trunkColor}
            transparent={isPreview}
            opacity={opacity}
            roughness={variation.trunkBarkRoughness * 1.1}
          />
        </mesh>
      )}
      
      {/* Foliage */}
      {growthStage !== 'seed' && renderFoliage()}
      
      {/* Aura ring for high-tier trees */}
      {hasGlow && growthStage !== 'seed' && glowIntensity > 0.4 && (
        <mesh 
          ref={glowRef} 
          position={[0, trunkHeight * 0.9, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[size * 0.9, size * 1.0, 24]} />
          <meshStandardMaterial
            color={tierInfo?.glowColor || foliageColor}
            emissive={tierInfo?.glowColor || foliageColor}
            emissiveIntensity={glowIntensity + variation.emissiveLayerIntensity}
            transparent
            opacity={opacity * 0.4}
            side={2}
          />
        </mesh>
      )}
      
      {/* Particle effects */}
      {renderParticles()}
      
      {/* Ground glow for Origin Trees */}
      {tier === 'Origin Tree' && growthStage !== 'seed' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size * 1.5, 32]} />
          <meshStandardMaterial
            color={tierInfo?.glowColor || '#FFD700'}
            emissive={tierInfo?.glowColor || '#FFD700'}
            emissiveIntensity={0.3 + variation.emissiveLayerIntensity}
            transparent
            opacity={opacity * 0.3}
          />
        </mesh>
      )}
    </group>
  );
}
