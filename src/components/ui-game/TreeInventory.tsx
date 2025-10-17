'use client';

/**
 * Tree Inventory - Complete tree management with filtering and sorting
 */

import { useState } from 'react';
import type { TreeData } from '@/lib/self-contained-storage';
import { SEED_TIER_INFO, type SeedTier } from '@/lib/seed-system';

interface TreeInventoryProps {
  trees: TreeData[];
  onClose: () => void;
  onViewTree: (treeId: string) => void;
  onSellTree?: (treeId: string) => void;
  onChopTree?: (treeId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'rarity' | 'growth' | 'yield';
type FilterOption = 'all' | 'mature' | 'minted' | 'unminted';

export function TreeInventory({
  trees,
  onClose,
  onViewTree,
  onSellTree,
  onChopTree,
}: TreeInventoryProps): JSX.Element {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter trees
  let filteredTrees = trees.filter((tree) => {
    // Apply filters
    if (filterBy === 'mature' && tree.growthStage !== 'mature') return false;
    if (filterBy === 'minted' && !tree.isMinted) return false;
    if (filterBy === 'unminted' && tree.isMinted) return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tree.species.toLowerCase().includes(query) ||
        tree.tier?.toLowerCase().includes(query) ||
        tree.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort trees
  filteredTrees.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.plantedAt - a.plantedAt;
      case 'oldest':
        return a.plantedAt - b.plantedAt;
      case 'rarity': {
        const tierOrder = [
          'Common Grove',
          'Wildwood',
          'Sacred Canopy',
          'Elderbark',
          'Mythroot',
          'Celestial Bough',
          'Origin Tree',
        ];
        const aIndex = tierOrder.indexOf(a.tier || '');
        const bIndex = tierOrder.indexOf(b.tier || '');
        return bIndex - aIndex;
      }
      case 'growth': {
        const growthOrder = ['seed', 'sprout', 'young', 'mature'];
        const aIndex = growthOrder.indexOf(a.growthStage);
        const bIndex = growthOrder.indexOf(b.growthStage);
        return bIndex - aIndex;
      }
      case 'yield':
        return (b.wateringBonusPercent || 0) - (a.wateringBonusPercent || 0);
      default:
        return 0;
    }
  });

  // Calculate stats
  const matureCount = trees.filter((t) => t.growthStage === 'mature').length;
  const mintedCount = trees.filter((t) => t.isMinted).length;
  const totalYield = trees.reduce((sum, t) => sum + (t.wateringBonusPercent || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🌳 Tree Inventory</h2>
            <p className="text-sm opacity-90 mt-1">
              Manage your forest ({filteredTrees.length} / {trees.length} trees)
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="bg-white border-b border-green-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg">
              <div className="text-sm text-green-700">Total Trees</div>
              <div className="text-2xl font-bold text-green-800">{trees.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg">
              <div className="text-sm text-blue-700">Mature Trees</div>
              <div className="text-2xl font-bold text-blue-800">{matureCount}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 p-4 rounded-lg">
              <div className="text-sm text-yellow-700">Minted NFTs</div>
              <div className="text-2xl font-bold text-yellow-800">{mintedCount}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg">
              <div className="text-sm text-purple-700">Total Yield</div>
              <div className="text-2xl font-bold text-purple-800">+{totalYield}%</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-b border-green-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by species, tier, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rarity">By Rarity</option>
                <option value="growth">By Growth</option>
                <option value="yield">By Yield</option>
              </select>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none bg-white"
              >
                <option value="all">All Trees</option>
                <option value="mature">Mature Only</option>
                <option value="minted">Minted Only</option>
                <option value="unminted">Unminted Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tree Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTrees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl font-bold text-gray-700">No Trees Found</p>
              <p className="text-gray-600 mt-2">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start planting seeds to grow your forest!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTrees.map((tree) => {
                const tierInfo = tree.tier ? SEED_TIER_INFO[tree.tier as SeedTier] : null;
                const daysOld = Math.floor((Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={tree.id}
                    className={`bg-white rounded-xl p-4 shadow-lg border-2 hover:shadow-xl transition-all ${
                      tree.isMinted ? 'border-yellow-300' : 'border-green-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-lg font-bold flex items-center gap-2">
                          {tierInfo?.emoji || '🌳'} {tree.species}
                        </div>
                        {tree.tier && (
                          <div
                            className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block"
                            style={{
                              backgroundColor: tierInfo?.glowColor,
                              color: '#fff',
                            }}
                          >
                            {tree.tier}
                          </div>
                        )}
                      </div>
                      {tree.isMinted && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                          🏅 NFT
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Growth:</span>
                        <span className="font-bold capitalize">{tree.growthStage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Age:</span>
                        <span className="font-bold">{daysOld}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yield Bonus:</span>
                        <span className="font-bold text-green-600">
                          +{tree.wateringBonusPercent}%
                        </span>
                      </div>
                      {tierInfo && (
                        <div className="flex justify-between">
                          <span>Value:</span>
                          <span className="font-bold text-purple-600">
                            {tierInfo.ecoPointYield}× yield
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => onViewTree(tree.id)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                      >
                        👁️ View Details
                      </button>
                      <div className="flex gap-2">
                        {onSellTree && tree.isMinted && tree.growthStage === 'mature' && (
                          <button
                            onClick={() => onSellTree(tree.id)}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
                          >
                            💰 Sell
                          </button>
                        )}
                        {onChopTree && tree.growthStage === 'mature' && (
                          <button
                            onClick={() => onChopTree(tree.id)}
                            className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
                          >
                            🪓 Chop
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ID Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                      ID: {tree.id.slice(0, 12)}...
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
