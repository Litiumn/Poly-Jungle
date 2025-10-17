'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { GameState } from '@/types/game';

interface ForestHUDProps {
  gameState: GameState;
  onOpenPanel: (panel: string) => void;
}

export function ForestHUD({ gameState, onOpenPanel }: ForestHUDProps): JSX.Element {
  const forestHealth = Math.min(100, (gameState.stats.totalTreesPlanted * 5) + (gameState.stats.totalTrashCleaned * 2));

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <Card className="bg-white bg-opacity-90 p-4 shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <div>
                  <p className="text-sm text-gray-600">Eco-Points</p>
                  <p className="text-2xl font-bold text-green-700">{gameState.ecoPoints}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-xl font-bold text-orange-600">{gameState.streak.count} days</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">🌳</span>
                <div>
                  <p className="text-sm text-gray-600">Trees</p>
                  <p className="text-xl font-bold text-green-600">{gameState.trees.length}</p>
                </div>
              </div>

              <div className="w-48">
                <p className="text-sm text-gray-600 mb-1">Forest Health</p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${forestHealth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">👤 {gameState.username}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 justify-center pointer-events-auto">
          <Button
            onClick={() => onOpenPanel('inventory')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            🎒 Inventory
          </Button>

          <Button
            onClick={() => onOpenPanel('missions')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          >
            🎯 Missions
          </Button>

          <Button
            onClick={() => onOpenPanel('visit')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3"
          >
            🌍 Visit Forests
          </Button>

          <Button
            onClick={() => onOpenPanel('leaderboard')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3"
          >
            🏆 Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
}
