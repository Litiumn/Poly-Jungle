/**
 * Terrain height calculation utilities
 * Matches the procedural height generation in EnhancedTerrain.tsx
 */

/**
 * Calculate the terrain height at a given x, z position
 * This must match the height calculation in EnhancedTerrain.tsx
 */
export function getTerrainHeight(x: number, z: number): number {
  // Match the sine wave formula from EnhancedTerrain.tsx lines 114-117
  // (reduced amplitude for smoother terrain)
  const height =
    Math.sin(x * 0.1) * 0.3 +
    Math.cos(z * 0.15) * 0.2 +
    Math.sin(x * 0.05 + z * 0.05) * 0.4;
  
  return height;
}

/**
 * Get the Y position for placing an object on the terrain
 */
export function getTerrainYPosition(x: number, z: number): number {
  return getTerrainHeight(x, z);
}
