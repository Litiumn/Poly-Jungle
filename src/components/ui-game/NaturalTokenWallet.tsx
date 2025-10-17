'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTokenAmount } from '@/lib/tokenomics-v2';
import { PlayerTierBadge, PlayerTierProgress } from './PlayerTierBadge';
import type { PlayerTier } from '@/lib/tokenomics-v2';

interface NaturalTokenWalletProps {
  mode?: 'full' | 'compact';
  forestBalance: number;
  leafBalance: number;
  woodBalance: number;
  playerTier: PlayerTier;
  stakedTrees: number;
  hasSeasonalPass: boolean;
  dailyEarnings: {
    leaf: number;
    forest: number;
    leafCap: number;
    forestCap: number;
  };
  lifetimeRewards: {
    leaf: number;
    forest: number;
  };
  onOpenTokenomics?: () => void;
}

export function NaturalTokenWallet({
  mode = 'full',
  forestBalance,
  leafBalance,
  woodBalance,
  playerTier,
  stakedTrees,
  hasSeasonalPass,
  dailyEarnings,
  lifetimeRewards,
  onOpenTokenomics,
}: NaturalTokenWalletProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (mode === 'compact') {
    return (
      <Card className="bg-gradient-to-br from-emerald-900/80 to-teal-900/80 text-white p-3 backdrop-blur-sm border border-emerald-600/50">
        <div className="flex items-center justify-between gap-4">
          <PlayerTierBadge tier={playerTier} size="sm" showTooltip={false} />
          
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-300">🌲</span>
              <span className="font-semibold">{formatTokenAmount(forestBalance)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-300">🍃</span>
              <span className="font-semibold">{formatTokenAmount(leafBalance)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-300">🪵</span>
              <span className="font-semibold">{woodBalance}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="text-white hover:bg-white/20"
          >
            {showDetails ? '▼' : '▶'}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-white/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-300">Today's Earnings:</span>
              <div className="flex gap-2">
                <span>🍃 {dailyEarnings.leaf}/{dailyEarnings.leafCap}</span>
                <span>🌲 {dailyEarnings.forest.toFixed(1)}/{dailyEarnings.forestCap}</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onOpenTokenomics}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              View Token Info
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-50 to-teal-50 border-4 border-emerald-600 shadow-2xl m-4">
        <Button
          onClick={() => setShowDetails(false)}
          variant="ghost"
          className="absolute top-4 right-4 z-10 text-2xl hover:bg-emerald-200 rounded-full w-10 h-10"
        >
          ✕
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>🌿</span>
            <span>Your Forest Resources</span>
          </h2>
          <p className="text-emerald-100 mt-1">
            Nurture your resources and watch your forest thrive
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Player Tier */}
          <PlayerTierProgress
            currentTier={playerTier}
            stakedTrees={stakedTrees}
            hasSeasonalPass={hasSeasonalPass}
          />

          {/* Token Balances (Natural Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* $FOREST Token */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-400 p-4">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🌲</div>
              <div className="relative z-10">
                <div className="text-sm text-amber-700 font-semibold mb-1">
                  Governance Seeds
                </div>
                <div className="text-3xl font-bold text-amber-800 mb-2">
                  {formatTokenAmount(forestBalance)}
                </div>
                <div className="text-xs text-amber-600">
                  🌲 $FOREST Token
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Your trees' strength grows with care
                </div>
              </div>
            </Card>

            {/* $LEAF Token */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-400 p-4">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🍃</div>
              <div className="relative z-10">
                <div className="text-sm text-emerald-700 font-semibold mb-1">
                  Forest Energy
                </div>
                <div className="text-3xl font-bold text-emerald-800 mb-2">
                  {formatTokenAmount(leafBalance)}
                </div>
                <div className="text-xs text-emerald-600">
                  🍃 $LEAF Token
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Energy flows through every branch
                </div>
              </div>
            </Card>

            {/* $WOOD Resource */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 p-4">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🪵</div>
              <div className="relative z-10">
                <div className="text-sm text-orange-700 font-semibold mb-1">
                  Crafting Materials
                </div>
                <div className="text-3xl font-bold text-orange-800 mb-2">
                  {woodBalance}
                </div>
                <div className="text-xs text-orange-600">
                  🪵 Building Logs
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Harvest from mature trees
                </div>
              </div>
            </Card>
          </div>

          {/* Daily Earning Progress */}
          <Card className="bg-white p-4 border-2 border-gray-300">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>☀️</span>
              <span>Today's Growth</span>
            </h3>

            <div className="space-y-3">
              {/* Leaf Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <span>🍃</span>
                    <span>Forest Energy</span>
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {dailyEarnings.leaf} / {dailyEarnings.leafCap}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((dailyEarnings.leaf / dailyEarnings.leafCap) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Forest Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <span>🌲</span>
                    <span>Governance Seeds</span>
                  </span>
                  <span className="font-semibold text-amber-700">
                    {dailyEarnings.forest.toFixed(1)} / {dailyEarnings.forestCap}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((dailyEarnings.forest / dailyEarnings.forestCap) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
              💡 Your {playerTier.replace('_', ' ')} tier allows you to earn up to {dailyEarnings.leafCap} 🍃 
              and {dailyEarnings.forestCap} 🌲 daily!
            </div>
          </Card>

          {/* Lifetime Rewards */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-2 border-purple-300">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <span>🏆</span>
              <span>Lifetime Harvest</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-700">
                  {formatTokenAmount(lifetimeRewards.forest)}
                </div>
                <div className="text-sm text-gray-600">🌲 Seeds Collected</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-700">
                  {formatTokenAmount(lifetimeRewards.leaf)}
                </div>
                <div className="text-sm text-gray-600">🍃 Energy Gathered</div>
              </div>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
            <h4 className="font-semibold text-emerald-800 mb-2">🌱 About Your Resources</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Governance Seeds (🌲)</strong> — Earned through care & staking</li>
              <li>• <strong>Forest Energy (🍃)</strong> — From daily activities & missions</li>
              <li>• <strong>Building Logs (🪵)</strong> — Harvested from mature trees</li>
              <li>• Daily caps encourage balanced growth, not endless grinding</li>
            </ul>
          </div>

          {onOpenTokenomics && (
            <Button
              onClick={onOpenTokenomics}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700"
            >
              Learn More About Tokenomics
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
