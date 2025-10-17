'use client';

import { useState, useEffect } from 'react';
import { StableForest } from '@/components/forest/StableForest';
import { OrganicLanding } from '@/components/ui-game/OrganicLanding';
import { initializeGameState, loadGameState } from '@/lib/self-contained-storage';
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * EcoForest Base — Self-Contained Prototype
 * 
 * This is a fully self-contained version that runs entirely within Ohara.
 * - No external network calls or GLB files
 * - Uses Three.js primitives only
 * - All assets embedded
 * - Direct-click planting on terrain
 * - Timestamp-based growth (persists across reloads)
 * - Debug controls for testing
 * - Limited to ~30 interactive objects for stability
 * 
 * localStorage Keys:
 * - ecoforest_self_contained: Main game state
 * - ecoforest_sample_forests: Friend forests for visits
 */
export default function EcoForestBasePage(): JSX.Element {
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (document.readyState !== 'complete') {
            await new Promise(resolve => {
              if (document.readyState === 'complete') {
                resolve(void 0);
              } else {
                window.addEventListener('load', () => resolve(void 0), { once: true });
              }

            });
          }

          await sdk.actions.ready();
          console.log("Farcaster SDK initialized successfully - app fully loaded");
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error);
          setTimeout(async () => {
            try {
              await sdk.actions.ready();
              console.log('Farcaster SDK initialized on retry');
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError);
            }

          }, 1000);
        }

      };
      initializeFarcaster();
    }, []);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Initialize game state on mount
    const existingState = loadGameState();
    if (!existingState) {
      initializeGameState();
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-green-100 to-green-300 flex items-center justify-center">
        <div className="text-2xl font-bold text-green-800">🌱 Loading EcoForest...</div>
      </div>
    );
  }

  if (!hasEntered) {
    return <OrganicLanding onEnter={() => setHasEntered(true)} />;
  }

  return <StableForest />;
}
