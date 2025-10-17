'use client';

/**
 * Workshop - Buy Furniture Packs with Building Logs
 * 
 * Features:
 * - View Building Logs balance
 * - Purchase Furniture Packs (Basic, Premium, Limited)
 * - See pack contents and drop rates
 * - View owned furniture
 */

import { useState } from 'react';
import {
  FURNITURE_PACK_DEFINITIONS,
  FURNITURE_RARITY_INFO,
  isPackAvailable,
  getLimitedPackTimeRemaining,
  type FurniturePackType,
  type FurnitureData,
  type FurnitureRarity,
} from '@/lib/furniture-system';

interface WorkshopProps {
  buildingLogs: number;
  ownedFurniture: FurnitureData[];
  onBuyPack: (packType: FurniturePackType) => void;
  onViewFurniture: () => void;
  onClose: () => void;
}

export function Workshop({
  buildingLogs,
  ownedFurniture,
  onBuyPack,
  onViewFurniture,
  onClose,
}: WorkshopProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'packs' | 'furniture'>('packs');
  const [selectedPack, setSelectedPack] = useState<FurniturePackType | null>(null);

  const packTypes: FurniturePackType[] = ['Basic', 'Premium', 'Limited'];
  const availablePacks = packTypes.filter(isPackAvailable);

  const unplacedFurniture = ownedFurniture.filter(f => !f.placed);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🏗️ Workshop</h2>
            <p className="text-sm opacity-90 mt-1">Craft furniture from building logs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-sm opacity-90">Building Logs:</span>
              <span className="font-bold ml-2 text-xl">{buildingLogs} 🪵</span>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-orange-200 bg-white">
          <button
            onClick={() => setActiveTab('packs')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'packs'
                ? 'bg-orange-100 text-orange-800 border-b-2 border-orange-600'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            📦 Furniture Packs
          </button>
          <button
            onClick={() => setActiveTab('furniture')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'furniture'
                ? 'bg-orange-100 text-orange-800 border-b-2 border-orange-600'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            🪑 My Furniture ({unplacedFurniture.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Furniture Packs Tab */}
          {activeTab === 'packs' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1 text-sm text-blue-800">
                    <p className="font-bold mb-1">About Furniture Packs</p>
                    <p>
                      Purchase Furniture Packs using Building Logs obtained from cutting mature trees.
                      Each pack contains multiple random furniture items that can be placed in your forest or sold on the Marketplace!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePacks.map((packType) => {
                  const pack = FURNITURE_PACK_DEFINITIONS[packType];
                  const canAfford = buildingLogs >= pack.cost;
                  const isLimited = pack.isLimited && pack.limitedUntil;

                  return (
                    <div
                      key={packType}
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all ${
                        isLimited
                          ? 'border-yellow-400 bg-gradient-to-br from-white to-yellow-50 relative overflow-hidden'
                          : 'border-orange-200 hover:border-orange-400'
                      }`}
                    >
                      {/* Limited time glow effect */}
                      {isLimited && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 animate-pulse pointer-events-none" />
                      )}

                      <div className="relative z-10">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">{pack.emoji}</div>
                          <h3 className="text-xl font-bold text-gray-800">{pack.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                          
                          {isLimited && (
                            <div className="mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block animate-pulse">
                              ⏰ {getLimitedPackTimeRemaining(packType)} left
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-bold text-amber-700">{pack.cost} 🪵</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-bold">{pack.itemCount} furniture</span>
                          </div>
                        </div>

                        {/* Drop Rates Preview */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-xs font-bold text-gray-700 mb-2">Drop Rates:</div>
                          <div className="space-y-1">
                            {(Object.entries(pack.dropRates) as [FurnitureRarity, number][])
                              .filter(([_, rate]) => rate > 0)
                              .sort((a, b) => b[1] - a[1])
                              .map(([rarity, rate]) => {
                                const rarityInfo = FURNITURE_RARITY_INFO[rarity];
                                return (
                                  <div key={rarity} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                      <span>{rarityInfo.emoji}</span>
                                      <span className="font-bold" style={{ color: rarityInfo.color }}>
                                        {rarity}
                                      </span>
                                    </div>
                                    <span className="text-gray-600">{(rate * 100).toFixed(1)}%</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        <button
                          onClick={() => onBuyPack(packType)}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded-lg font-bold transition-colors ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '🛒 Buy Pack' : '🪵 Not Enough Logs'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Limited Pack Expired Message */}
              {!isPackAvailable('Limited') && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-800 font-bold">⏰ Limited Edition Pack has expired!</p>
                  <p className="text-sm text-red-600 mt-1">Check back soon for new limited-time offers</p>
                </div>
              )}
            </div>
          )}

          {/* Furniture Inventory Tab */}
          {activeTab === 'furniture' && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  💡 <strong>Tip:</strong> View all your furniture here! Unplaced furniture can be sold on the Marketplace. 
                  Placed furniture appears in your forest. Limited-time furniture has a special glow!
                </p>
              </div>

              {unplacedFurniture.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-xl font-bold text-gray-700">No Furniture Yet</p>
                  <p className="text-gray-600 mt-2">Buy Furniture Packs to get started!</p>
                  <button
                    onClick={() => setActiveTab('packs')}
                    className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:from-amber-700 hover:to-orange-700 transition-colors"
                  >
                    🛒 Browse Packs
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unplacedFurniture.map((furniture) => {
                    const rarityInfo = FURNITURE_RARITY_INFO[furniture.rarity];
                    
                    return (
                      <div
                        key={furniture.id}
                        className={`bg-white rounded-xl p-4 shadow-lg border-2 ${
                          furniture.fromLimitedPack
                            ? 'border-yellow-400 bg-gradient-to-br from-white to-yellow-50 relative'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Limited glow indicator */}
                        {furniture.fromLimitedPack && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            ⭐ LIMITED
                          </div>
                        )}

                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{rarityInfo.emoji}</div>
                          <h4 className="font-bold text-gray-800">{furniture.name}</h4>
                          <div
                            className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block"
                            style={{ backgroundColor: rarityInfo.color, color: '#fff' }}
                          >
                            {furniture.rarity}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-bold">{furniture.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Value:</span>
                            <span className="font-bold text-green-600">{rarityInfo.marketValue} 🍃</span>
                          </div>
                        </div>

                        <button
                          onClick={onViewFurniture}
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-colors"
                        >
                          🏡 Place in Forest
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
