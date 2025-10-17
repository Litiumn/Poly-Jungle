'use client';

import { useRef, useMemo } from 'react';
import type { Mesh } from 'three';
import * as THREE from 'three';

export function Lake(): JSX.Element {
  // Create circular water geometry with slight imperfections and low-poly height variations
  const waterGeometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(2.2, 16); // Circle with 16 segments for low-poly look
    const positions = geo.attributes.position;
    
    // Apply slight imperfections to make it not perfectly circular
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Skip center vertex (it's at 0,0)
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 0.1) continue;
      
      // Calculate angle for this vertex
      const angle = Math.atan2(y, x);
      
      // Add slight radius variations (8-12% variation)
      const radiusVariation = 1.0 + Math.sin(angle * 4) * 0.1 + Math.cos(angle * 7) * 0.08;
      
      // Adjust vertex position for imperfect circle
      positions.setX(i, x * radiusVariation);
      positions.setY(i, y * radiusVariation);
      
      // Add low-poly height variations for texture
      const heightVariation = 
        Math.sin(x * 1.5) * 0.07 +
        Math.cos(y * 1.3) * 0.06 +
        Math.sin(angle * 5) * 0.05;
      
      positions.setZ(i, heightVariation);
    }
    
    // Compute normals for faceted low-poly look
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <group position={[0.5, 0.15, -9]}>
      {/* Water surface with glossy low-poly material */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        geometry={waterGeometry}
      >
        <meshStandardMaterial
          color="#2a8bc8"
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0.7}
          emissive="#1a5d8a"
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
          depthWrite={true}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}

export function Rock({ position }: { position: [number, number, number] }): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#808080" roughness={0.9} />
    </mesh>
  );
}

export function FallenLog({ position }: { position: [number, number, number] }): JSX.Element {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 12]} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.35, 4, 8]} />
      <meshStandardMaterial color="#6b4423" roughness={0.8} />
    </mesh>
  );
}

export function GrassPatch({ position }: { position: [number, number, number] }): JSX.Element {
  return (
    <group position={position}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = Math.random() * 0.5;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        return (
          <mesh key={i} position={[x, 0.2, z]} rotation={[0, angle, 0]}>
            <coneGeometry args={[0.05, 0.4, 3]} />
            <meshStandardMaterial color="#90ee90" />
          </mesh>
        );
      })}
    </group>
  );
}

export function Flower({ position }: { position: [number, number, number] }): JSX.Element {
  const colors = ['#ff69b4', '#ffd700', '#ff6347', '#9370db', '#00bfff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
      {/* Petals */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 0.15;
        const z = Math.sin(angle) * 0.15;

        return (
          <mesh key={i} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, angle]}>
            <circleGeometry args={[0.1, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {/* Center */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffa500" />
      </mesh>
    </group>
  );
}

export function Bush({ position }: { position: [number, number, number] }): JSX.Element {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#228b22" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.3]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Mushroom({ position }: { position: [number, number, number] }): JSX.Element {
  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#dc143c" />
      </mesh>
      {/* White spots */}
      <mesh position={[0.1, 0.38, 0.1]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.08, 0.36, 0.08]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
