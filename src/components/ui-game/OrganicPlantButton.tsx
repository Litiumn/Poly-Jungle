'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { GameState, TreeSpecies } from '@/types/game';

interface OrganicPlantButtonProps {
  gameState: GameState;
  onPlantMode: (species: TreeSpecies) => void;
}

export function OrganicPlantButton({ gameState, onPlantMode }: OrganicPlantButtonProps): JSX.Element {
  const [showSeedMenu, setShowSeedMenu] = useState<boolean>(false);

  const seeds = [
    { id: 'oak_seed', name: 'Oak', species: 'Oak' as TreeSpecies, icon: '🌳', color: 'bg-green-700' },
    { id: 'pine_seed', name: 'Pine', species: 'Pine' as TreeSpecies, icon: '🌲', color: 'bg-green-800' },
    { id: 'cherry_seed', name: 'Cherry', species: 'Cherry' as TreeSpecies, icon: '🌸', color: 'bg-pink-600' },
    { id: 'baobab_seed', name: 'Baobab', species: 'Baobab' as TreeSpecies, icon: '🌴', color: 'bg-amber-700' },
    { id: 'mangrove_seed', name: 'Mangrove', species: 'Mangrove' as TreeSpecies, icon: '🌿', color: 'bg-teal-700' },
  ];

  const handlePlant = (species: TreeSpecies): void => {
    onPlantMode(species);
    setShowSeedMenu(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
      {!showSeedMenu ? (
        <Button
          onClick={() => setShowSeedMenu(true)}
          className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white px-8 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 animate-pulse"
          style={{
            boxShadow: '0 10px 40px rgba(34, 139, 34, 0.4), inset 0 -3px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span className="flex items-center gap-3 text-xl font-bold">
            <span className="text-3xl animate-bounce">🌱</span>
            <span>Plant a Tree</span>
          </span>
        </Button>
      ) : (
        <Card className="bg-gradient-to-br from-amber-50 to-green-50 p-6 shadow-2xl border-4 border-green-700 rounded-3xl"
          style={{
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
            background: 'linear-gradient(135deg, #f0e68c 0%, #daa520 50%, #8b4513 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">
              🌳 Choose Your Seed
            </h3>
            <Button
              onClick={() => setShowSeedMenu(false)}
              variant="ghost"
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {seeds.map((seed) => {
              const count = gameState.inventory[seed.id] || 0;
              const canPlant = count > 0;

              return (
                <button
                  key={seed.id}
                  onClick={() => canPlant && handlePlant(seed.species)}
                  disabled={!canPlant}
                  className={`
                    relative p-4 rounded-2xl transition-all duration-300 transform
                    ${canPlant
                      ? `${seed.color} hover:scale-110 hover:rotate-3 shadow-lg cursor-pointer`
                      : 'bg-gray-400 opacity-50 cursor-not-allowed'
                    }
                  `}
                  style={{
                    boxShadow: canPlant ? '0 5px 20px rgba(0, 0, 0, 0.3)' : 'none',
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2 filter drop-shadow-lg">{seed.icon}</div>
                    <p className="text-xs font-bold text-white drop-shadow-md">{seed.name}</p>
                    <div className={`
                      mt-1 text-xs font-semibold px-2 py-1 rounded-full
                      ${canPlant ? 'bg-white bg-opacity-30' : 'bg-black bg-opacity-20'}
                    `}>
                      <span className="text-white drop-shadow">×{count}</span>
                    </div>
                  </div>

                  {canPlant && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-white drop-shadow-md font-semibold">
              🌿 {gameState.ecoPoints} Eco-Points Available
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
