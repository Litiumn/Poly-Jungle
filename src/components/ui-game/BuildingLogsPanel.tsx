'use client';

/**
 * Building Logs Panel - Manage building logs obtained from cutting trees
 * 
 * Features:
 * - View building log inventory
 * - See conversion rates by tier
 * - Future: Use logs for crafting/upgrades
 */

import { SEED_TIER_INFO, type SeedTier } from '@/lib/seed-system';

interface BuildingLogsPanelProps {
  buildingLogs: number;
  onClose: () => void;
}

const BUILDING_LOG_YIELDS: Record<SeedTier, number> = {
  'Common Grove': 5,
  'Wildwood': 10,
  'Sacred Canopy': 20,
  'Elderbark': 35,
  'Mythroot': 60,
  'Celestial Bough': 85,
  'Origin Tree': 100,
};

export function BuildingLogsPanel({
  buildingLogs,
  onClose,
}: BuildingLogsPanelProps): JSX.Element {
  const tiers = Object.keys(SEED_TIER_INFO) as SeedTier[];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🪵 Building Logs</h2>
            <p className="text-sm opacity-90 mt-1">Resources from harvested trees</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Logs */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6 text-center">
            <div className="text-6xl mb-3">🪵</div>
            <div className="text-5xl font-bold text-amber-700 mb-2">{buildingLogs}</div>
            <div className="text-lg text-gray-600">Building Logs Available</div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1 text-sm text-blue-800">
                <p className="font-bold mb-1">About Building Logs</p>
                <p>
                  Cut down mature trees to obtain Building Logs. Higher-tier trees yield more logs.
                  Building Logs can be used for future crafting, upgrades, and special constructions!
                </p>
              </div>
            </div>
          </div>

          {/* Conversion Table */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Log Yield by Tree Tier</h3>
            <div className="space-y-2">
              {tiers.map((tier) => {
                const tierInfo = SEED_TIER_INFO[tier];
                const logYield = BUILDING_LOG_YIELDS[tier];
                
                return (
                  <div
                    key={tier}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderLeft: `4px solid ${tierInfo.glowColor}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tierInfo.emoji}</span>
                      <div>
                        <div className="font-bold text-sm">{tier}</div>
                        <div className="text-xs text-gray-500">{tierInfo.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{logYield}</div>
                      <div className="text-xs text-gray-500">logs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Features */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="text-lg font-bold mb-3 text-purple-800">🚧 Coming Soon</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span>🏗️</span>
                <span>Build special structures with logs</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚒️</span>
                <span>Craft tools and decorations</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span>Upgrade forest infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💱</span>
                <span>Trade logs with other players</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
