'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NFTGlowEffectProps {
  position: [number, number, number];
  size: number;
}

export function NFTGlowEffect({ position, size }: NFTGlowEffectProps): JSX.Element {
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (glowRef.current) {
      // Pulsing glow effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      glowRef.current.scale.set(scale, scale, scale);
      
      // Rotate slowly
      glowRef.current.rotation.y += 0.02;
    }
  });
  
  return (
    <mesh ref={glowRef} position={position}>
      <torusGeometry args={[size * 0.6, 0.08, 8, 16]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffaa00"
        emissiveIntensity={1.5}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
