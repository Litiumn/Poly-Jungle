'use client';

import type { TreeSpecies } from '@/lib/self-contained-storage';
import { getSeedCost, canAffordSeed } from '@/lib/self-contained-storage';

interface PlantMenuProps {
  ecoPoints: number;
  onPlant: (species: TreeSpecies) => void;
  onClose: () => void;
}

const SPECIES_INFO: Record<TreeSpecies, { emoji: string; description: string; color: string }> = {
  Oak: { emoji: '🌳', description: 'Strong & reliable', color: 'from-green-600 to-green-800' },
  Pine: { emoji: '🌲', description: 'Evergreen beauty', color: 'from-emerald-600 to-emerald-800' },
  Cherry: { emoji: '🌸', description: 'Spring blossom', color: 'from-pink-500 to-pink-700' },
  Baobab: { emoji: '🌴', description: 'Ancient wisdom', color: 'from-amber-600 to-amber-800' },
  Mangrove: { emoji: '🌿', description: 'Coastal guardian', color: 'from-teal-600 to-teal-800' },
};

export function PlantMenu({ ecoPoints, onPlant, onClose }: PlantMenuProps): JSX.Element {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-2xl p-8 max-w-2xl border-4 border-amber-900">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">🌱 Plant a Tree</h2>
          <p className="text-amber-800">Choose a species to plant in your forest</p>
        </div>
        
        {/* Seed Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {(Object.keys(SPECIES_INFO) as TreeSpecies[]).map((species) => {
            const info = SPECIES_INFO[species];
            const cost = getSeedCost(species);
            const canAfford = canAffordSeed(ecoPoints, species);
            
            return (
              <button
                key={species}
                onClick={() => onPlant(species)}
                disabled={!canAfford}
                className={`
                  bg-gradient-to-br ${info.color} text-white rounded-xl p-4
                  shadow-lg hover:scale-105 transition-all
                  ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-2xl'}
                `}
              >
                <div className="text-5xl mb-2">{info.emoji}</div>
                <div className="font-bold text-lg mb-1">{species}</div>
                <div className="text-sm opacity-90 mb-2">{info.description}</div>
                <div className="bg-black/20 rounded-full px-3 py-1 text-sm font-bold">
                  🍃 {cost}
                </div>
                {!canAfford && (
                  <div className="text-xs mt-2 bg-red-500/80 rounded px-2 py-1">
                    Not enough eco-points
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Current Eco-Points */}
        <div className="text-center mb-6 bg-green-800 text-white rounded-lg py-3 px-4">
          <span className="text-xl font-bold">Your Eco-Points: 🍃 {ecoPoints}</span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-800 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
