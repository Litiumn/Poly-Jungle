'use client';

import { useState } from 'react';
import type { PackType, SeedData, SeedTier } from '@/lib/seed-system';
import {
  PACK_DEFINITIONS,
  SEED_TIER_INFO,
  openSeedPack,
} from '@/lib/seed-system';

interface SeedMarketProps {
  ecoPoints: number;
  onBuyPack: (packType: PackType, seeds: SeedData[]) => void;
  onClose: () => void;
}

export function SeedMarket({ ecoPoints, onBuyPack, onClose }: SeedMarketProps): JSX.Element {
  const [showingPackReveal, setShowingPackReveal] = useState<boolean>(false);
  const [revealedSeeds, setRevealedSeeds] = useState<SeedData[]>([]);
  
  const handleBuyPack = (packType: PackType): void => {
    const pack = PACK_DEFINITIONS[packType];
    
    if (ecoPoints < pack.cost) {
      return;
    }
    
    // Open the pack and show reveal animation
    const seeds = openSeedPack(packType);
    setRevealedSeeds(seeds);
    setShowingPackReveal(true);
    
    // Call parent handler after a delay to show animation
    setTimeout(() => {
      onBuyPack(packType, seeds);
    }, 500);
  };
  
  const closeReveal = (): void => {
    setShowingPackReveal(false);
    setRevealedSeeds([]);
    onClose();
  };
  
  if (showingPackReveal) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-2xl p-8 max-w-3xl w-full border-4 border-yellow-400">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-yellow-300 mb-2">🎉 Pack Opened!</h2>
            <p className="text-purple-200">You received {revealedSeeds.length} new seeds</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {revealedSeeds.map((seed) => {
              const tierInfo = SEED_TIER_INFO[seed.tier];
              return (
                <div
                  key={seed.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border-2 animate-pulse"
                  style={{ borderColor: tierInfo.glowColor }}
                >
                  <div className="text-5xl mb-2 text-center">{tierInfo.emoji}</div>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1" style={{ color: tierInfo.glowColor }}>
                      {seed.tier}
                    </div>
                    <div className="text-sm text-gray-300">{seed.species}</div>
                    <div className="text-xs text-gray-400 mt-2">{tierInfo.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={closeReveal}
            className="w-full bg-gradient-to-br from-green-600 to-green-800 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            ✓ Add to Inventory
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-4 border-indigo-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-900 mb-2">🌱 Seed Market</h2>
          <p className="text-indigo-800 text-lg">Buy seed packs to grow your forest</p>
          <div className="mt-4 inline-block bg-green-800 text-white rounded-full px-6 py-3 text-xl font-bold">
            🍃 {ecoPoints} Eco-Points
          </div>
        </div>
        
        {/* Pack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.keys(PACK_DEFINITIONS) as PackType[]).map((packType) => {
            const pack = PACK_DEFINITIONS[packType];
            const canAfford = ecoPoints >= pack.cost;
            const isLimited = pack.isLimited;
            
            return (
              <div
                key={packType}
                className={`
                  bg-gradient-to-br from-white to-gray-100 rounded-2xl p-6 border-4
                  ${isLimited ? 'border-yellow-500' : 'border-indigo-500'}
                  shadow-xl
                `}
              >
                {isLimited && (
                  <div className="text-center mb-3">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      ⚡ LIMITED TIME
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{pack.emoji}</div>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-2">{pack.name}</h3>
                  <p className="text-sm text-gray-700 mb-3">{pack.description}</p>
                  <div className="bg-indigo-600 text-white rounded-full px-4 py-2 inline-block font-bold">
                    {pack.seedCount} Seeds
                  </div>
                </div>
                
                {/* Drop Rates - Now showing ALL 7 tiers */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                  <div className="font-bold text-gray-800 mb-2 text-center">Drop Rates (All Tiers):</div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-200">
                    {(Object.entries(pack.dropRates) as [SeedTier, number][])
                      .filter(([_, rate]) => rate > 0)
                      .sort((a, b) => b[1] - a[1])

                      .map(([tier, rate]) => {
                        const tierInfo = SEED_TIER_INFO[tier];
                        return (
                          <div 
                            key={tier} 
                            className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-100 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-lg">{tierInfo.emoji}</span>
                              <span 
                                className="text-gray-700 font-medium text-[10px] leading-tight"
                                style={{ color: tierInfo.glowColor }}
                              >
                                {tier}
                              </span>
                            </span>
                            <span 
                              className="font-bold text-xs"
                              style={{ color: tierInfo.glowColor }}
                            >
                              {(rate * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="text-center mt-2 text-[10px] text-gray-500">
                    ↕️ Scroll to see all tiers
                  </div>
                </div>
                
                <button
                  onClick={() => handleBuyPack(packType)}
                  disabled={!canAfford}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-transform
                    ${canAfford
                      ? 'bg-gradient-to-br from-green-600 to-green-800 text-white hover:scale-105 shadow-lg'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {canAfford ? `Buy for 🍃 ${pack.cost}` : 'Not Enough Points'}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Tier Reference */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-yellow-300 text-center mb-4">Seed Rarity Tiers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(SEED_TIER_INFO) as [SeedTier, typeof SEED_TIER_INFO[SeedTier]][]).map(([tier, info]) => (
              <div
                key={tier}
                className="bg-black/30 rounded-lg p-3 text-center border-2"
                style={{ borderColor: info.glowColor }}
              >
                <div className="text-3xl mb-1">{info.emoji}</div>
                <div className="text-xs font-bold mb-1" style={{ color: info.glowColor }}>
                  {tier}
                </div>
                <div className="text-xs text-gray-300">{info.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
        >
          ✕ Close Market
        </button>
      </div>
    </div>
  );
}
