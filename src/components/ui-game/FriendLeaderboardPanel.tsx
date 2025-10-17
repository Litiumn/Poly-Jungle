'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FriendLeaderboardEntry } from '@/types/social';

interface FriendLeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  friendEntries: FriendLeaderboardEntry[];
  currentUserId: string;
  onAddFriend: (userId: string) => void;
  onVisitForest: (userId: string) => void;
}

export function FriendLeaderboardPanel({
  isOpen,
  onClose,
  friendEntries,
  currentUserId,
  onAddFriend,
  onVisitForest,
}: FriendLeaderboardPanelProps) {
  const [sortBy, setSortBy] = useState<'score' | 'tier'>('score');

  if (!isOpen) return null;

  const sortedEntries = [...friendEntries].sort((a, b) => {
    if (sortBy === 'score') {
      return b.score - a.score;
    }
    const tierOrder = { patron: 3, caretaker: 2, free_grower: 1 };
    return (tierOrder[b.tier as keyof typeof tierOrder] || 0) - (tierOrder[a.tier as keyof typeof tierOrder] || 0);
  });

  const currentUserEntry = sortedEntries.find((e) => e.userId === currentUserId);
  const friends = sortedEntries.filter((e) => e.isFriend);
  const suggestions = sortedEntries.filter((e) => !e.isFriend && e.userId !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-50 border-4 border-cyan-600 shadow-2xl m-4">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 z-10 text-2xl hover:bg-cyan-200 rounded-full w-10 h-10"
        >
          ✕
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>👥</span>
            <span>Friend Circle</span>
          </h2>
          <p className="text-cyan-100 mt-1">
            Compare progress with your friends — no pressure, just fun!
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Your Rank */}
          {currentUserEntry && (
            <Card className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🌟</div>
                  <div>
                    <div className="font-bold text-gray-800">Your Rank</div>
                    <div className="text-sm text-gray-600">
                      {currentUserEntry.badge}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-700">
                    {currentUserEntry.score}
                  </div>
                  <div className="text-xs text-gray-600">eco score</div>
                </div>
              </div>
            </Card>
          )}

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              onClick={() => setSortBy('score')}
              variant={sortBy === 'score' ? 'default' : 'outline'}
              size="sm"
              className={sortBy === 'score' ? 'bg-cyan-600 text-white' : ''}
            >
              By Score
            </Button>
            <Button
              onClick={() => setSortBy('tier')}
              variant={sortBy === 'tier' ? 'default' : 'outline'}
              size="sm"
              className={sortBy === 'tier' ? 'bg-cyan-600 text-white' : ''}
            >
              By Tier
            </Button>
          </div>

          {/* Friends List */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>💚</span>
              <span>Your Friends ({friends.length})</span>
            </h3>

            {friends.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                Add some friends to see their progress!
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((entry) => (
                  <Card
                    key={entry.userId}
                    className="p-4 border-2 border-cyan-300 hover:border-cyan-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {getTierEmoji(entry.tier)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {entry.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.badge}
                          </div>
                        </div>
                        <Badge className="bg-cyan-600 text-white text-xs">
                          {entry.tier.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-cyan-700">
                            {entry.score}
                          </div>
                          <div className="text-xs text-gray-600">score</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onVisitForest(entry.userId)}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Visit
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Friend Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>✨</span>
                <span>Suggested Friends</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.slice(0, 6).map((entry) => (
                  <Card
                    key={entry.userId}
                    className="p-3 border border-gray-300 hover:border-cyan-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{getTierEmoji(entry.tier)}</div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">
                            {entry.username}
                          </div>
                          <div className="text-xs text-gray-600">
                            Score: {entry.score}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddFriend(entry.userId)}
                        className="bg-cyan-600 text-white hover:bg-cyan-700 text-xs px-2 py-1"
                      >
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-300">
            <h4 className="font-semibold text-cyan-800 mb-2">💡 Friend Circle Benefits</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Compare your forest growth with friends</li>
              <li>• No competitive pressure — just friendly inspiration</li>
              <li>• Visit each other's gardens for ideas</li>
              <li>• Celebrate milestones together</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getTierEmoji(tier: string): string {
  const emojis: Record<string, string> = {
    free_grower: '🌱',
    caretaker: '🌿',
    patron: '🌳',
  };
  return emojis[tier] || '🌱';
}
