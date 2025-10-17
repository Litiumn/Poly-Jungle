/**
 * Wind Controller - Global Wind System Management
 * 
 * Provides utilities to control the global wind system that affects all trees.
 * Can be integrated with weather systems, time of day, or game events.
 */

import { 
  WIND_SYSTEM, 
  triggerWindGust, 
  setWindDirection, 
  setWindStrength 
} from './tree-visual-generator';

export type WindPreset = 'calm' | 'gentle' | 'moderate' | 'strong' | 'storm' | 'hurricane';
export type WindDirection = 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest';

/**
 * Wind preset configurations
 */
const WIND_PRESETS: Record<WindPreset, { strength: number; gustChance: number }> = {
  calm: { strength: 0.1, gustChance: 0.01 },
  gentle: { strength: 0.3, gustChance: 0.05 },
  moderate: { strength: 0.5, gustChance: 0.1 },
  strong: { strength: 0.7, gustChance: 0.2 },
  storm: { strength: 0.85, gustChance: 0.4 },
  hurricane: { strength: 1.0, gustChance: 0.6 },
};

/**
 * Direction vectors (normalized)
 */
const DIRECTION_VECTORS: Record<WindDirection, { x: number; z: number }> = {
  north: { x: 0, z: 1 },
  northeast: { x: 0.707, z: 0.707 },
  east: { x: 1, z: 0 },
  southeast: { x: 0.707, z: -0.707 },
  south: { x: 0, z: -1 },
  southwest: { x: -0.707, z: -0.707 },
  west: { x: -1, z: 0 },
  northwest: { x: -0.707, z: 0.707 },
};

/**
 * Apply a wind preset
 */
export function applyWindPreset(preset: WindPreset): void {
  const config = WIND_PRESETS[preset];
  setWindStrength(config.strength);
  
  // Occasionally trigger gusts based on preset
  if (Math.random() < config.gustChance) {
    const gustIntensity = 0.3 + Math.random() * 0.5;
    const gustDuration = 1000 + Math.random() * 2000;
    triggerWindGust(gustDuration, gustIntensity);
  }
}

/**
 * Set wind direction using compass direction
 */
export function setWindDirectionByCompass(direction: WindDirection): void {
  const vector = DIRECTION_VECTORS[direction];
  setWindDirection(vector.x, vector.z);
}

/**
 * Smoothly transition wind strength over time
 */
export function transitionWindStrength(
  targetStrength: number,
  duration: number = 3000
): Promise<void> {
  return new Promise((resolve) => {
    const startStrength = WIND_SYSTEM.strength;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const newStrength = startStrength + (targetStrength - startStrength) * eased;
      setWindStrength(newStrength);
      
      if (progress >= 1) {
        clearInterval(interval);
        resolve();
      }
    }, 16); // ~60fps
  });
}

/**
 * Smoothly rotate wind direction over time
 */
export function transitionWindDirection(
  targetDirection: WindDirection,
  duration: number = 3000
): Promise<void> {
  return new Promise((resolve) => {
    const targetVector = DIRECTION_VECTORS[targetDirection];
    const startX = WIND_SYSTEM.direction.x;
    const startZ = WIND_SYSTEM.direction.z;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const newX = startX + (targetVector.x - startX) * eased;
      const newZ = startZ + (targetVector.z - startZ) * eased;
      setWindDirection(newX, newZ);
      
      if (progress >= 1) {
        clearInterval(interval);
        resolve();
      }
    }, 16); // ~60fps
  });
}

/**
 * Create a wind sequence (useful for weather events)
 */
export async function playWindSequence(
  sequence: Array<{
    preset?: WindPreset;
    direction?: WindDirection;
    duration?: number;
    gustIntensity?: number;
    gustDuration?: number;
  }>
): Promise<void> {
  for (const step of sequence) {
    const promises: Promise<void>[] = [];
    
    if (step.preset) {
      const config = WIND_PRESETS[step.preset];
      promises.push(transitionWindStrength(config.strength, step.duration || 2000));
    }
    
    if (step.direction) {
      promises.push(transitionWindDirection(step.direction, step.duration || 2000));
    }
    
    await Promise.all(promises);
    
    if (step.gustIntensity !== undefined) {
      triggerWindGust(step.gustDuration || 1500, step.gustIntensity);
    }
    
    // Wait for step duration
    if (step.duration) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  }
}

/**
 * Get current wind state (for debugging/UI)
 */
export function getWindState(): {
  direction: { x: number; z: number };
  strength: number;
  gustActive: boolean;
} {
  return {
    direction: { ...WIND_SYSTEM.direction },
    strength: WIND_SYSTEM.strength,
    gustActive: WIND_SYSTEM.gustActive,
  };
}

/**
 * Start automatic wind variation (for background ambience)
 */
export function startAutomaticWind(options?: {
  minInterval?: number;
  maxInterval?: number;
  strengthRange?: [number, number];
}): () => void {
  const minInterval = options?.minInterval || 5000;
  const maxInterval = options?.maxInterval || 15000;
  const strengthRange = options?.strengthRange || [0.3, 0.7];
  
  let active = true;
  
  const vary = () => {
    if (!active) return;
    
    // Random strength within range
    const targetStrength = strengthRange[0] + Math.random() * (strengthRange[1] - strengthRange[0]);
    transitionWindStrength(targetStrength, 2000 + Math.random() * 2000);
    
    // Occasional direction shift
    if (Math.random() < 0.3) {
      const directions: WindDirection[] = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      transitionWindDirection(randomDir, 3000 + Math.random() * 3000);
    }
    
    // Random gust
    if (Math.random() < 0.15) {
      triggerWindGust(1000 + Math.random() * 2000, 0.3 + Math.random() * 0.4);
    }
    
    // Schedule next variation
    const nextInterval = minInterval + Math.random() * (maxInterval - minInterval);
    setTimeout(vary, nextInterval);
  };
  
  // Start first variation
  setTimeout(vary, minInterval);
  
  // Return stop function
  return () => {
    active = false;
  };
}

/**
 * Example: Integrate with weather system
 */
export function applyWeatherWind(weatherType: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow'): void {
  switch (weatherType) {
    case 'clear':
      applyWindPreset('gentle');
      setWindDirectionByCompass('east');
      break;
    case 'cloudy':
      applyWindPreset('moderate');
      setWindDirectionByCompass('west');
      break;
    case 'rain':
      applyWindPreset('strong');
      setWindDirectionByCompass('southwest');
      triggerWindGust(2000, 0.6);
      break;
    case 'storm':
      applyWindPreset('storm');
      setWindDirectionByCompass('northwest');
      // Frequent gusts during storms
      setInterval(() => {
        if (Math.random() < 0.5) {
          triggerWindGust(1500, 0.7 + Math.random() * 0.3);
        }
      }, 3000);
      break;
    case 'snow':
      applyWindPreset('gentle');
      setWindDirectionByCompass('north');
      break;
  }
}
