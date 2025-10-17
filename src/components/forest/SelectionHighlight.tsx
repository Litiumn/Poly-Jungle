'use client';

import { useRef, useEffect } from 'react';
import type { Vector3 } from '@/types/game';
import * as THREE from 'three';

interface SelectionHighlightProps {
  position: Vector3;
  size?: number;
  color?: string;
  animate?: boolean;
}

export function SelectionHighlight({
  position,
  size = 1.5,
  color = '#4ade80',
  animate = true,
}: SelectionHighlightProps): JSX.Element {
  const ringRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!animate || !ringRef.current) return;

    let frame: number;
    const startTime = Date.now();

    const animateRing = (): void => {
      if (!ringRef.current) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const scale = 1 + Math.sin(elapsed * 3) * 0.1;
      ringRef.current.scale.set(scale, scale, 1);

      frame = requestAnimationFrame(animateRing);
    };

    animateRing();

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animate]);

  return (
    <group position={[position.x, position.y + 0.1, position.z]}>
      {/* Inner ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.8, size * 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.0, size * 1.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      {/* Vertical beam */}
      <mesh position={[0, size * 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, size * 4, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
