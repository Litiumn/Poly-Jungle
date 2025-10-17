'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PLAYER_TIERS, type PlayerTier } from '@/lib/tokenomics-v2';

interface PlayerTierBadgeProps {
  tier: PlayerTier;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function PlayerTierBadge({ tier, size = 'md', showTooltip = true }: PlayerTierBadgeProps) {
  const tierInfo = PLAYER_TIERS[tier];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const tierColors = {
    free_grower: 'bg-gradient-to-r from-green-500 to-emerald-500',
    caretaker: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    patron: 'bg-gradient-to-r from-purple-500 to-pink-500',
  };

  return (
    <div className="relative group inline-block">
      <Badge
        className={`${tierColors[tier]} text-white font-semibold ${sizeClasses[size]} cursor-help`}
      >
        <span className="mr-1">{tierInfo.emoji}</span>
        <span>{tierInfo.name}</span>
      </Badge>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white border-2 border-gray-300 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            {tierInfo.name} {tierInfo.emoji}
          </div>
          <p className="text-xs text-gray-600 mb-2">{tierInfo.description}</p>
          <div className="text-xs text-gray-700">
            <div className="font-semibold mb-1">Benefits:</div>
            <ul className="space-y-0.5">
              {tierInfo.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlayerTierProgressProps {
  currentTier: PlayerTier;
  stakedTrees: number;
  hasSeasonalPass: boolean;
}

export function PlayerTierProgress({
  currentTier,
  stakedTrees,
  hasSeasonalPass,
}: PlayerTierProgressProps) {
  const tierInfo = PLAYER_TIERS[currentTier];

  const getNextTierInfo = () => {
    if (currentTier === 'free_grower') {
      return {
        tier: 'caretaker',
        requirement: `Stake ${Math.max(0, 3 - stakedTrees)} more ${stakedTrees === 2 ? 'tree' : 'trees'}`,
        progress: (stakedTrees / 3) * 100,
      };
    }
    if (currentTier === 'caretaker') {
      return {
        tier: 'patron',
        requirement: 'Purchase seasonal pass',
        progress: hasSeasonalPass ? 100 : 0,
      };
    }
    return {
      tier: 'patron',
      requirement: 'Max tier reached!',
      progress: 100,
    };
  };

  const nextTier = getNextTierInfo();

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierInfo.emoji}</span>
          <div>
            <div className="font-bold text-gray-800">{tierInfo.name}</div>
            <div className="text-xs text-gray-600">{tierInfo.description}</div>
          </div>
        </div>
      </div>

      {currentTier !== 'patron' && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Next Tier</span>
            <span className="font-semibold text-gray-800">
              {PLAYER_TIERS[nextTier.tier as PlayerTier].emoji} {PLAYER_TIERS[nextTier.tier as PlayerTier].name}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${nextTier.progress}%` }}
            />
          </div>

          <div className="text-xs text-gray-600">{nextTier.requirement}</div>
        </div>
      )}
    </div>
  );
}
