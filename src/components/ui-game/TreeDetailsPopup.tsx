'use client';

import type { TreeData } from '@/lib/self-contained-storage';

interface TreeDetailsPopupProps {
  tree: TreeData;
  onMint: () => void;
  onWater: () => void;
  onCutDown: () => void;
  onMove?: () => void;
  onClose: () => void;
}

import { SEED_TIER_INFO } from '@/lib/seed-system';

export function TreeDetailsPopup({ tree, onMint, onWater, onCutDown, onMove, onClose }: TreeDetailsPopupProps): JSX.Element {
  const stageEmoji: Record<string, string> = {
    seed: '🌱',
    sprout: '🌿',
    young: '🌳',
    mature: '🌲',
  };
  
  const growthPercentage: Record<string, number> = {
    seed: 25,
    sprout: 50,
    young: 75,
    mature: 100,
  };
  
  // Get tier-based colors if available, otherwise use species colors
  const getTierInfo = () => {
    if (tree.tier && SEED_TIER_INFO[tree.tier as keyof typeof SEED_TIER_INFO]) {
      return SEED_TIER_INFO[tree.tier as keyof typeof SEED_TIER_INFO];
    }
    return null;
  };
  
  const tierInfo = getTierInfo();
  
  const speciesColor: Record<string, string> = {
    Oak: 'from-green-600 to-green-800',
    Pine: 'from-emerald-600 to-emerald-800',
    Cherry: 'from-pink-500 to-pink-700',
    Baobab: 'from-amber-600 to-amber-800',
    Mangrove: 'from-teal-600 to-teal-800',
  };
  
  // Use tier color for gradient if available
  const getGradientColor = (): string => {
    if (tierInfo) {
      // Convert hex to rgb for gradient
      return speciesColor[tree.species] || 'from-green-600 to-green-800';
    }
    return speciesColor[tree.species] || 'from-green-600 to-green-800';
  };
  
  const timeSincePlanted = Date.now() - tree.plantedAt;
  const hoursOld = Math.floor(timeSincePlanted / (1000 * 60 * 60));
  const minutesOld = Math.floor((timeSincePlanted % (1000 * 60 * 60)) / (1000 * 60));
  
  // Get building log yield
  const getBuildingLogYield = (): number => {
    if (!tree.tier) return 5; // Default for non-tiered trees
    
    const yields: Record<string, number> = {
      'Common Grove': 5,
      'Wildwood': 10,
      'Sacred Canopy': 20,
      'Elderbark': 35,
      'Mythroot': 60,
      'Celestial Bough': 85,
      'Origin Tree': 100,
    };
    
    return yields[tree.tier] || 5;
  };
  
  // Allow watering from seed stage onwards (seed needs water to grow!)
  const canWater = true; // Watering is available at all growth stages
  const canCutDown = tree.growthStage === 'mature';
  
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className={`bg-gradient-to-br ${getGradientColor()} rounded-2xl shadow-2xl p-8 max-w-md border-4 border-white/50 text-white`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{tierInfo?.emoji || stageEmoji[tree.growthStage]}</div>
          <h2 className="text-3xl font-bold mb-1">{tree.species}</h2>
          {tierInfo && (
            <div 
              className="text-lg font-bold mb-1 px-3 py-1 rounded-full inline-block"
              style={{ 
                backgroundColor: (tierInfo?.glowColor || '#8bc34a') + '40',
                color: tierInfo?.color || '#ffffff',
                border: `2px solid ${tierInfo?.color || '#ffffff'}`
              }}
            >
              {tree.tier ? `${tree.tier} ✨` : 'Unknown Tier'}
            </div>
          )}
          <div className="text-xl opacity-90 capitalize mt-2">{tree.growthStage} Stage</div>
        </div>
        
        {/* Growth Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Growth Progress</span>
            <span>{growthPercentage[tree.growthStage]}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4">
            <div
              className="bg-white rounded-full h-4 transition-all"
              style={{ width: `${growthPercentage[tree.growthStage]}%` }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-3 mb-6 bg-black/20 rounded-lg p-4">
          <div className="flex justify-between">
            <span>Age:</span>
            <span className="font-bold">{hoursOld}h {minutesOld}m</span>
          </div>
          <div className="flex justify-between">
            <span>Watering Bonus:</span>
            <span className="font-bold">+{tree.wateringBonusPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span>Last Watered:</span>
            <span className="font-bold">
              {tree.lastWatered ? `${Math.floor((Date.now() - tree.lastWatered) / (1000 * 60 * 60))}h ago` : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>NFT Status:</span>
            <span className="font-bold">{tree.isMinted ? '✨ Minted' : '⚪ Not Minted'}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Water Button */}
          {canWater && (
            <button
              onClick={() => {
                onWater();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              💧 Water Tree (+2 eco-points)
            </button>
          )}
          
          {/* Mint Button */}
          {!tree.isMinted && tree.growthStage === 'mature' && (
            <button
              onClick={onMint}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              ✨ Mint to NFT
            </button>
          )}
          
          {tree.isMinted && (
            <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-lg p-3 text-center">
              <div className="font-bold">✨ This tree is an NFT!</div>
              <div className="text-sm opacity-90">Minted {Math.floor((Date.now() - (tree.mintedAt || 0)) / (1000 * 60 * 60))}h ago</div>
            </div>
          )}
          
          {!tree.isMinted && tree.growthStage !== 'mature' && (
            <div className="bg-white/20 rounded-lg p-3 text-center text-sm">
              🌱 Grow this tree to mature stage to mint as NFT
            </div>
          )}
          
          {/* Cut Down Button */}
          {canCutDown && (
            <button
              onClick={() => {
                onCutDown();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              🪓 Cut Down (+{getBuildingLogYield()} logs)
            </button>
          )}
          
          {/* Move Tree Button */}
          {onMove && (
            <button
              onClick={() => {
                onMove();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              📍 Move Tree
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-lg font-bold transition-all"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
