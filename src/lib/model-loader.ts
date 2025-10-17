/**
 * 3D Model Loader System
 * 
 * Supports loading and caching DAE/Collada models for tree species.
 * Provides fallback to procedural models when DAE models are unavailable.
 */

import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import type { TreeSpecies } from './tree-models';

// Model cache to avoid reloading
const modelCache = new Map<string, THREE.Group>();
const loadingPromises = new Map<string, Promise<THREE.Group>>();

// DAE model mappings (only for specific species with DAE models available)
export const DAE_MODEL_PATHS: Partial<Record<TreeSpecies, string>> = {
  'Oak': '/assets/models/oak.dae',
  'Pine': '/assets/models/pine.dae',
  'Maple': '/assets/models/maple.dae',
  'Birch': '/assets/models/birch.dae',
};

/**
 * Check if a tree species has a DAE model available
 */
export function hasDAEModel(species: TreeSpecies): boolean {
  return species in DAE_MODEL_PATHS;
}

/**
 * Load a DAE model for a tree species
 * Returns cached model if already loaded
 */
export async function loadTreeModel(species: TreeSpecies): Promise<THREE.Group | null> {
  // Check if model path exists
  const modelPath = DAE_MODEL_PATHS[species];
  if (!modelPath) {
    console.log(`No DAE model defined for species: ${species}`);
    return null;
  }

  // Return cached model if available
  if (modelCache.has(species)) {
    const cached = modelCache.get(species)!;
    return cached.clone();
  }

  // Return existing loading promise if already loading
  if (loadingPromises.has(species)) {
    const model = await loadingPromises.get(species)!;
    return model.clone();
  }

  // Start loading
  const loadingPromise = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new ColladaLoader();
    
    console.log(`Loading DAE model for ${species} from ${modelPath}`);
    
    loader.load(
      modelPath,
      (collada) => {
        const scene = collada.scene;
        
        // Auto-scale to match current tree proportions
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Scale to unit size (1.5 units tall for mature tree)
        const scale = 1.5 / maxDimension;
        scene.scale.set(scale, scale, scale);
        
        // Center the model
        box.setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
        
        console.log(`✅ Successfully loaded DAE model for ${species}`);
        
        // Cache the model
        modelCache.set(species, scene);
        loadingPromises.delete(species);
        
        resolve(scene);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading ${species} model: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error(`❌ Failed to load DAE model for ${species}:`, error);
        loadingPromises.delete(species);
        reject(error);
      }
    );
  });

  loadingPromises.set(species, loadingPromise);
  
  try {
    const model = await loadingPromise;
    return model.clone();
  } catch (error) {
    console.warn(`Falling back to procedural model for ${species}`);
    return null;
  }
}

/**
 * Preload all available DAE models
 * Call this during app initialization
 */
export async function preloadTreeModels(): Promise<void> {
  console.log('🌳 Preloading tree models...');
  
  const species = Object.keys(DAE_MODEL_PATHS) as TreeSpecies[];
  const loadPromises = species.map(s => loadTreeModel(s).catch(err => {
    console.warn(`Failed to preload model for ${s}:`, err);
    return null;
  }));
  
  await Promise.all(loadPromises);
  
  console.log(`✅ Preloaded ${modelCache.size} tree models`);
}

/**
 * Clear model cache (for testing/debugging)
 */
export function clearModelCache(): void {
  modelCache.clear();
  loadingPromises.clear();
  console.log('🗑️ Model cache cleared');
}

/**
 * Get cache statistics
 */
export function getModelCacheStats(): { cached: number; loading: number; available: number } {
  return {
    cached: modelCache.size,
    loading: loadingPromises.size,
    available: Object.keys(DAE_MODEL_PATHS).length,
  };
}
