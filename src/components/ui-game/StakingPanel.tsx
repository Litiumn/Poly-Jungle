'use client';

/**
 * Staking Panel - Stake trees to earn $FOREST and $LEAF tokens
 * 
 * Features:
 * - Multiple lock periods with different APY rates
 * - Rarity-based reward multipliers
 * - Real-time rewards calculation
 * - Claim rewards without unstaking
 * - Early unstake with penalties
 */

import { useState, useEffect } from 'react';
import type { Tree, StakedTree, GameState } from '@/types/game';
import {
  STAKING_TIERS,
  RARITY_MULTIPLIERS,
  type StakingLockPeriod,
  calculateStakingRewards,
  stakeTree,
  unstakeTree,
  claimStakingRewards,
  getStakingAPY,
  formatTokenAmount,
} from '@/lib/tokenomics';

interface StakingPanelProps {
  gameState: GameState;
  onClose: () => void;
  onStake: (treeId: string, lockPeriod: StakingLockPeriod) => void;
  onUnstake: (treeId: string, forceUnstake: boolean) => void;
  onClaimRewards: (treeId: string) => void;
}

export function StakingPanel({
  gameState,
  onClose,
  onStake,
  onUnstake,
  onClaimRewards,
}: StakingPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'stake' | 'staked'>('stake');
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<StakingLockPeriod>('flexible');
  const [selectedStake, setSelectedStake] = useState<StakedTree | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for live rewards calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter eligible trees for staking (must be mature and not already staked)
  const stakedTreeIds = new Set((gameState.stakedTrees || []).map((s) => s.treeId));
  const eligibleTrees = gameState.trees.filter(
    (tree) => (tree.growthStage === 'mature' || tree.growthStage === 'ancient') && !stakedTreeIds.has(tree.id)
  );

  const handleStakeTree = () => {
    if (!selectedTree) return;
    onStake(selectedTree.id, selectedLockPeriod);
    setSelectedTree(null);
  };

  const handleUnstake = (forceUnstake: boolean) => {
    if (!selectedStake) return;
    onUnstake(selectedStake.treeId, forceUnstake);
    setSelectedStake(null);
  };

  const formatTime = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTotalPendingRewards = (): { forest: number; leaf: number } => {
    let totalForest = 0;
    let totalLeaf = 0;

    for (const stake of gameState.stakedTrees || []) {
      const rewards = calculateStakingRewards(stake, currentTime);
      totalForest += rewards.forest + stake.accumulatedRewards.forest;
      totalLeaf += rewards.leaf + stake.accumulatedRewards.leaf;
    }

    return { forest: totalForest, leaf: totalLeaf };
  };

  const totalPendingRewards = getTotalPendingRewards();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">🏦 Staking Vault</h2>
              <p className="text-sm opacity-90">Stake trees to earn passive $FOREST & $LEAF rewards</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* Total Rewards Summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-sm opacity-90">Active Stakes</div>
              <div className="text-2xl font-bold">{(gameState.stakedTrees || []).length}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-sm opacity-90">Pending $FOREST</div>
              <div className="text-2xl font-bold">🌲 {formatTokenAmount(totalPendingRewards.forest)}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-sm opacity-90">Pending $LEAF</div>
              <div className="text-2xl font-bold">🍃 {formatTokenAmount(totalPendingRewards.leaf)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-indigo-200 bg-white">
          <button
            onClick={() => setActiveTab('stake')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'stake'
                ? 'bg-indigo-100 text-indigo-800 border-b-4 border-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            📥 Stake Trees ({eligibleTrees.length} available)
          </button>
          <button
            onClick={() => setActiveTab('staked')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'staked'
                ? 'bg-indigo-100 text-indigo-800 border-b-4 border-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            💎 My Stakes ({(gameState.stakedTrees || []).length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stake Tab */}
          {activeTab === 'stake' && (
            <div>
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>How it works:</strong> Stake mature/ancient trees to earn passive $FOREST and $LEAF tokens. 
                  Higher rarity trees and longer lock periods yield better APY rates. Rewards accumulate every second!
                </p>
              </div>

              {/* Lock Period Selection */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Choose Lock Period:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.keys(STAKING_TIERS) as StakingLockPeriod[]).map((period) => {
                    const tier = STAKING_TIERS[period];
                    return (
                      <button
                        key={period}
                        onClick={() => setSelectedLockPeriod(period)}
                        className={`p-4 rounded-xl border-4 transition-all ${
                          selectedLockPeriod === period
                            ? 'border-indigo-600 bg-indigo-50 scale-105'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{tier.emoji}</div>
                        <div className="font-bold text-lg">{tier.label}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {tier.lockDays === 0 ? 'No lock' : `${tier.lockDays} days`}
                        </div>
                        <div className="text-xl font-bold text-indigo-600">{tier.baseAPY}% APY</div>
                        {tier.earlyUnstakePenalty > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {tier.earlyUnstakePenalty}% early penalty
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eligible Trees */}
              <div>
                <h3 className="text-xl font-bold mb-4">Select Tree to Stake:</h3>
                {eligibleTrees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🌱</div>
                    <p className="text-lg font-bold">No eligible trees</p>
                    <p className="text-sm">Grow trees to mature stage to unlock staking!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eligibleTrees.map((tree) => {
                      const rarityMultiplier = RARITY_MULTIPLIERS[tree.rarityTier] || 1.0;
                      const estimatedAPY = getStakingAPY(selectedLockPeriod, tree.rarityTier);
                      
                      return (
                        <div
                          key={tree.id}
                          className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200 hover:border-indigo-400 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-lg font-bold">{tree.species}</div>
                              <div
                                className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block"
                                style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
                              >
                                {tree.rarityTier}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">APY</div>
                              <div className="text-xl font-bold text-green-600">{estimatedAPY}%</div>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <div>Stage: <span className="font-bold capitalize">{tree.growthStage}</span></div>
                            <div>Multiplier: <span className="font-bold">×{rarityMultiplier}</span></div>
                            <div className="text-xs text-green-600">
                              Earns both $FOREST & $LEAF
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedTree(tree)}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                          >
                            🏦 Stake This Tree
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staked Tab */}
          {activeTab === 'staked' && (
            <div>
              {(gameState.stakedTrees || []).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💤</div>
                  <p className="text-lg font-bold">No staked trees</p>
                  <p className="text-sm">Stake your first tree to start earning rewards!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(gameState.stakedTrees || []).map((stake) => {
                    const tree = gameState.trees.find((t) => t.id === stake.treeId);
                    if (!tree) return null;

                    const rewards = calculateStakingRewards(stake, currentTime);
                    const totalRewards = {
                      forest: rewards.forest + stake.accumulatedRewards.forest,
                      leaf: rewards.leaf + stake.accumulatedRewards.leaf,
                    };

                    const isUnlocked = currentTime >= stake.unlockAt;
                    const timeUntilUnlock = stake.unlockAt - currentTime;
                    const tier = STAKING_TIERS[stake.lockPeriod];

                    return (
                      <div
                        key={stake.treeId}
                        className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-6 shadow-lg border-2 border-indigo-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-xl font-bold">{tree.species}</div>
                            <div className="text-sm text-gray-600">{stake.tier}</div>
                            <div className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block bg-indigo-200">
                              {tier.emoji} {tier.label}
                            </div>
                          </div>
                          <div className="text-right">
                            {isUnlocked ? (
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                🔓 Unlocked
                              </div>
                            ) : (
                              <div>
                                <div className="text-xs text-gray-600">Unlocks in</div>
                                <div className="text-sm font-bold">{formatTime(timeUntilUnlock)}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rewards Display */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="text-sm text-gray-600 mb-2">Pending Rewards</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-bold">🌲 $FOREST:</span>
                              <span className="text-green-600 font-bold">{formatTokenAmount(totalRewards.forest)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold">🍃 $LEAF:</span>
                              <span className="text-green-600 font-bold">{formatTokenAmount(totalRewards.leaf)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          <div>Staked: <span className="font-bold">{formatTime(currentTime - stake.stakedAt)} ago</span></div>
                          <div>APY: <span className="font-bold text-green-600">{getStakingAPY(stake.lockPeriod, stake.tier)}%</span></div>
                          <div>Multiplier: <span className="font-bold">×{stake.rarityMultiplier}</span></div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={() => onClaimRewards(stake.treeId)}
                            disabled={totalRewards.forest < 0.01 && totalRewards.leaf < 0.01}
                            className={`w-full py-2 rounded-lg font-bold transition-colors ${
                              totalRewards.forest >= 0.01 || totalRewards.leaf >= 0.01
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            💰 Claim Rewards
                          </button>
                          <button
                            onClick={() => setSelectedStake(stake)}
                            className={`w-full py-2 rounded-lg font-bold transition-colors ${
                              isUnlocked
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            {isUnlocked ? '🔓 Unstake' : '⚠️ Force Unstake'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Staking Confirmation Modal */}
        {selectedTree && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">🏦 Confirm Staking</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tree:</span>
                  <span className="font-bold">{selectedTree.species} ({selectedTree.rarityTier})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lock Period:</span>
                  <span className="font-bold">{STAKING_TIERS[selectedLockPeriod].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated APY:</span>
                  <span className="font-bold text-green-600">
                    {getStakingAPY(selectedLockPeriod, selectedTree.rarityTier)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTree(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStakeTree}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                >
                  Confirm Stake
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unstake Confirmation Modal */}
        {selectedStake && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">🔓 Confirm Unstake</h3>
              <div className="mb-6">
                {currentTime >= selectedStake.unlockAt ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✅ Lock period completed! You can unstake without penalties.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                      ⚠️ Lock period not complete! Early unstaking will incur a <strong>{STAKING_TIERS[selectedStake.lockPeriod].earlyUnstakePenalty}%</strong> penalty on rewards.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedStake(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnstake(currentTime < selectedStake.unlockAt)}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors"
                >
                  Unstake Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
