/**
 * Unified Placement Manager
 * 
 * Core utilities for object placement in the 3D forest scene.
 * Provides low-level functions for positioning, validation, and terrain interaction.
 * 
 * Used by usePlacementSystem hook for high-level React integration.
 * 
 * Key Functions:
 * - snapToGrid: Align positions to grid cells
 * - isValidPlacement: Check collision with existing objects
 * - getTerrainHeightAndNormal: Sample terrain geometry
 * - alignToSlope: Calculate natural object rotation based on terrain
 * - updatePreviewPosition: Validate and update preview state
 * 
 * @module placement-manager
 */

import type { Vector3 } from '@/types/game';
import * as THREE from 'three';

export type PlacementMode = 'tree' | 'furniture' | 'none';
export type EditMode = 'move' | 'none';

export interface PlacementState {
  mode: PlacementMode;
  editMode: EditMode;
  previewPosition: Vector3 | null;
  previewRotation: number; // in radians
  selectedItemId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  isValidPlacement: boolean;
}

export interface PlacedObject {
  id: string;
  type: 'tree' | 'furniture';
  position: Vector3;
  rotation: number;
  metadata?: Record<string, unknown>;
}

/**
 * Snap a position to grid
 */
export function snapToGrid(position: Vector3, gridSize: number): Vector3 {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: position.y,
    z: Math.round(position.z / gridSize) * gridSize,
  };
}

/**
 * Calculate terrain height and normal at a given position
 * Uses raycasting to sample the terrain
 */
export function getTerrainHeightAndNormal(
  position: Vector3,
  terrainMesh: THREE.Mesh | null
): { height: number; normal: THREE.Vector3 } {
  if (!terrainMesh) {
    return { height: 0, normal: new THREE.Vector3(0, 1, 0) };
  }

  // Create a raycaster pointing down from above the position
  const raycaster = new THREE.Raycaster();
  const origin = new THREE.Vector3(position.x, 50, position.z);
  const direction = new THREE.Vector3(0, -1, 0);
  
  raycaster.set(origin, direction);
  
  const intersects = raycaster.intersectObject(terrainMesh, true);
  
  if (intersects.length > 0) {
    const intersection = intersects[0];
    return {
      height: intersection.point.y,
      normal: intersection.face ? intersection.face.normal.clone() : new THREE.Vector3(0, 1, 0),
    };
  }
  
  return { height: 0, normal: new THREE.Vector3(0, 1, 0) };
}

/**
 * Align object rotation to terrain slope
 * Returns adjusted rotation that accounts for terrain normal
 */
export function alignToSlope(
  baseRotation: number,
  normal: THREE.Vector3
): { rotation: number; tilt: THREE.Euler } {
  // Calculate tilt based on terrain normal
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(up, normal.clone().normalize());
  
  const tilt = new THREE.Euler();
  tilt.setFromQuaternion(quaternion);
  
  return {
    rotation: baseRotation,
    tilt,
  };
}

/**
 * Rotate preview by specified angle (in degrees)
 */
export function rotatePreview(currentRotation: number, degrees: number): number {
  const newRotation = currentRotation + (degrees * Math.PI / 180);
  // Keep rotation between 0 and 2*PI
  return newRotation % (Math.PI * 2);
}

/**
 * Check if a position is valid for placement
 * Uses comprehensive validation including water, slope, and distance checks
 */
export function isValidPlacement(
  position: Vector3,
  existingObjects: PlacedObject[],
  terrainNormal: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  minDistance: number = 2.5,
  terrainBounds: { minX: number; maxX: number; minZ: number; maxZ: number } = {
    minX: -45,
    maxX: 45,
    minZ: -45,
    maxZ: 45,
  }
): boolean {
  // Import validation functions
  const { validatePlacement } = require('./placement-validation');
  
  // Check terrain bounds
  if (
    position.x < terrainBounds.minX ||
    position.x > terrainBounds.maxX ||
    position.z < terrainBounds.minZ ||
    position.z > terrainBounds.maxZ
  ) {
    return false;
  }
  
  // Use comprehensive validation
  const result = validatePlacement(position, terrainNormal, existingObjects, { minSpacing: minDistance });
  
  return result.valid;
}

/**
 * Find the closest placed object to a position
 */
export function findClosestObject(
  position: Vector3,
  objects: PlacedObject[],
  maxDistance: number = 3
): PlacedObject | null {
  let closest: PlacedObject | null = null;
  let minDistance = maxDistance;
  
  for (const obj of objects) {
    const dx = obj.position.x - position.x;
    const dz = obj.position.z - position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = obj;
    }
  }
  
  return closest;
}

/**
 * Create initial placement state
 */
export function createPlacementState(): PlacementState {
  return {
    mode: 'none',
    editMode: 'none',
    previewPosition: null,
    previewRotation: 0,
    selectedItemId: null,
    snapToGrid: true,
    gridSize: 1,
    isValidPlacement: false,
  };
}

/**
 * Update preview position with snapping and validation
 */
export function updatePreviewPosition(
  state: PlacementState,
  rawPosition: Vector3,
  existingObjects: PlacedObject[],
  terrainMesh: THREE.Mesh | null
): PlacementState {
  // Apply grid snapping if enabled
  const snappedPosition = state.snapToGrid
    ? snapToGrid(rawPosition, state.gridSize)
    : rawPosition;
  
  // Get terrain height at this position
  const { height } = getTerrainHeightAndNormal(snappedPosition, terrainMesh);
  
  const finalPosition: Vector3 = {
    ...snappedPosition,
    y: height,
  };
  
  // Validate placement
  const isValid = isValidPlacement(finalPosition, existingObjects);
  
  return {
    ...state,
    previewPosition: finalPosition,
    isValidPlacement: isValid,
  };
}

/**
 * Calculate smooth slope alignment for an object
 * Returns a THREE.Euler rotation that makes the object rest naturally on terrain
 */
export function calculateSlopeAlignment(normal: THREE.Vector3, yRotation: number): THREE.Euler {
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  
  // Create rotation from up vector to terrain normal
  quaternion.setFromUnitVectors(up, normal.clone().normalize());
  
  // Convert to Euler and combine with Y rotation
  const euler = new THREE.Euler();
  euler.setFromQuaternion(quaternion);
  euler.y += yRotation;
  
  return euler;
}
