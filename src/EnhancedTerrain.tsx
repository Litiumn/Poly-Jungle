'use client';

import { useRef, useMemo } from 'react';
import { Mesh, BoxGeometry, BufferAttribute } from 'three';
import * as THREE from 'three';
import type { Vector3 } from '@/types/game';
import {
  Lake,
  Rock,
  FallenLog,
  GrassPatch,
  Flower,
  Bush,
  Mushroom,
} from './EnvironmentalObjects';

interface EnhancedTerrainProps {
  onTerrainClick: (position: Vector3) => void;
}

export function EnhancedTerrain({ onTerrainClick }: EnhancedTerrainProps): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (event: { point: { x: number; y: number; z: number } }): void => {
    const position: Vector3 = {
      x: Math.round(event.point.x),
      y: 0,
      z: Math.round(event.point.z),
    };
    onTerrainClick(position);
  };

  // Generate random decorative elements
  const environmentalObjects = useMemo(() => {
    const objects = {
      rocks: [] as [number, number, number][],
      logs: [] as [number, number, number][],
      grassPatches: [] as [number, number, number][],
      flowers: [] as [number, number, number][],
      bushes: [] as [number, number, number][],
      mushrooms: [] as [number, number, number][],
    };

    // Water area center (matches Lake position)
    const waterX = 5.3;
    const waterZ = -5.7;
    const waterRadius = 2.0; // Safe radius to avoid water area

    // Helper function to check if position is in water area
    const isInWaterArea = (x: number, z: number): boolean => {
      const dx = x - waterX;
      const dz = z - waterZ;
      return Math.sqrt(dx * dx + dz * dz) < waterRadius;
    };

    // Rocks - avoid water area
    for (let i = 0; i < 8; i++) {
      let x: number;
      let z: number;
      do {
        x = Math.random() * 24.5 - 12.25;
        z = Math.random() * 24.5 - 12.25;
      } while (isInWaterArea(x, z));
      objects.rocks.push([x, 0, z]);
    }

    // Fallen logs removed per user request

    // Grass patches - avoid water area
    for (let i = 0; i < 20; i++) {
      let x: number;
      let z: number;
      do {
        x = Math.random() * 24.5 - 12.25;
        z = Math.random() * 24.5 - 12.25;
      } while (isInWaterArea(x, z));
      objects.grassPatches.push([x, 0, z]);
    }

    // Flowers - avoid water area
    for (let i = 0; i < 15; i++) {
      let x: number;
      let z: number;
      do {
        x = Math.random() * 24.5 - 12.25;
        z = Math.random() * 24.5 - 12.25;
      } while (isInWaterArea(x, z));
      objects.flowers.push([x, 0, z]);
    }

    // Bushes - avoid water area
    for (let i = 0; i < 12; i++) {
      let x: number;
      let z: number;
      do {
        x = Math.random() * 24.5 - 12.25;
        z = Math.random() * 24.5 - 12.25;
      } while (isInWaterArea(x, z));
      objects.bushes.push([x, 0, z]);
    }

    // Mushrooms - avoid water area
    for (let i = 0; i < 10; i++) {
      let x: number;
      let z: number;
      do {
        x = Math.random() * 24.5 - 12.25;
        z = Math.random() * 24.5 - 12.25;
      } while (isInWaterArea(x, z));
      objects.mushrooms.push([x, 0, z]);
    }

    return objects;
  }, []);

  // Create 3D terrain box with oscillating top surface
  const terrainGeometry = useMemo(() => {
    const size = 24.5;
    const depth = 1;
    const segments = 40;
    
    // Step 1: Create a box geometry
    const geo = new BoxGeometry(size, depth, size, segments, 1, segments);
    
    const positions = geo.attributes.position;
    const posArray = positions.array as Float32Array;
    
    // Water area parameters (matches Lake position)
    const waterX = 5.3;
    const waterZ = -5.7;
    const waterHeight = 0.1; // Ground level below water
    const waterRadius = 2.0; // Main flat area
    const transitionRadius = 3.0; // Smooth transition zone
    
    // Step 2 & 3: Create oscillating layer and apply to top vertices
    // Box geometry has vertices arranged as: front, back, top, bottom, left, right faces
    // We need to identify and modify only the top face vertices
    
    for (let i = 0; i < positions.count; i++) {
      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];
      
      // Top face vertices have y = depth/2 (which is 1.0)
      if (Math.abs(y - depth / 2) < 0.01) {
        // This is a top vertex - apply oscillating terrain
        
        // Calculate distance from water center
        const dx = x - waterX;
        const dz = z - waterZ;
        const distToWater = Math.sqrt(dx * dx + dz * dz);
        
        let heightOffset = 0;
        
        if (distToWater < waterRadius) {
          // Inside water area - completely flat at water level
          heightOffset = waterHeight;
        } else if (distToWater < transitionRadius) {
          // Transition zone - smooth blend between flat and hilly
          const blendFactor = (distToWater - waterRadius) / (transitionRadius - waterRadius);
          const hillyHeight =
            Math.sin(x * 0.5) * 0.15 +
            Math.cos(z * 0.6) * 0.1 +
            Math.sin(x * 0.4 + z * 0.4) * 0.2;
          
          // Smooth interpolation
          heightOffset = waterHeight * (1 - blendFactor) + hillyHeight * blendFactor;
        } else {
          // Outside water area - normal hills
          heightOffset =
            Math.sin(x * 0.5) * 0.15 +
            Math.cos(z * 0.6) * 0.1 +
            Math.sin(x * 0.4 + z * 0.4) * 0.2;
        }
        
        // Apply the height offset to the y coordinate
        posArray[i * 3 + 1] = depth / 2 + heightOffset;
      }
    }
    
    // Add vertex colors with enhanced gradients and perlin-like noise
    const colors = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];
      
      // Top face gets enhanced grass color with gradients and noise
      if (y > 0) {
        const distanceFromCenter = Math.sqrt(x * x + z * z) / 12.25;
        
        // Multi-octave perlin-like noise for realistic variation
        const noise1 = Math.sin(x * 0.3) * Math.cos(z * 0.3);
        const noise2 = Math.sin(x * 0.8 + 1.5) * Math.cos(z * 0.8 + 2.3) * 0.5;
        const noise3 = Math.sin(x * 1.5 + 3.7) * Math.cos(z * 1.5 + 4.2) * 0.25;
        const combinedNoise = (noise1 + noise2 + noise3) * 0.08;
        
        // Shadow variation based on height
        const heightShadow = y < 0.3 ? 0.95 : y < 0.5 ? 0.98 : 1.0;
        
        // Radial gradient - darker at edges, lighter at center
        const radialGradient = 1.0 - (distanceFromCenter * 0.15);
        
        // Subtle patches of different grass shades
        const patchVariation = 
          Math.sin(x * 0.15 + z * 0.18) * 
          Math.cos(x * 0.12 - z * 0.14) * 0.08;
        
        const totalVariation = 
          0.9 + 
          combinedNoise + 
          (distanceFromCenter * 0.08) + 
          patchVariation;
        
        // Apply all variations to grass color
        colors[i * 3] = 0.45 * totalVariation * radialGradient * heightShadow;       // R
        colors[i * 3 + 1] = 0.65 * totalVariation * radialGradient * heightShadow;   // G
        colors[i * 3 + 2] = 0.25 * totalVariation * radialGradient * heightShadow;   // B
      } else {
        // Bottom and sides get brown dirt color with subtle variation
        const dirtNoise = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.05;
        colors[i * 3] = 0.35 * (1 + dirtNoise);      // R
        colors[i * 3 + 1] = 0.21 * (1 + dirtNoise);  // G
        colors[i * 3 + 2] = 0.13 * (1 + dirtNoise);  // B
      }
    }
    
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);

  return (
    <>
      {/* 3D Terrain box with oscillating top surface */}
      <mesh
        ref={meshRef}
        position={[0, -0.5, 0]}
        onClick={handleClick}
        receiveShadow
        castShadow
        geometry={terrainGeometry}
      >
        <meshStandardMaterial
          color="#7cb342"
          roughness={0.9}
          metalness={0.0}
          vertexColors
        />
      </mesh>
      
      {/* Subtle ground gradient overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[12.25, 64]} />
        <meshStandardMaterial
          color="#5a9932"
          transparent
          opacity={0.15}
          roughness={1.0}
        />
      </mesh>

      {/* Lake */}
      <Lake />

      {/* Rocks */}
      {environmentalObjects.rocks.map((pos, i) => (
        <Rock key={`rock-${i}`} position={pos} />
      ))}
      
      {/* Specific rocks at x=0, z=-9 (replacing bushes) */}
      {/* Small rock */}
      <mesh position={[-0.4, 0, -9]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </mesh>
      
      {/* Medium rock */}
      <mesh position={[0.5, 0, -8.8]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.0, 0]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.85} />
      </mesh>

      {/* Fallen logs removed */}

      {/* Grass patches */}
      {environmentalObjects.grassPatches.map((pos, i) => (
        <GrassPatch key={`grass-${i}`} position={pos} />
      ))}

      {/* Flowers */}
      {environmentalObjects.flowers.map((pos, i) => (
        <Flower key={`flower-${i}`} position={pos} />
      ))}

      {/* Bushes */}
      {environmentalObjects.bushes.map((pos, i) => (
        <Bush key={`bush-${i}`} position={pos} />
      ))}

      {/* Mushrooms */}
      {environmentalObjects.mushrooms.map((pos, i) => (
        <Mushroom key={`mushroom-${i}`} position={pos} />
      ))}
    </>
  );
}
