/**
 * Wind System - Lightweight wind animation for trees
 * 
 * Features:
 * - Sinusoidal oscillation for realistic swaying
 * - Performance-optimized with throttling
 * - Configurable wind strength and direction
 */

import * as THREE from 'three';

export interface WindConfig {
  strength: number; // 0.0 - 1.0
  direction: THREE.Vector2; // Wind direction (normalized)
  frequency: number; // Oscillation frequency (Hz)
  gustiness: number; // Random gust variation (0.0 - 1.0)
}

export interface TreeWindState {
  baseRotation: THREE.Euler;
  swayOffset: THREE.Vector2;
  phase: number;
}

const DEFAULT_WIND_CONFIG: WindConfig = {
  strength: 0.3,
  direction: new THREE.Vector2(1, 0.5).normalize(),
  frequency: 0.5, // 0.5 Hz = gentle breeze
  gustiness: 0.2,
};

let globalWindConfig: WindConfig = { ...DEFAULT_WIND_CONFIG };
let windTime: number = 0;

/**
 * Update wind configuration
 */
export function setWindConfig(config: Partial<WindConfig>): void {
  globalWindConfig = { ...globalWindConfig, ...config };
}

/**
 * Get current wind configuration
 */
export function getWindConfig(): WindConfig {
  return { ...globalWindConfig };
}

/**
 * Calculate wind effect for a tree at given position
 */
export function calculateWindEffect(
  position: THREE.Vector3,
  treeHeight: number,
  time: number
): TreeWindState {
  windTime = time;
  
  // Calculate base wind oscillation
  const windPhase = time * globalWindConfig.frequency * Math.PI * 2;
  
  // Add spatial variation based on tree position (creates wave-like effect across forest)
  const spatialPhase = 
    position.x * 0.1 + 
    position.z * 0.15;
  
  const totalPhase = windPhase + spatialPhase;
  
  // Calculate sway amount (stronger at top of tree)
  const heightFactor = treeHeight / 4; // Normalize to typical tree height
  const swayStrength = globalWindConfig.strength * heightFactor * 0.15; // Max 15 degrees
  
  // Add gust variation
  const gustFactor = 
    Math.sin(totalPhase * 1.7) * 
    Math.cos(totalPhase * 0.8) * 
    globalWindConfig.gustiness;
  
  const finalSwayStrength = swayStrength * (1 + gustFactor);
  
  // Calculate rotation based on wind direction
  const swayX = 
    Math.sin(totalPhase) * 
    finalSwayStrength * 
    globalWindConfig.direction.y;
  
  const swayZ = 
    Math.sin(totalPhase * 1.1) * 
    finalSwayStrength * 
    globalWindConfig.direction.x;
  
  return {
    baseRotation: new THREE.Euler(swayX, 0, swayZ),
    swayOffset: new THREE.Vector2(
      Math.sin(totalPhase) * finalSwayStrength * 0.5,
      Math.cos(totalPhase * 1.2) * finalSwayStrength * 0.5
    ),
    phase: totalPhase,
  };
}

/**
 * Apply wind effect to a Three.js group
 */
export function applyWindToGroup(
  group: THREE.Group,
  position: THREE.Vector3,
  treeHeight: number,
  time: number
): void {
  const windEffect = calculateWindEffect(position, treeHeight, time);
  
  // Apply rotation to the group
  group.rotation.x = windEffect.baseRotation.x;
  group.rotation.z = windEffect.baseRotation.z;
}

/**
 * Create random wind gusts
 */
export function createWindGust(duration: number = 2000): void {
  const originalStrength = globalWindConfig.strength;
  const gustStrength = originalStrength * (1.5 + Math.random() * 0.5);
  
  // Animate wind strength increase
  globalWindConfig.strength = gustStrength;
  
  // Gradually return to normal
  setTimeout(() => {
    const steps = 20;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      globalWindConfig.strength = 
        gustStrength * (1 - progress) + 
        originalStrength * progress;
      
      if (currentStep >= steps) {
        clearInterval(interval);
        globalWindConfig.strength = originalStrength;
      }
    }, duration / steps);
  }, duration * 0.3);
}

/**
 * Randomize wind direction
 */
export function randomizeWindDirection(): void {
  const angle = Math.random() * Math.PI * 2;
  globalWindConfig.direction = new THREE.Vector2(
    Math.cos(angle),
    Math.sin(angle)
  ).normalize();
}

/**
 * Update wind system (call this every frame if needed)
 */
export function updateWindSystem(deltaTime: number): void {
  windTime += deltaTime;
  
  // Occasionally create random gusts
  if (Math.random() < 0.001) { // 0.1% chance per frame
    createWindGust();
  }
  
  // Slowly rotate wind direction
  if (Math.random() < 0.0005) { // 0.05% chance per frame
    const currentAngle = Math.atan2(
      globalWindConfig.direction.y,
      globalWindConfig.direction.x
    );
    const newAngle = currentAngle + (Math.random() - 0.5) * 0.5;
    globalWindConfig.direction = new THREE.Vector2(
      Math.cos(newAngle),
      Math.sin(newAngle)
    ).normalize();
  }
}
