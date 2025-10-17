'use client';

interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

interface LeaderboardPanelProps {
  leaderboard: LeaderboardEntry[];
  currentUser: string;
  onClose: () => void;
}

export function LeaderboardPanel({ leaderboard, currentUser, onClose }: LeaderboardPanelProps): JSX.Element {
  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };
  
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };
  
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-2xl p-8 max-w-2xl border-4 border-indigo-900">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold text-indigo-900 mb-2">🏆 Leaderboard</h2>
            <p className="text-indigo-800">Top EcoForest Guardians</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/30 hover:bg-white/50 text-indigo-900 px-4 py-2 rounded-lg font-bold transition-colors ml-4"
          >
            ✕ Close
          </button>
        </div>
        
        {/* Scoring Formula */}
        <div className="bg-white/60 rounded-lg p-3 mb-6 text-sm text-center">
          <div className="font-bold text-indigo-900 mb-1">Scoring Formula:</div>
          <div className="text-indigo-800">
            (Trees × 3) + (Decorations × 2) + (Likes × 5)
          </div>
        </div>
        
        {/* Leaderboard List */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.username === currentUser;
            
            return (
              <div
                key={entry.username}
                className={`
                  rounded-xl p-4 shadow-lg flex items-center justify-between
                  ${isCurrentUser
                    ? 'bg-gradient-to-r from-green-400 to-green-600 border-4 border-green-800 text-white'
                    : 'bg-white text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`
                    bg-gradient-to-br ${getRankColor(entry.rank)}
                    text-white font-bold px-4 py-3 rounded-full text-xl
                    shadow-lg
                  `}>
                    {getRankEmoji(entry.rank)}
                    <span className="ml-1">#{entry.rank}</span>
                  </div>
                  
                  {/* Username */}
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {entry.username}
                      {isCurrentUser && <span className="text-sm">(You)</span>}
                    </div>
                  </div>
                </div>
                
                {/* Score */}
                <div className={`
                  font-bold text-2xl px-4 py-2 rounded-full
                  ${isCurrentUser ? 'bg-white/20' : 'bg-indigo-100 text-indigo-900'}
                `}>
                  ⭐ {entry.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
