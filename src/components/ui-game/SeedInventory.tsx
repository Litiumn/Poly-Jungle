'use client';

import type { SeedData, SeedTier } from '@/lib/seed-system';
import { SEED_TIER_INFO } from '@/lib/seed-system';

interface SeedInventoryProps {
  seeds: SeedData[];
  onPlantSeed: (seedId: string) => void;
  onClose: () => void;
  plantMode?: boolean;
}

export function SeedInventory({ seeds, onPlantSeed, onClose, plantMode = false }: SeedInventoryProps): JSX.Element {
  // Separate planted and unplanted seeds
  const unplantedSeeds = seeds.filter(s => !s.planted);
  const plantedSeeds = seeds.filter(s => s.planted);
  
  // Group unplanted seeds by tier for better organization
  const seedsByTier: Partial<Record<SeedTier, SeedData[]>> = {};
  unplantedSeeds.forEach(seed => {
    if (!seedsByTier[seed.tier]) {
      seedsByTier[seed.tier] = [];
    }
    seedsByTier[seed.tier]!.push(seed);
  });
  
  // Group planted seeds by tier
  const plantedSeedsByTier: Partial<Record<SeedTier, SeedData[]>> = {};
  plantedSeeds.forEach(seed => {
    if (!plantedSeedsByTier[seed.tier]) {
      plantedSeedsByTier[seed.tier] = [];
    }
    plantedSeedsByTier[seed.tier]!.push(seed);
  });
  
  // Sort tiers by rarity (rarest first)
  const sortedTiers = (Object.keys(seedsByTier) as SeedTier[]).sort((a, b) => {
    return SEED_TIER_INFO[b].rarity - SEED_TIER_INFO[a].rarity;
  });
  
  // Get sorted tiers for planted seeds
  const sortedPlantedTiers = (Object.keys(plantedSeedsByTier) as SeedTier[]).sort((a, b) => {
    return SEED_TIER_INFO[b].rarity - SEED_TIER_INFO[a].rarity;
  });
  
  if (unplantedSeeds.length === 0 && plantedSeeds.length === 0) {
    return (
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-2xl p-8 max-w-md border-4 border-amber-900">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-3xl font-bold text-amber-900 mb-2">No Seeds Available</h2>
            <p className="text-amber-800 mb-6">
              Visit the Seed Market to buy seed packs!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-br from-green-600 to-green-800 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-4 border-green-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-green-900 mb-2">🌱 Seed Inventory</h2>
          <p className="text-green-800 text-lg">
            {plantMode 
              ? 'Select a seed, then click anywhere on the ground to plant it'
              : 'Select a seed to plant in your forest'
            }
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <div className="inline-block bg-green-800 text-white rounded-full px-5 py-2 font-bold">
              {unplantedSeeds.length} Seeds Available
            </div>
            {plantedSeeds.length > 0 && (
              <div className="inline-block bg-amber-700 text-white rounded-full px-5 py-2 font-bold">
                {plantedSeeds.length} Trees Planted
              </div>
            )}
          </div>
          {plantMode && (
            <div className="mt-3 bg-blue-600 text-white rounded-lg px-4 py-2 inline-block font-bold animate-pulse">
              🎯 Plant Mode Active - Click on the ground after selecting a seed
            </div>
          )}
        </div>
        
        {/* Available Seeds to Plant */}
        {unplantedSeeds.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-green-900 mb-4">📦 Available Seeds</h3>
            <div className="space-y-6 mb-6">
              {sortedTiers.map(tier => {
                const tierSeeds = seedsByTier[tier]!;
                const tierInfo = SEED_TIER_INFO[tier];
                
                return (
                  <div key={tier} className="bg-white/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{tierInfo.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: tierInfo.color }}>
                          {tier}
                        </h3>
                        <p className="text-sm text-gray-700">{tierInfo.description}</p>
                      </div>
                      <div className="ml-auto bg-gray-800 text-white rounded-full px-3 py-1 text-sm font-bold">
                        {tierSeeds.length} seeds
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tierSeeds.map(seed => (
                        <button
                          key={seed.id}
                          onClick={() => onPlantSeed(seed.id)}
                          className="bg-gradient-to-br from-white to-gray-100 rounded-xl p-4 border-2 hover:scale-105 transition-transform shadow-md hover:shadow-xl"
                          style={{ borderColor: tierInfo.glowColor }}
                        >
                          <div className="text-4xl mb-2">{tierInfo.emoji}</div>
                          <div className="text-sm font-bold text-gray-800 mb-1">
                            {seed.species}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            Yield: +{tierInfo.ecoPointYield} 🍃
                          </div>
                          {plantMode && (
                            <div className="text-xs font-bold text-blue-600">
                              Click to Select
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Already Planted Trees */}
        {plantedSeeds.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">🌳 Planted Trees ({plantedSeeds.length})</h3>
            <div className="space-y-6 mb-6">
              {sortedPlantedTiers.map(tier => {
                const tierSeeds = plantedSeedsByTier[tier]!;
                const tierInfo = SEED_TIER_INFO[tier];
                
                return (
                  <div key={tier} className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{tierInfo.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: tierInfo.color }}>
                          {tier}
                        </h3>
                        <p className="text-sm text-gray-700">{tierInfo.description}</p>
                      </div>
                      <div className="ml-auto bg-amber-700 text-white rounded-full px-3 py-1 text-sm font-bold">
                        {tierSeeds.length} planted
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tierSeeds.map(seed => (
                        <div
                          key={seed.id}
                          className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-4 border-2 border-amber-400 opacity-75"
                        >
                          <div className="text-4xl mb-2">{tierInfo.emoji}</div>
                          <div className="text-sm font-bold text-gray-800 mb-1">
                            {seed.species}
                          </div>
                          <div className="text-xs text-green-700 font-bold mb-1">
                            ✓ Planted
                          </div>
                          <div className="text-xs text-gray-600">
                            Growing in forest
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Stats Summary */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-4 mb-6 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{seeds.length}</div>
              <div className="text-sm opacity-80">Total Seeds</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{unplantedSeeds.length}</div>
              <div className="text-sm opacity-80">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{plantedSeeds.length}</div>
              <div className="text-sm opacity-80">Planted</div>
            </div>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
        >
          ✕ Close Inventory
        </button>
      </div>
    </div>
  );
}
