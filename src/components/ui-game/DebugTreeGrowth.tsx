'use client';

/**
 * Debug Tree Growth Tool - Developer testing interface
 */

import { useState } from 'react';
import type { TreeData, GrowthStage } from '@/lib/self-contained-storage';

interface DebugTreeGrowthProps {
  trees: TreeData[];
  onGrowTree: (treeId: string, stage: GrowthStage) => void;
  onClose: () => void;
}

export function DebugTreeGrowth({
  trees,
  onGrowTree,
  onClose,
}: DebugTreeGrowthProps): JSX.Element {
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<GrowthStage>('mature');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  const handleApplyGrowth = () => {
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
    addLog(
      `✅ Tree #${tree.id.slice(-6)} grown to ${selectedStage.toUpperCase()} stage`
    );
  };

  const growthStages: GrowthStage[] = ['seed', 'sprout', 'young', 'mature'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🔧 Debug: Tree Growth</h2>
            <p className="text-sm opacity-90 mt-1">Developer testing tool</p>
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
          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-bold">
              ⚠️ Developer Tool: This will instantly change tree growth stages for
              testing purposes only.
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4 mb-6">
            {/* Tree Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Tree
              </label>
              <select
                value={selectedTreeId}
                onChange={(e) => setSelectedTreeId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
              >
                <option value="">-- Choose a tree --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.species} - {tree.tier || 'Legacy'} - Current: {tree.growthStage}{' '}
                    {tree.isMinted ? '🏅' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Target Growth Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as GrowthStage)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
              >
                {growthStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyGrowth}
              disabled={!selectedTreeId}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                selectedTreeId
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              🚀 Apply Growth
            </button>
          </div>

          {/* Forest Stats */}
          <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Forest Statistics</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Total Trees:</span>
                <span className="font-bold ml-2">{trees.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Seed:</span>
                <span className="font-bold ml-2">
                  {trees.filter((t) => t.growthStage === 'seed').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Sprout:</span>
                <span className="font-bold ml-2">
                  {trees.filter((t) => t.growthStage === 'sprout').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Young:</span>
                <span className="font-bold ml-2">
                  {trees.filter((t) => t.growthStage === 'young').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Mature:</span>
                <span className="font-bold ml-2 text-green-600">
                  {trees.filter((t) => t.growthStage === 'mature').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Minted:</span>
                <span className="font-bold ml-2 text-yellow-600">
                  {trees.filter((t) => t.isMinted).length} 🏅
                </span>
              </div>
            </div>
          </div>

          {/* Action Log */}
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="font-bold mb-2 text-white">Action Log:</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">No actions yet...</div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
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
