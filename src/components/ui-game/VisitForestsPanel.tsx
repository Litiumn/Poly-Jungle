'use client';

/**
 * VisitForestsPanel — Enhanced visit and rating system
 * 
 * Features:
 * - Browse friend forests
 * - Visit with scene preview
 * - Like/rate forests for eco-points
 * - Integrated with leaderboard scoring
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { GameStateData, SampleForest } from '@/lib/self-contained-storage';
import { loadSampleForests, saveSampleForests, saveGameState } from '@/lib/self-contained-storage';

interface FriendForest {
  id: string;
  name: string;
  ecoScore: number;
  trees: number;
  decorations: number;
  liked: boolean;
}

interface VisitForestsPanelProps {
  gameState: GameStateData;
  onClose: () => void;
  onVisit: (forestId: string) => void;
}

export function VisitForestsPanel({ gameState, onClose, onVisit }: VisitForestsPanelProps): JSX.Element {
  const [friendForests, setFriendForests] = useState<FriendForest[]>(loadFriendForests());
  const [selectedForest, setSelectedForest] = useState<FriendForest | null>(null);

  const handleLike = (forestId: string): void => {
    // Give +1 eco-point to the player
    gameState.ecoPoints += 1;
    saveGameState(gameState);

    // Mark forest as liked
    const updated = friendForests.map((f: FriendForest) =>
      f.id === forestId ? { ...f, liked: true } : f
    );
    setFriendForests(updated);
    saveFriendForests(updated);

    // Update leaderboard data
    updateLeaderboardData(forestId);
  };

  const handleVisitForest = (forest: FriendForest): void => {
    setSelectedForest(forest);
    onVisit(forest.id);
  };

  if (selectedForest) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl border-4 border-green-600">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-green-800">
              🌍 Visiting {selectedForest.name}
            </h2>
            <div className="flex gap-2">
              <Button onClick={() => setSelectedForest(null)} variant="outline">
                ← Back to List
              </Button>
              <Button onClick={onClose} variant="outline">
                Return to My Forest
              </Button>
            </div>
          </div>

          {/* Forest Stats */}
          <Card className="p-6 bg-white/80 mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Forest Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="text-sm text-gray-600">Eco Score</p>
                  <p className="text-2xl font-bold text-green-700">{selectedForest.ecoScore}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌳</span>
                <div>
                  <p className="text-sm text-gray-600">Trees</p>
                  <p className="text-2xl font-bold text-green-600">{selectedForest.trees}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                <div>
                  <p className="text-sm text-gray-600">Decorations</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedForest.decorations}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Rating Widget */}
          <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Rate This Forest</h3>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => handleLike(selectedForest.id)}
                disabled={selectedForest.liked}
                className={`w-full py-6 text-lg font-bold ${
                  selectedForest.liked
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                } text-white shadow-lg`}
              >
                {selectedForest.liked ? '❤️ Already Liked' : '👍 Like this Forest (+1 Eco-Point)'}
              </Button>
              {selectedForest.liked && (
                <p className="text-center text-sm text-green-600 font-semibold">
                  ✓ Thank you for supporting this forest!
                </p>
              )}
              <p className="text-center text-xs text-gray-600">
                Liking a forest gives you +1 eco-point and helps them climb the leaderboard!
              </p>
            </div>
          </Card>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl border-4 border-green-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-green-800">🌍 Visit Other Forests</h2>
            <p className="text-gray-600 mt-1">Explore and rate forests from around the world</p>
          </div>
          <Button onClick={onClose} variant="outline" className="font-bold">
            ✕ Close
          </Button>
        </div>

        {/* Friend Forests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friendForests.map((forest: FriendForest) => (
            <Card
              key={forest.id}
              className="p-5 hover:shadow-xl transition-all duration-300 bg-white hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-500"
              onClick={() => handleVisitForest(forest)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{forest.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Eco Score: {forest.ecoScore}</p>
                </div>
                <span className="text-3xl">🌲</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌳</span>
                  <span className="text-gray-700">{forest.trees} trees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <span className="text-gray-700">{forest.decorations} decorations</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisitForest(forest);
                  }}
                >
                  Visit Forest
                </Button>
                {forest.liked ? (
                  <Button disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">
                    ❤️ Liked
                  </Button>
                ) : (
                  <Button
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(forest.id);
                    }}
                  >
                    👍 Like
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {friendForests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No friend forests available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for new forests to explore!</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function loadFriendForests(): FriendForest[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem('ecoforest_friend_forests');
    if (!data) {
      // Initialize with mock data
      const mockData: FriendForest[] = [
        { id: 'forest_alice', name: "Ava's Grove", ecoScore: 120, trees: 12, decorations: 5, liked: false },
        { id: 'forest_bob', name: "Leo's Oasis", ecoScore: 95, trees: 9, decorations: 3, liked: false },
        { id: 'forest_charlie', name: "Mina's Woods", ecoScore: 180, trees: 15, decorations: 8, liked: false },
      ];
      saveFriendForests(mockData);
      return mockData;
    }

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load friend forests:', error);
    return [];
  }
}

function saveFriendForests(forests: FriendForest[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('ecoforest_friend_forests', JSON.stringify(forests));
  } catch (error) {
    console.error('Failed to save friend forests:', error);
  }
}

function updateLeaderboardData(forestId: string): void {
  // This function updates the leaderboard with the new like count
  // The leaderboard will now use the formula:
  // ecoScore = (treeCount * 3) + (decorations * 2) + (likesReceived * 5)
  
  try {
    const friendForests = loadFriendForests();
    const forest = friendForests.find((f: FriendForest) => f.id === forestId);
    
    if (forest && forest.liked) {
      // Increment the eco score by 5 (weight for likes in leaderboard)
      forest.ecoScore += 5;
      saveFriendForests(friendForests);
    }
  } catch (error) {
    console.error('Failed to update leaderboard data:', error);
  }
}
