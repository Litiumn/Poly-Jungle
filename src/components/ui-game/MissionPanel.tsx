'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { GameState, Mission } from '@/types/game';
import { claimMission } from '@/lib/mock_api';

interface MissionPanelProps {
  gameState: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export function MissionPanel({ gameState, onClose, onRefresh }: MissionPanelProps): JSX.Element {
  const handleClaim = (missionId: string): void => {
    const success = claimMission(gameState, missionId);
    if (success) {
      onRefresh();
    }
  };

  const activeMissions = gameState.missions.filter((m: Mission) => !m.claimed);
  const completedMissions = gameState.missions.filter((m: Mission) => m.claimed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🎯 Missions</h2>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Active Missions</h3>
            <div className="space-y-3">
              {activeMissions.map((mission: Mission) => (
                <Card key={mission.id} className="p-4 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{mission.title}</h4>
                      <p className="text-sm text-gray-600">{mission.description}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {mission.type}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {mission.currentProgress || 0} / {mission.goal.target}</span>
                      <span>{Math.round(((mission.currentProgress || 0) / mission.goal.target) * 100)}%</span>
                    </div>
                    <Progress value={((mission.currentProgress || 0) / mission.goal.target) * 100} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">Reward: {mission.reward.ecoPoints} eco-points</span>
                      {mission.reward.items && mission.reward.items.length > 0 && (
                        <span className="ml-2 text-gray-600">+ {mission.reward.items.length} items</span>
                      )}
                    </div>

                    {mission.completed && !mission.claimed && (
                      <Button
                        onClick={() => handleClaim(mission.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Claim Reward
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              {activeMissions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No active missions. Check back later!</p>
              )}
            </div>
          </div>

          {completedMissions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Completed Missions</h3>
              <div className="space-y-2">
                {completedMissions.slice(0, 5).map((mission: Mission) => (
                  <div key={mission.id} className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                    <span className="text-gray-700">{mission.title}</span>
                    <span className="text-green-600 font-semibold">✓ Claimed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
