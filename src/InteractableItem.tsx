'use client';

import { useRef } from 'react';
import { Mesh } from 'three';
import type { TrashItem, WeedClump } from '@/types/game';

interface InteractableItemProps {
  item: TrashItem | WeedClump;
  onClick: () => void;
}

export function InteractableItem({ item, onClick }: InteractableItemProps): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  const isTrash = item.type === 'trash';
  const color = isTrash ? '#795548' : '#8d6e63';
  const shape = isTrash ? 'box' : 'sphere';

  return (
    <mesh
      ref={meshRef}
      position={[item.position.x, 0.5, item.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      castShadow
    >
      {shape === 'box' ? (
        <boxGeometry args={[0.8, 0.8, 0.8]} />
      ) : (
        <sphereGeometry args={[0.5, 8, 8]} />
      )}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
