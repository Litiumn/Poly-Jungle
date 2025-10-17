/**
 * Tree Animation System - Smooth lifecycle transitions
 * 
 * Features:
 * - Planting animations with scale and particle effects
 * - Tree cutting animations with tilt, fall, and fade
 * - Consistent timing and easing
 * - Three.js compatible with useFrame integration
 */

import type { Group as ThreeGroup } from 'three';
import * as THREE from 'three';

export interface TreeAnimationState {
  isAnimating: boolean;
  animationType: 'planting' | 'cutting' | 'idle';
  progress: number; // 0 to 1
  startTime: number;
  duration: number;
}

/**
 * Animation configuration
 */
export const TREE_ANIMATION_CONFIG = {
  planting: {
    duration: 1200, // ms
    scaleFrom: 0.1,
    scaleTo: 1.0,
    easing: 'easeOutBack', // Power2.out with overshoot
  },
  cutting: {
    duration: 1500, // ms
    tiltAngle: Math.PI / 2, // 90 degrees
    fallDistance: 0.8,
    fadeStart: 0.6, // Start fading at 60% progress
    easing: 'easeInQuad',
  },
} as const;

/**
 * Easing functions
 */
export const easingFunctions = {
  linear: (t: number): number => t,
  
  easeOutQuad: (t: number): number => t * (2 - t),
  
  easeInQuad: (t: number): number => t * t,
  
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  easeInOutQuad: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

/**
 * Create initial planting animation state
 */
export function createPlantingAnimation(): TreeAnimationState {
  return {
    isAnimating: true,
    animationType: 'planting',
    progress: 0,
    startTime: Date.now(),
    duration: TREE_ANIMATION_CONFIG.planting.duration,
  };
}

/**
 * Create tree cutting animation state
 */
export function createCuttingAnimation(): TreeAnimationState {
  return {
    isAnimating: true,
    animationType: 'cutting',
    progress: 0,
    startTime: Date.now(),
    duration: TREE_ANIMATION_CONFIG.cutting.duration,
  };
}

/**
 * Update animation progress based on elapsed time
 */
export function updateAnimationProgress(
  animState: TreeAnimationState,
  currentTime: number
): TreeAnimationState {
  if (!animState.isAnimating) return animState;
  
  const elapsed = currentTime - animState.startTime;
  const rawProgress = Math.min(elapsed / animState.duration, 1);
  
  // Apply easing
  let easedProgress = rawProgress;
  if (animState.animationType === 'planting') {
    easedProgress = easingFunctions.easeOutBack(rawProgress);
  } else if (animState.animationType === 'cutting') {
    easedProgress = easingFunctions.easeInQuad(rawProgress);
  }
  
  return {
    ...animState,
    progress: easedProgress,
    isAnimating: rawProgress < 1,
  };
}

/**
 * Apply planting animation to a Three.js group
 */
export function applyPlantingAnimation(
  group: ThreeGroup,
  progress: number
): void {
  const config = TREE_ANIMATION_CONFIG.planting;
  
  // Scale animation
  const scale = THREE.MathUtils.lerp(config.scaleFrom, config.scaleTo, progress);
  group.scale.set(scale, scale, scale);
  
  // Subtle bounce
  const bounce = Math.sin(progress * Math.PI) * 0.1 * (1 - progress);
  group.position.y += bounce;
}

/**
 * Apply cutting animation to a Three.js group
 */
export function applyCuttingAnimation(
  group: ThreeGroup,
  progress: number,
  fallDirection: THREE.Vector2 = new THREE.Vector2(1, 0)
): {
  opacity: number;
  shouldRemove: boolean;
} {
  const config = TREE_ANIMATION_CONFIG.cutting;
  
  // Tilt animation - tree falls in specified direction
  const tiltAmount = progress * config.tiltAngle;
  group.rotation.x = tiltAmount * Math.abs(fallDirection.y);
  group.rotation.z = tiltAmount * fallDirection.x;
  
  // Fall down slightly
  const fallAmount = progress * config.fallDistance;
  group.position.y -= fallAmount;
  
  // Fade out in final stage
  let opacity = 1.0;
  if (progress > config.fadeStart) {
    const fadeProgress = (progress - config.fadeStart) / (1 - config.fadeStart);
    opacity = 1 - fadeProgress;
  }
  
  return {
    opacity,
    shouldRemove: progress >= 1,
  };
}

/**
 * Generate random fall direction based on tree position
 */
export function getRandomFallDirection(seed: number): THREE.Vector2 {
  // Use seed for consistent direction
  const angle = (seed % 360) * (Math.PI / 180);
  return new THREE.Vector2(Math.cos(angle), Math.sin(angle)).normalize();
}

/**
 * Create particle effect data for planting
 */
export interface PlantingParticle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number; // 0 to 1
  size: number;
  color: string;
}

export function generatePlantingParticles(
  treePosition: THREE.Vector3,
  count: number = 12
): PlantingParticle[] {
  const particles: PlantingParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    particles.push({
      id: i,
      position: new THREE.Vector3(
        treePosition.x + x,
        treePosition.y + 0.1,
        treePosition.z + z
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        0.03 + Math.random() * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      life: 1.0,
      size: 0.08 + Math.random() * 0.06,
      color: Math.random() > 0.5 ? '#8B4513' : '#A0522D', // Soil colors
    });
  }
  
  return particles;
}

/**
 * Update particle positions and life
 */
export function updatePlantingParticles(
  particles: PlantingParticle[],
  deltaTime: number
): PlantingParticle[] {
  return particles
    .map(particle => ({
      ...particle,
      position: particle.position.clone().add(
        particle.velocity.clone().multiplyScalar(deltaTime * 60)
      ),
      velocity: particle.velocity.clone().add(
        new THREE.Vector3(0, -0.001 * deltaTime * 60, 0) // Gravity
      ),
      life: particle.life - deltaTime * 0.8, // Fade over time
    }))
    .filter(particle => particle.life > 0);
}

/**
 * Generate leaf scatter particles for cutting
 */
export interface CuttingParticle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  life: number;
  size: number;
  color: string;
}

export function generateCuttingParticles(
  treePosition: THREE.Vector3,
  foliageColor: string,
  count: number = 20
): CuttingParticle[] {
  const particles: CuttingParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + Math.random() * 0.5;
    const height = 1 + Math.random() * 2;
    
    particles.push({
      id: i,
      position: new THREE.Vector3(
        treePosition.x + Math.cos(angle) * radius,
        treePosition.y + height,
        treePosition.z + Math.sin(angle) * radius
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        0.02 + Math.random() * 0.06,
        (Math.random() - 0.5) * 0.08
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      life: 1.0,
      size: 0.1 + Math.random() * 0.15,
      color: foliageColor,
    });
  }
  
  return particles;
}

/**
 * Update cutting particles (leaves falling)
 */
export function updateCuttingParticles(
  particles: CuttingParticle[],
  deltaTime: number
): CuttingParticle[] {
  return particles
    .map(particle => ({
      ...particle,
      position: particle.position.clone().add(
        particle.velocity.clone().multiplyScalar(deltaTime * 60)
      ),
      velocity: particle.velocity.clone().add(
        new THREE.Vector3(0, -0.002 * deltaTime * 60, 0) // Gravity
      ),
      rotation: new THREE.Euler(
        particle.rotation.x + particle.rotationSpeed.x * deltaTime,
        particle.rotation.y + particle.rotationSpeed.y * deltaTime,
        particle.rotation.z + particle.rotationSpeed.z * deltaTime
      ),
      life: particle.life - deltaTime * 0.6,
    }))
    .filter(particle => particle.life > 0);
}
