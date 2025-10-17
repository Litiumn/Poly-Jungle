'use client';

import type { GameStateData } from '@/lib/self-contained-storage';

interface DebugPanelProps {
  gameState: GameStateData;
  onClose: () => void;
  onAddEcoPoints: (amount: number) => void;
  onSpawnTrash: () => void;
  onOpenTreeGrowth?: () => void;
  onOpenVisualDebug?: () => void;
}

export function DebugPanel({
  gameState,
  onClose,
  onAddEcoPoints,
  onSpawnTrash,
  onOpenTreeGrowth,
  onOpenVisualDebug,
}: DebugPanelProps): JSX.Element {
  return (
    <div className="absolute top-20 left-4 bg-gray-900 text-white rounded-lg shadow-2xl p-4 max-w-sm z-50 border-2 border-yellow-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-yellow-400">🔧 Debug Controls</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-red-400 font-bold"
        >
          ✕
        </button>
      </div>
      
      {/* Stats */}
      <div className="bg-gray-800 rounded p-3 mb-4 text-sm space-y-1">
        <div className="font-bold text-yellow-400 mb-2">Current Stats:</div>
        <div>Trees: {gameState.trees.length}</div>
        <div>Eco-Points: {gameState.ecoPoints}</div>
        <div>Trash: {gameState.trash.length}</div>
        <div>Trees Planted: {gameState.stats.treesPlanted}</div>
        <div>Trash Cleaned: {gameState.stats.trashCleaned}</div>
        <div>Trees Watered: {gameState.stats.treesWatered}</div>
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => onAddEcoPoints(100)}
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
        >
          + Add 100 Eco-Points
        </button>
        
        <button
          onClick={() => onAddEcoPoints(500)}
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
        >
          + Add 500 Eco-Points
        </button>
        
        <button
          onClick={onSpawnTrash}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-bold"
        >
          🗑️ Spawn Trash
        </button>
        
        {onOpenTreeGrowth && (
          <button
            onClick={onOpenTreeGrowth}
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-bold"
          >
            🌱 Tree Growth Tool
          </button>
        )}
        
        {onOpenVisualDebug && (
          <button
            onClick={onOpenVisualDebug}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded font-bold"
          >
            🎨 Visual Debug Panel
          </button>
        )}
      </div>
      
      {/* Info */}
      <div className="mt-4 text-xs bg-blue-900/50 rounded p-2">
        <div className="font-bold mb-1">Growth Info:</div>
        <div>Trees grow in real-time based on planted timestamp.</div>
        <div className="mt-1">Stages: seed (0-30min) → sprout (30-60min) → young (60-120min) → mature (120min+)</div>
      </div>
    </div>
  );
}
