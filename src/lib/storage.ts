/**
 * EcoForest Base — Production localStorage Wrapper
 * 
 * This is the PRODUCTION storage system using the main GameState type.
 * For the demo/self-contained mode, see self-contained-storage.ts
 * 
 * Architecture Decision:
 * - storage.ts: Production mode with simplified GameState
 * - self-contained-storage.ts: Demo mode with GameStateData (includes mock APIs)
 * 
 * Both systems coexist intentionally to support different deployment modes.
 */

import type { GameState, RatingsStorage } from '@/types/game';
import { migrateAllTrees } from './tree-migration';

const KEYS = {
  GAME_STATE: 'ecoforest_gamestate',
  RATINGS: 'ecoforest_ratings',
  VISITED_FORESTS: 'ecoforest_visited_forests',
  LEADERBOARDS: 'ecoforest_leaderboards',
  SAMPLE_FORESTS: 'ecoforest_sample_forests',
} as const;

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(KEYS.GAME_STATE);
    if (!data) return null;
    
    const state = JSON.parse(data);
    
    // Migrate old tree data to new format (converts old 5-species format to new 35-species format)
    if (state.trees && Array.isArray(state.trees)) {
      state.trees = migrateAllTrees(state.trees);
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadRatings(): RatingsStorage {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = localStorage.getItem(KEYS.RATINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load ratings:', error);
    return {};
  }
}

export function saveRatings(ratings: RatingsStorage): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEYS.RATINGS, JSON.stringify(ratings));
  } catch (error) {
    console.error('Failed to save ratings:', error);
  }
}

export function loadVisitedForests(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const data = localStorage.getItem(KEYS.VISITED_FORESTS);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (error) {
    console.error('Failed to load visited forests:', error);
    return new Set();
  }
}

export function saveVisitedForests(visited: Set<string>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEYS.VISITED_FORESTS, JSON.stringify(Array.from(visited)));
  } catch (error) {
    console.error('Failed to save visited forests:', error);
  }
}

export function loadSampleForests(): GameState[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(KEYS.SAMPLE_FORESTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load sample forests:', error);
    return [];
  }
}

export function saveSampleForests(forests: GameState[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEYS.SAMPLE_FORESTS, JSON.stringify(forests));
  } catch (error) {
    console.error('Failed to save sample forests:', error);
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(KEYS).forEach((key: string) => {
    localStorage.removeItem(key);
  });
}
