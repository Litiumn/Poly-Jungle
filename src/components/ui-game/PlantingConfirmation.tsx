'use client';

/**
 * Planting Confirmation Dialog
 * 
 * Shows seed details, expected tree type, growth time, and plot status
 */

import type { SeedData, SeedTier } from '@/lib/seed-system';
import { SEED_TIER_INFO, getTierGrowthDuration } from '@/lib/seed-system';
import type { TreeSpecies } from '@/lib/self-contained-storage';

interface PlantingConfirmationProps {
  seed: SeedData;
  plotPosition: { x: number; z: number };
  isPlotAvailable: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlantingConfirmation({
  seed,
  plotPosition,
  isPlotAvailable,
  onConfirm,
  onCancel,
}: PlantingConfirmationProps): JSX.Element {
  // Safely get tier info with fallback to Common Grove
  const safeTier = (seed.tier && seed.tier in SEED_TIER_INFO) ? seed.tier as SeedTier : 'Common Grove';
  const tierInfo = SEED_TIER_INFO[safeTier];
  const growthTimes = getTierGrowthDuration(safeTier) || {
    seed: 0,
    sprout: 0.5,
    young: 1.0,
    mature: 2.0,
  };

  const formatGrowthTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{tierInfo.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-800">Confirm Planting</h2>
          <p className="text-sm text-gray-600 mt-1">Review seed details before planting</p>
        </div>

        {/* Seed Information */}
        <div className="bg-white rounded-xl p-6 mb-4 shadow-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Seed Name</div>
              <div className="font-bold text-lg">{seed.tier}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Species</div>
              <div className="font-bold text-lg">{seed.species}</div>
            </div>
          </div>

          <div
            className="px-4 py-2 rounded-lg mb-4 font-bold text-center"
            style={{ backgroundColor: tierInfo.glowColor, color: '#fff' }}
          >
            {tierInfo.description}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rarity Level:</span>
              <span className="font-bold">★ {tierInfo.rarity}/7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eco-Point Yield:</span>
              <span className="font-bold text-green-600">{tierInfo.ecoPointYield}× per watering</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Speed:</span>
              <span className="font-bold">{(tierInfo.growthSpeedMultiplier * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="bg-white rounded-xl p-6 mb-4 shadow-lg">
          <h3 className="font-bold text-lg mb-3">Expected Growth Timeline</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                1
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">Seed → Sprout</div>
                <div className="text-xs text-gray-600">{formatGrowthTime(growthTimes.sprout)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                2
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">Sprout → Young</div>
                <div className="text-xs text-gray-600">{formatGrowthTime(growthTimes.young)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                3
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">Young → Mature</div>
                <div className="text-xs text-gray-600">{formatGrowthTime(growthTimes.mature)}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between font-bold">
              <span>Total Growth Time:</span>
              <span className="text-green-600">
                {formatGrowthTime(growthTimes.sprout + growthTimes.young + growthTimes.mature)}
              </span>
            </div>
          </div>
        </div>

        {/* Plot Status */}
        <div
          className={`rounded-xl p-4 mb-6 ${
            isPlotAvailable
              ? 'bg-green-100 border-2 border-green-400'
              : 'bg-red-100 border-2 border-red-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{isPlotAvailable ? '✅' : '❌'}</div>
            <div>
              <div className="font-bold">
                {isPlotAvailable ? 'Plot Available' : 'Plot Occupied'}
              </div>
              <div className="text-sm">
                Position: ({plotPosition.x.toFixed(1)}, {plotPosition.z.toFixed(1)})
              </div>
              {!isPlotAvailable && (
                <div className="text-xs text-red-600 mt-1">
                  This plot is too close to another tree or decoration
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isPlotAvailable}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              isPlotAvailable
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPlotAvailable ? '🌱 Plant Seed' : '❌ Cannot Plant'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center text-xs text-gray-500">
          💡 Tip: Water your tree daily for +10% growth bonus!
        </div>
      </div>
    </div>
  );
}
