'use client';

/**
 * Visual Debug Panel - Enhanced tree visual testing controls
 * 
 * Allows developers to test tree visuals, growth stages, and rarity effects quickly.
 */

import { useState } from 'react';
import type { TreeData, GrowthStage } from '@/lib/self-contained-storage';
import type { SeedTier } from '@/lib/seed-system';
import { SEED_TIER_INFO } from '@/lib/seed-system';
import { TREE_MODELS, RARITY_COLORS } from '@/lib/tree-models';
import type { TreeSpecies } from '@/types/game';

interface VisualDebugPanelProps {
  trees: TreeData[];
  onGrowTree: (treeId: string, stage: GrowthStage) => void;
  onRandomizeTreeVisual: (treeId: string, newSpecies: TreeSpecies, newTier: SeedTier) => void;
  onResetTree: (treeId: string) => void;
  onClose: () => void;
}

export function VisualDebugPanel({
  trees,
  onGrowTree,
  onRandomizeTreeVisual,
  onResetTree,
  onClose,
}: VisualDebugPanelProps): JSX.Element {
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<GrowthStage>('mature');
  const [selectedSpecies, setSelectedSpecies] = useState<TreeSpecies>('Oak');
  const [selectedTier, setSelectedTier] = useState<SeedTier>('Common Grove');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 15));
  };

  const handleGrowInstantly = () => {
    if (!selectedTreeId) {
      addLog('❌ No tree selected');
      return;
    }

    const tree = trees.find((t) => t.id === selectedTreeId);
    if (!tree) {
      addLog('❌ Tree not found');
      return;
    }

    onGrowTree(selectedTreeId, selectedStage);
    addLog(`✅ Tree #${tree.id.slice(-6)} instantly grown to ${selectedStage.toUpperCase()}`);
  };

  const handleRandomizeVisual = () => {
    if (!selectedTreeId) {
      addLog('❌ No tree selected');
      return;
    }

    const tree = trees.find((t) => t.id === selectedTreeId);
    if (!tree) {
      addLog('❌ Tree not found');
      return;
    }

    onRandomizeTreeVisual(selectedTreeId, selectedSpecies, selectedTier);
    addLog(
      `🎨 Tree #${tree.id.slice(-6)} visual changed to ${selectedSpecies} (${selectedTier})`
    );
  };

  const handleResetTree = () => {
    if (!selectedTreeId) {
      addLog('❌ No tree selected');
      return;
    }

    const tree = trees.find((t) => t.id === selectedTreeId);
    if (!tree) {
      addLog('❌ Tree not found');
      return;
    }

    onResetTree(selectedTreeId);
    addLog(`🔄 Tree #${tree.id.slice(-6)} reset to seed stage`);
  };

  const growthStages: GrowthStage[] = ['seed', 'sprout', 'young', 'mature'];
  const allSpecies = Object.keys(TREE_MODELS) as TreeSpecies[];
  const allTiers = Object.keys(SEED_TIER_INFO) as SeedTier[];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🎨 Visual Debug Panel</h2>
            <p className="text-sm opacity-90 mt-1">
              Test tree visuals, growth stages, and rarity effects
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-bold">
              ⚠️ Developer Tool: Changes are instant and bypass normal game
              mechanics.
            </p>
          </div>

          {/* Tree Selection */}
          <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">
              🌳 Select Tree
            </h3>
            <select
              value={selectedTreeId}
              onChange={(e) => setSelectedTreeId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none bg-white text-base"
            >
              <option value="">-- Choose a tree --</option>
              {trees.map((tree) => (
                <option key={tree.id} value={tree.id}>
                  #{tree.id.slice(-6)} | {tree.species} | {tree.tier || 'Legacy'} |{' '}
                  {tree.growthStage} {tree.isMinted ? '🏅' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Controls Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Growth Control */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                🚀 Instant Growth
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Target Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) =>
                      setSelectedStage(e.target.value as GrowthStage)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 outline-none bg-white"
                  >
                    {growthStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGrowInstantly}
                  disabled={!selectedTreeId}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${ selectedTreeId
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  🌱 Grow Instantly
                </button>
              </div>
            </div>

            {/* Visual Randomizer */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                🎨 Randomize Visual
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Species
                  </label>
                  <select
                    value={selectedSpecies}
                    onChange={(e) =>
                      setSelectedSpecies(e.target.value as TreeSpecies)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
                  >
                    {allSpecies.map((species) => (
                      <option key={species} value={species}>
                        {species}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Rarity Tier
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) =>
                      setSelectedTier(e.target.value as SeedTier)
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
                  >
                    {allTiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier} {SEED_TIER_INFO[tier].emoji}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRandomizeVisual}
                  disabled={!selectedTreeId}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    selectedTreeId
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  🎲 Randomize Look
                </button>
              </div>
            </div>
          </div>

          {/* Reset Control */}
          <div className="bg-white rounded-lg p-6 border-2 border-red-200 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">
              🔄 Reset Tree
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Reset the selected tree to seed stage (does not change species/tier)
            </p>
            <button
              onClick={handleResetTree}
              disabled={!selectedTreeId}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                selectedTreeId
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:scale-105'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              ↩️ Reset to Seed
            </button>
          </div>

          {/* Visual Reference Grid */}
          <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">
              📊 Rarity Reference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allTiers.map((tier) => {
                const rarityStyle = RARITY_COLORS[tier];
                const info = SEED_TIER_INFO[tier];
                return (
                  <div
                    key={tier}
                    className="border-2 rounded-lg p-3 text-center"
                    style={{ borderColor: rarityStyle.primary }}
                  >
                    <div className="text-2xl mb-1">{info.emoji}</div>
                    <div className="text-xs font-bold text-gray-800">
                      {tier}
                    </div>
                    <div
                      className="h-3 rounded mt-2"
                      style={{
                        backgroundColor: rarityStyle.primary,
                        boxShadow: `0 0 10px ${rarityStyle.glow}`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forest Stats */}
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">
              📈 Forest Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trees.length}
                </div>
                <div className="text-gray-600">Total Trees</div>
              </div>
              {growthStages.map((stage) => (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trees.filter((t) => t.growthStage === stage).length}
                  </div>
                  <div className="text-gray-600 capitalize">{stage}</div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {trees.filter((t) => t.isMinted).length}
                </div>
                <div className="text-gray-600">Minted 🏅</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(trees.map((t) => t.tier || 'Legacy')).size}
                </div>
                <div className="text-gray-600">Unique Tiers</div>
              </div>
            </div>
          </div>

          {/* Action Log */}
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="font-bold mb-2 text-white">📝 Action Log:</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">No actions yet...</div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
