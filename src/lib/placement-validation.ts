/**
 * Placement Validation System
 * 
 * Strict validation rules for tree and furniture placement:
 * - Minimum distance from other objects
 * - Water detection
 * - Terrain slope limits
 * - Boundary checking
 */

import type { Vector3 } from '@/types/game';
import type { PlacedObject } from './placement-manager';
import * as THREE from 'three';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ValidationConfig {
  minSpacing: number;
  maxSlope: number;
  waterHeight: number;
  boundaryRadius: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  minSpacing: 2.5, // Minimum distance between objects
  maxSlope: 0.35, // Maximum slope (tan of angle)
  waterHeight: -0.5, // Water surface height
  boundaryRadius: 22, // Maximum distance from center (reduced with 30% ground size reduction)
};

/**
 * Calculate Euclidean distance between two points
 */
function distance(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if position is too close to existing objects
 */
export function validateDistance(
  position: Vector3,
  existingObjects: PlacedObject[],
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { minSpacing } = { ...DEFAULT_CONFIG, ...config };
  
  for (const obj of existingObjects) {
    const dist = distance(position, obj.position);
    if (dist < minSpacing) {
      return {
        valid: false,
        reason: `Too close to another object (${dist.toFixed(1)}m < ${minSpacing}m)`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check if position is on water
 */
export function validateWater(
  position: Vector3,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { waterHeight } = { ...DEFAULT_CONFIG, ...config };
  
  // Check if position is below water surface
  if (position.y <= waterHeight) {
    return {
      valid: false,
      reason: 'Cannot plant on water',
    };
  }
  
  // Check if position is near lake (hardcoded lake position)
  const lakeCenter = { x: -15, y: waterHeight, z: 15 };
  const lakeRadius = 8;
  const distToLake = Math.sqrt(
    Math.pow(position.x - lakeCenter.x, 2) +
    Math.pow(position.z - lakeCenter.z, 2)
  );
  
  if (distToLake < lakeRadius) {
    return {
      valid: false,
      reason: 'Cannot plant in lake',
    };
  }
  
  return { valid: true };
}

/**
 * Check if terrain slope is acceptable
 */
export function validateSlope(
  terrainNormal: THREE.Vector3,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { maxSlope } = { ...DEFAULT_CONFIG, ...config };
  
  // Calculate slope from normal vector
  // Normal points up (0,1,0) on flat ground
  const up = new THREE.Vector3(0, 1, 0);
  const angle = terrainNormal.angleTo(up);
  const slope = Math.tan(angle);
  
  if (slope > maxSlope) {
    return {
      valid: false,
      reason: `Terrain too steep (${(angle * 180 / Math.PI).toFixed(1)}° > ${(Math.atan(maxSlope) * 180 / Math.PI).toFixed(1)}°)`,
    };
  }
  
  return { valid: true };
}

/**
 * Check if position is within playable boundaries
 */
export function validateBoundary(
  position: Vector3,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { boundaryRadius } = { ...DEFAULT_CONFIG, ...config };
  
  const distFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
  
  if (distFromCenter > boundaryRadius) {
    return {
      valid: false,
      reason: 'Too far from forest center',
    };
  }
  
  return { valid: true };
}

/**
 * Comprehensive validation check
 */
export function validatePlacement(
  position: Vector3,
  terrainNormal: THREE.Vector3,
  existingObjects: PlacedObject[],
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  // Check distance to other objects
  const distanceCheck = validateDistance(position, existingObjects, config);
  if (!distanceCheck.valid) return distanceCheck;
  
  // Check water
  const waterCheck = validateWater(position, config);
  if (!waterCheck.valid) return waterCheck;
  
  // Check slope
  const slopeCheck = validateSlope(terrainNormal, config);
  if (!slopeCheck.valid) return slopeCheck;
  
  // Check boundaries
  const boundaryCheck = validateBoundary(position, config);
  if (!boundaryCheck.valid) return boundaryCheck;
  
  return { valid: true };
}

/**
 * Get validation config with custom overrides
 */
export function getValidationConfig(overrides: Partial<ValidationConfig> = {}): ValidationConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}
