'use client';

/**
 * TreeMoveMode - Component for moving existing trees
 * 
 * Features:
 * - Select a tree to move
 * - Show placement preview
 * - Confirm new position
 * - Cancel movement
 */

import { useState, useCallback } from 'react';
import type { TreeData } from '@/lib/self-contained-storage';

interface TreeMoveModeProps {
  trees: TreeData[];
  onMoveTree: (treeId: string, newX: number, newZ: number) => void;
  onClose: () => void;
}

export function TreeMoveMode({ trees, onMoveTree, onClose }: TreeMoveModeProps): JSX.Element {
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const selectedTree = trees.find(t => t.id === selectedTreeId);

  return (
    <div className="absolute top-20 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md z-40">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-green-800">🚚 Move Tree</h3>
        <button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg transition-colors text-sm font-bold"
        >
          ✕ Close
        </button>
      </div>

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>How to move:</strong> Select a tree from the list below, then click on the forest ground to choose its new location. The tree will maintain all its properties.
        </p>
      </div>

      {selectedTree && (
        <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-green-800">
                {selectedTree.species} - {selectedTree.growthStage}
              </div>
              <div className="text-sm text-gray-600">
                Current: ({selectedTree.position.x.toFixed(1)}, {selectedTree.position.z.toFixed(1)})
              </div>
            </div>
            <div className="text-3xl">📍</div>
          </div>
          <div className="mt-2 text-sm text-green-700 font-bold">
            ✅ Click on the ground to place this tree in a new location
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {trees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🌱</div>
            <p>No trees to move yet</p>
          </div>
        ) : (
          trees.map(tree => (
            <button
              key={tree.id}
              onClick={() => setSelectedTreeId(tree.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedTreeId === tree.id
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">
                    {tree.species}
                  </div>
                  <div className="text-sm text-gray-600">
                    Stage: {tree.growthStage} • Position: ({tree.position.x.toFixed(1)}, {tree.position.z.toFixed(1)})
                  </div>
                  {tree.tier && (
                    <div className="text-xs text-purple-600 font-bold mt-1">
                      {tree.tier}
                    </div>
                  )}
                </div>
                {selectedTreeId === tree.id && (
                  <div className="text-2xl ml-2">👉</div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {selectedTreeId && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSelectedTreeId(null)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-bold transition-colors"
          >
            Cancel Selection
          </button>
        </div>
      )}
    </div>
  );
}
