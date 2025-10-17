'use client';

import type { DecorationType } from '@/lib/self-contained-storage';
import { getDecorationCost, canAffordDecoration, DECORATION_INFO } from '@/lib/self-contained-storage';

interface DecorationShopProps {
  ecoPoints: number;
  onBuy: (type: DecorationType) => void;
  onClose: () => void;
}

export function DecorationShop({ ecoPoints, onBuy, onClose }: DecorationShopProps): JSX.Element {
  const decorationTypes: DecorationType[] = ['SmallFlower', 'Bush', 'Rock', 'Bench', 'Lantern', 'Fence'];
  
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-2xl p-8 max-w-3xl border-4 border-purple-900">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-900 mb-2">🏪 Decoration Shop</h2>
          <p className="text-purple-800">Beautify your forest with decorative items</p>
        </div>
        
        {/* Decoration Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
          {decorationTypes.map((type) => {
            const info = DECORATION_INFO[type];
            const cost = getDecorationCost(type);
            const canAfford = canAffordDecoration(ecoPoints, type);
            
            return (
              <button
                key={type}
                onClick={() => onBuy(type)}
                disabled={!canAfford}
                className={`
                  bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-4
                  shadow-lg hover:scale-105 transition-all
                  ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-2xl'}
                `}
              >
                <div className="text-5xl mb-2">{info.emoji}</div>
                <div className="font-bold text-lg mb-1">{info.name}</div>
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
