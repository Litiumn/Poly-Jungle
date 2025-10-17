'use client';

import type { DecorationData, DecorationType } from '@/lib/self-contained-storage';
import * as THREE from 'three';

interface PlacedDecorationsProps {
  decorations: DecorationData[];
}

function DecorationMesh({ decoration }: { decoration: DecorationData }): JSX.Element {
  const { type, position } = decoration;
  
  // Render based on decoration type
  switch (type) {
    case 'SmallFlower':
      return (
        <group position={[position.x, position.y + 0.2, position.z]}>
          {/* Stem */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 4]} />
            <meshStandardMaterial color="#7cb342" />
          </mesh>
          {/* Petals */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.06, 0.18, Math.sin(angle) * 0.06]}
              >
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial color="#ff6b9d" />
              </mesh>
            );
          })}
          {/* Center */}
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#ffd93d" />
          </mesh>
        </group>
      );
      
    case 'Bush':
      return (
        <group position={[position.x, position.y + 0.25, position.z]}>
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#66bb6a" />
          </mesh>
        </group>
      );
      
    case 'Rock':
      return (
        <mesh position={[position.x, position.y + 0.2, position.z]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.9} />
        </mesh>
      );
      
    case 'Bench':
      return (
        <group position={[position.x, position.y + 0.2, position.z]}>
          {/* Seat */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.8, 0.08, 0.3]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.45, -0.12]}>\n            <boxGeometry args={[0.8, 0.3, 0.08]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          {/* Left leg */}
          <mesh position={[-0.3, 0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* Right leg */}
          <mesh position={[0.3, 0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
        </group>
      );
      
    case 'Lantern':
      return (
        <group position={[position.x, position.y + 0.5, position.z]}>
          {/* Post */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* Lantern */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.15]} />
            <meshStandardMaterial
              color="#ff6b35"
              emissive="#ff6b35"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      );
      
    case 'Fence':
      return (
        <group position={[position.x, position.y + 0.3, position.z]}>
          {/* Post */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* Horizontal bar */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
        </group>
      );
      
    default:
      return <></>;
  }
}

export function PlacedDecorations({ decorations }: PlacedDecorationsProps): JSX.Element {
  return (
    <>
      {decorations.map((decoration) => (
        <DecorationMesh key={decoration.id} decoration={decoration} />
      ))}
    </>
  );
}
