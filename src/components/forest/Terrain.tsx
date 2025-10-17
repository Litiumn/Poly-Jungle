'use client';

import { useRef } from 'react';
import { Mesh } from 'three';
import type { Vector3 } from '@/types/game';

interface TerrainProps {
  onTerrainClick: (position: Vector3) => void;
}

export function Terrain({ onTerrainClick }: TerrainProps): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (event: {point: {x: number; y: number; z: number}}): void => {
    const position: Vector3 = {
      x: Math.round(event.point.x),
      y: 0,
      z: Math.round(event.point.z),
    };
    onTerrainClick(position);
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 20, 20]} />
      <meshStandardMaterial color="#7cb342" wireframe={false} />
    </mesh>
  );
}
