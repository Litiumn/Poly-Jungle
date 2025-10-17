'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoordinateDebugToolProps {
  enabled: boolean;
  onTerrainHover?: (x: number, y: number, z: number) => void;
  onTerrainClick?: (x: number, y: number, z: number) => void;
  gridSize?: number;
  gridDivisions?: number;
}

export function CoordinateDebugTool({
  enabled,
  onTerrainHover,
  onTerrainClick,
  gridSize = 50,
  gridDivisions = 50,
}: CoordinateDebugToolProps): JSX.Element {
  const { scene, raycaster, camera, pointer } = useThree();
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const groundPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPointRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Add grid and axes helpers to scene
  useEffect(() => {
    if (!enabled) {
      // Remove helpers if they exist
      if (gridHelperRef.current) {
        scene.remove(gridHelperRef.current);
        gridHelperRef.current.dispose();
        gridHelperRef.current = null;
      }
      if (axesHelperRef.current) {
        scene.remove(axesHelperRef.current);
        axesHelperRef.current.dispose();
        axesHelperRef.current = null;
      }
      return;
    }

    // Create grid helper (horizontal grid on Y=0 plane)
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, '#ffaa00', '#666666');
    gridHelper.position.set(0, 0.01, 0); // Slightly above ground to prevent z-fighting
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

    // Create axes helper (shows X=red, Y=green, Z=blue)
    const axesHelper = new THREE.AxesHelper(15);
    axesHelper.position.set(0, 0.02, 0);
    axesHelperRef.current = axesHelper;
    scene.add(axesHelper);

    return () => {
      if (gridHelperRef.current) {
        scene.remove(gridHelperRef.current);
        gridHelperRef.current.dispose();
      }
      if (axesHelperRef.current) {
        scene.remove(axesHelperRef.current);
        axesHelperRef.current.dispose();
      }
    };
  }, [enabled, scene, gridSize, gridDivisions]);

  // Track cursor position on ground plane
  useFrame(() => {
    if (!enabled) return;

    // Cast ray from camera through cursor position
    raycaster.setFromCamera(pointer, camera);

    // Intersect with ground plane (Y = 0)
    const intersects = raycaster.ray.intersectPlane(groundPlaneRef.current, intersectionPointRef.current);

    if (intersects) {
      const pos = {
        x: Math.round(intersectionPointRef.current.x * 10) / 10,
        y: Math.round(intersectionPointRef.current.y * 10) / 10,
        z: Math.round(intersectionPointRef.current.z * 10) / 10,
      };
      setHoveredPosition(pos);
      onTerrainHover?.(pos.x, pos.y, pos.z);
    } else {
      setHoveredPosition(null);
    }
  });

  // Handle click events
  const handleClick = useCallback(() => {
    if (!enabled || !hoveredPosition) return;
    onTerrainClick?.(hoveredPosition.x, hoveredPosition.y, hoveredPosition.z);
  }, [enabled, hoveredPosition, onTerrainClick]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [enabled, handleClick]);

  // Render coordinate marker at cursor position
  if (!enabled || !hoveredPosition) return <></>;

  return (
    <>
      {/* Cursor position marker */}
      <mesh position={[hoveredPosition.x, 0.1, hoveredPosition.z]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 8]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
      </mesh>

      {/* Coordinate lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              hoveredPosition.x, 0, hoveredPosition.z,
              hoveredPosition.x, 5, hoveredPosition.z,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffaa00" linewidth={2} />
      </line>
    </>
  );
}

interface DebugCoordinateDisplayProps {
  enabled: boolean;
  cursorPosition: { x: number; y: number; z: number } | null;
  clickedPosition: { x: number; y: number; z: number } | null;
}

export function DebugCoordinateDisplay({
  enabled,
  cursorPosition,
  clickedPosition,
}: DebugCoordinateDisplayProps): JSX.Element {
  if (!enabled) return <></>;

  return (
    <div className="absolute top-24 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg font-mono text-sm z-50 space-y-2">
      <div className="font-bold text-yellow-400 border-b border-yellow-400/30 pb-2 mb-2">
        📍 Coordinate Debug Tool
      </div>
      
      <div className="space-y-1">
        <div className="text-gray-400 text-xs">Cursor Position:</div>
        {cursorPosition ? (
          <div className="bg-black/50 px-2 py-1 rounded">
            <div className="text-red-400">X: {cursorPosition.x.toFixed(1)}</div>
            <div className="text-green-400">Y: {cursorPosition.y.toFixed(1)}</div>
            <div className="text-blue-400">Z: {cursorPosition.z.toFixed(1)}</div>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">Move cursor over ground</div>
        )}
      </div>

      {clickedPosition && (
        <div className="space-y-1 border-t border-gray-600 pt-2">
          <div className="text-gray-400 text-xs">Last Clicked:</div>
          <div className="bg-yellow-900/30 px-2 py-1 rounded border border-yellow-600/30">
            <div className="text-red-400">X: {clickedPosition.x.toFixed(1)}</div>
            <div className="text-green-400">Y: {clickedPosition.y.toFixed(1)}</div>
            <div className="text-blue-400">Z: {clickedPosition.z.toFixed(1)}</div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
        <div>🔴 Red axis = X</div>
        <div>🟢 Green axis = Y</div>
        <div>🔵 Blue axis = Z</div>
      </div>
    </div>
  );
}
