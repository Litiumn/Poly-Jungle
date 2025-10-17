'use client';

/**
 * 3D Furniture Models for EcoForest - Comprehensive Dynamic System
 * 
 * Renders 55+ unique furniture models with distinct shapes and styles
 * Based on modelId from furniture templates
 * Optimized for performance with primitive geometries
 */

import type { FurnitureData } from '@/lib/furniture-system';
import { FURNITURE_RARITY_INFO } from '@/lib/furniture-system';

interface FurnitureModelProps {
  furniture: FurnitureData;
  onClick?: () => void;
}

export function FurnitureModel({ furniture, onClick }: FurnitureModelProps): JSX.Element {
  const rarityInfo = FURNITURE_RARITY_INFO[furniture.rarity];
  const pos = furniture.position!;
  const hasGlow = rarityInfo.tier >= 6;
  const rotation = furniture.rotation || 0;

  // Dynamic model rendering based on modelId
  const renderModel = (): JSX.Element => {
    const modelId = furniture.modelId || 'bench_1';
    const baseColor = rarityInfo.color;
    const glowColor = rarityInfo.glowColor;

    // Outdoor seating - bench/chair
    if (modelId.includes('bench') || modelId.includes('chair')) {
      return (
        <group position={[pos.x, 0.3, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 0.1, 0.4]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
          <mesh position={[-0.4, -0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color="#6d4c41" flatShading />
          </mesh>
          <mesh position={[0.4, -0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color="#6d4c41" flatShading />
          </mesh>
        </group>
      );
    }

    // Tables
    if (modelId.includes('table')) {
      return (
        <group position={[pos.x, 0.4, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.1, 0.8]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
          {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([x, z], i) => (
            <mesh key={i} position={[x, -0.3, z]}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
              <meshStandardMaterial color="#6d4c41" flatShading />
            </mesh>
          ))}
        </group>
      );
    }

    // Fences
    if (modelId.includes('fence')) {
      return (
        <group position={[pos.x, 0.35, pos.z]} rotation={[0, rotation, 0]}>
          {[-0.4, 0, 0.4].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <boxGeometry args={[0.08, 0.7, 0.08]} />
              <meshStandardMaterial color={baseColor} flatShading />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.0, 0.05, 0.05]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
        </group>
      );
    }

    // Bridges
    if (modelId.includes('bridge')) {
      return (
        <group position={[pos.x, 0.1, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.0, 0.1, 1.0]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
        </group>
      );
    }

    // Lighting - lanterns/lamps/torches
    if (modelId.includes('lantern') || modelId.includes('lamp') || modelId.includes('torch')) {
      return (
        <group position={[pos.x, 0.5, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={glowColor}
              emissiveIntensity={0.7}
              flatShading 
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
            <meshStandardMaterial color="#424242" flatShading />
          </mesh>
        </group>
      );
    }

    // Decorative pots/planters
    if (modelId.includes('pot') || modelId.includes('planter') || modelId.includes('basket')) {
      return (
        <group position={[pos.x, 0.2, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.18, 0.3, 8]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
          {[-0.08, 0, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.2, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#ff69b4" flatShading />
            </mesh>
          ))}
        </group>
      );
    }

    // Statues/fountains
    if (modelId.includes('statue') || modelId.includes('fountain')) {
      return (
        <group position={[pos.x, 0.5, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.8, 8]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.4 : 0}
              flatShading 
            />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.2, 8]} />
            <meshStandardMaterial color="#8d6e63" flatShading />
          </mesh>
        </group>
      );
    }

    // Structures - gazebo/shed/well
    if (modelId.includes('gazebo') || modelId.includes('shed') || modelId.includes('pavilion') || modelId.includes('kiosk')) {
      return (
        <group position={[pos.x, 0.7, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 1.2, 1.0]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.8, 0.5, 8]} />
            <meshStandardMaterial color="#8d6e63" flatShading />
          </mesh>
        </group>
      );
    }

    if (modelId.includes('well')) {
      return (
        <group position={[pos.x, 0.4, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 0.5, 10]} />
            <meshStandardMaterial color={baseColor} flatShading />
          </mesh>
          {[-0.3, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.5, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
              <meshStandardMaterial color="#6d4c41" flatShading />
            </mesh>
          ))}
          <mesh position={[0, 1.0, 0]}>
            <coneGeometry args={[0.4, 0.3, 6]} />
            <meshStandardMaterial color="#8d6e63" flatShading />
          </mesh>
        </group>
      );
    }

    // Natural items - bushes/rocks/logs/mushrooms
    if (modelId.includes('bush') || modelId.includes('bamboo') || modelId.includes('flower') || modelId.includes('herb') || modelId.includes('lily')) {
      return (
        <group position={[pos.x, 0.25, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial 
              color={baseColor}
              emissive={hasGlow ? glowColor : '#000000'}
              emissiveIntensity={hasGlow ? 0.3 : 0}
              flatShading 
            />
          </mesh>
        </group>
      );
    }

    if (modelId.includes('rock') || modelId.includes('boulder')) {
      return (
        <group position={[pos.x, 0.2, pos.z]} rotation={[0, rotation, 0]}>
          {[0, 0.25, -0.15].map((x, i) => (
            <mesh key={i} position={[x, i * 0.08, i * 0.1]}>
              <dodecahedronGeometry args={[0.25 + i * 0.08, 0]} />
              <meshStandardMaterial color={baseColor} flatShading />
            </mesh>
          ))}
        </group>
      );
    }

    if (modelId.includes('stump') || modelId.includes('log')) {
      return (
        <group position={[pos.x, 0.15, pos.z]} rotation={[0, rotation, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.3, 10]} />
            <meshStandardMaterial color={baseColor} flatShading />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.02, 8, 10]} />
            <meshStandardMaterial color="#6d4c41" flatShading />
          </mesh>
        </group>
      );
    }

    if (modelId.includes('mushroom')) {
      return (
        <group position={[pos.x, 0.12, pos.z]} rotation={[0, rotation, 0]}>
          {[0, 0.15, -0.12].map((x, i) => (
            <group key={i} position={[x, 0, i * 0.08]}>
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial 
                  color="#ff6b6b"
                  emissive={hasGlow ? glowColor : '#000000'}
                  emissiveIntensity={hasGlow ? 0.4 : 0}
                  flatShading 
                />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.12, 6]} />
                <meshStandardMaterial color="#fff5e1" flatShading />
              </mesh>
            </group>
          ))}
        </group>
      );
    }

    // Default fallback
    return (
      <mesh position={[pos.x, 0.3, pos.z]} rotation={[0, rotation, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={baseColor}
          emissive={hasGlow ? glowColor : '#000000'}
          emissiveIntensity={hasGlow ? 0.3 : 0}
          flatShading 
        />
      </mesh>
    );
  };

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {renderModel()}
      
      {hasGlow && (
        <mesh position={[pos.x, 0.05, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 16]} />
          <meshStandardMaterial
            color={rarityInfo.glowColor}
            emissive={rarityInfo.glowColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

interface PlacedFurnitureProps {
  furniture: FurnitureData;
  onFurnitureClick?: (furnitureId: string) => void;
}

export function PlacedFurniture({ furniture, onFurnitureClick }: PlacedFurnitureProps): JSX.Element {
  if (!furniture.placed || !furniture.position) {
    return <></>;
  }

  return (
    <FurnitureModel
      furniture={furniture}
      onClick={() => onFurnitureClick?.(furniture.id)}
    />
  );
}
