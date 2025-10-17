'use client';

/**
 * Furniture Inventory - View and manage furniture items
 * 
 * Features:
 * - View all owned furniture
 * - Filter by category and rarity
 * - Place furniture in forest
 * - See detailed item information
 */

import { useState } from 'react';
import {
  FURNITURE_RARITY_INFO,
  type FurnitureData,
  type FurnitureRarity,
  type FurnitureCategory,
} from '@/lib/furniture-system';

interface FurnitureInventoryProps {
  furniture: FurnitureData[];
  onPlace: (furnitureId: string) => void;
  onSell: (furnitureId: string) => void;
  onClose: () => void;
}

export function FurnitureInventory({
  furniture,
  onPlace,
  onSell,
  onClose,
}: FurnitureInventoryProps): JSX.Element {
  const [filterCategory, setFilterCategory] = useState<FurnitureCategory | 'All'>('All');
  const [filterRarity, setFilterRarity] = useState<FurnitureRarity | 'All'>('All');
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureData | null>(null);

  const categories: Array<FurnitureCategory | 'All'> = ['All', 'Seating', 'Lighting', 'Decoration', 'Structure', 'Nature'];
  const rarities: Array<FurnitureRarity | 'All'> = ['All', 'Rough', 'Sturdy', 'Refined', 'Noble', 'Heirloom', 'Exquisite', 'Masterwork'];

  const filteredFurniture = furniture.filter((item) => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (filterRarity !== 'All' && item.rarity !== filterRarity) return false;
    return true;
  });

  const unplacedFurniture = filteredFurniture.filter(f => !f.placed);
  const placedFurniture = filteredFurniture.filter(f => f.placed);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🪑 Furniture Collection</h2>
            <p className="text-sm opacity-90 mt-1">
              {unplacedFurniture.length} available • {placedFurniture.length} placed
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-purple-200 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as FurnitureCategory | 'All')}
                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-gray-700 mb-2">Rarity</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as FurnitureRarity | 'All')}
                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 outline-none"
              >
                {rarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFurniture.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-bold text-gray-700">No Furniture Found</p>
              <p className="text-gray-600 mt-2">
                {furniture.length === 0
                  ? 'Buy Furniture Packs from the Workshop to get started!'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unplacedFurniture.map((item) => {
                const rarityInfo = FURNITURE_RARITY_INFO[item.rarity];
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 shadow-lg border-2 transition-all hover:shadow-2xl ${
                      item.fromLimitedPack
                        ? 'border-yellow-400 bg-gradient-to-br from-white to-yellow-50 relative'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    {/* Limited glow indicator */}
                    {item.fromLimitedPack && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse" />
                    )}

                    <div className="text-center mb-3">
                      <div className="text-5xl mb-2">{rarityInfo.emoji}</div>
                      <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                      <div
                        className="text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block"
                        style={{ backgroundColor: rarityInfo.color, color: '#fff' }}
                      >
                        {item.rarity}
                      </div>
                      
                      {item.fromLimitedPack && (
                        <div className="mt-2">
                          <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            ⭐ LIMITED EDITION
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-bold">{item.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier:</span>
                        <span className="font-bold">{rarityInfo.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Value:</span>
                        <span className="font-bold text-green-600">{rarityInfo.marketValue} 🍃</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 italic">
                        {rarityInfo.description}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          console.log('🪑 Furniture selected for placement:', item.name, item.id);
                          onPlace(item.id);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        🏡 Place in Forest
                      </button>
                      <button
                        onClick={() => {
                          console.log('💰 Furniture selected for sale:', item.name, item.id);
                          setSelectedFurniture(item);
                        }}
                        className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                      >
                        💰 Sell on Marketplace
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Placed Furniture */}
              {placedFurniture.length > 0 && (
                <div className="col-span-full mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🏡 Placed Furniture ({placedFurniture.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {placedFurniture.map((item) => {
                      const rarityInfo = FURNITURE_RARITY_INFO[item.rarity];
                      
                      return (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300 opacity-75"
                        >
                          <div className="text-center mb-2">
                            <div className="text-4xl mb-1">{rarityInfo.emoji}</div>
                            <h4 className="font-bold text-gray-700">{item.name}</h4>
                            <div
                              className="text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block"
                              style={{ backgroundColor: rarityInfo.color, color: '#fff' }}
                            >
                              {item.rarity}
                            </div>
                          </div>
                          <div className="text-xs text-center text-gray-600">
                            ✅ Placed in your forest
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sell Confirmation Modal */}
        {selectedFurniture && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">💰 Sell Furniture?</h3>
              <div className="mb-4">
                <p className="text-gray-700">
                  Are you sure you want to sell <strong>{selectedFurniture.name}</strong> on the Marketplace?
                </p>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Suggested Price:</div>
                  <div className="text-2xl font-bold text-green-600">
                    {FURNITURE_RARITY_INFO[selectedFurniture.rarity].marketValue} 🍃
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFurniture(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('💰 Confirming furniture sale:', selectedFurniture.name, selectedFurniture.id);
                    onSell(selectedFurniture.id);
                    setSelectedFurniture(null);
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  ✅ Sell
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
