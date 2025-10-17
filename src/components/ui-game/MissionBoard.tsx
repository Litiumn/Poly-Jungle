'use client';

import type { Mission, DecorationType } from '@/lib/self-contained-storage';
import { DECORATION_INFO } from '@/lib/self-contained-storage';

interface MissionBoardProps {
  missions: Mission[];
  onClaim: (missionId: string) => void;
  onClose: () => void;
}

export function MissionBoard({ missions, onClaim, onClose }: MissionBoardProps): JSX.Element {
  const missionTypeEmoji: Record<string, string> = {
    plant: '🌱',
    water: '💧',
    clean: '🗑️',
    visit: '👥',
  };
  
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-2xl p-8 max-w-2xl border-4 border-amber-900">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">📜 Daily Missions</h2>
          <p className="text-amber-800">Complete tasks to earn rewards!</p>
        </div>
        
        {/* Mission List */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {missions.map((mission) => {
            const progress = Math.min((mission.current / mission.target) * 100, 100);
            const canClaim = mission.completed && !mission.claimed;
            
            return (
              <div
                key={mission.id}
                className={`
                  bg-white rounded-xl p-4 shadow-lg
                  ${mission.claimed ? 'opacity-60' : ''}
                  ${canClaim ? 'border-4 border-green-500 animate-pulse' : 'border-2 border-amber-300'}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{missionTypeEmoji[mission.type]}</div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{mission.title}</div>
                      <div className="text-sm text-gray-600">{mission.description}</div>
                    </div>
                  </div>
                  {mission.claimed && (
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ✓ Claimed
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {!mission.claimed && (
                  <>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>Progress</span>
                        <span className="font-bold">{mission.current} / {mission.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-3 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          🍃 +{mission.reward.ecoPoints}
                        </div>
                        {mission.reward.decoration && (
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                            {DECORATION_INFO[mission.reward.decoration as DecorationType].emoji}{' '}
                            {DECORATION_INFO[mission.reward.decoration as DecorationType].name}
                          </div>
                        )}
                      </div>
                      
                      {canClaim && (
                        <button
                          onClick={() => onClaim(mission.id)}
                          className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                        >
                          Claim!
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-800 text-white py-3 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
