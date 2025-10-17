'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { GameState } from '@/types/game';
import { visitForest, rateForest, giveHeart, calculateEcoScore } from '@/lib/mock_api';
import { loadSampleForests } from '@/lib/storage';

interface VisitFlowProps {
  gameState: GameState;
  onClose: () => void;
}

export function VisitFlow({ gameState, onClose }: VisitFlowProps): JSX.Element {
  const [selectedForest, setSelectedForest] = useState<GameState | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [hasGivenHeart, setHasGivenHeart] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const sampleForests = loadSampleForests();

  const handleVisit = (forestId: string): void => {
    const forest = visitForest(forestId);
    if (forest) {
      setSelectedForest(forest);
      setRating(0);
      setHasRated(false);
      setHasGivenHeart(false);
      setIsLiking(false);
    }
  };

  const handleRate = (stars: number): void => {
    if (selectedForest && !hasRated) {
      const success = rateForest(gameState.userId, selectedForest.userId, stars);
      if (success) {
        setRating(stars);
        setHasRated(true);
      }
    }
  };

  const handleGiveHeart = (): void => {
    if (selectedForest && !hasGivenHeart && !isLiking) {
      setIsLiking(true);
      const success = giveHeart(gameState, selectedForest.userId);
      if (success) {
        setHasGivenHeart(true);
      }
      // Debounce: re-enable after 500ms
      setTimeout(() => setIsLiking(false), 500);
    }
  };

  if (selectedForest) {
    const ecoScore = calculateEcoScore(selectedForest);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">🌍 Visiting {selectedForest.username}&apos;s Forest</h2>
            <div className="flex gap-2">
              <Button onClick={() => setSelectedForest(null)} variant="outline">
                Back to List
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4 bg-green-50">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Forest Stats</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Eco Score:</span>
                  <span className="font-semibold">{ecoScore}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Trees:</span>
                  <span className="font-semibold">{selectedForest.trees.length}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Ancient Trees:</span>
                  <span className="font-semibold">
                    {selectedForest.trees.filter((t) => t.growthStage === 'ancient').length}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Decorations:</span>
                  <span className="font-semibold">{selectedForest.decorations.length}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Streak:</span>
                  <span className="font-semibold">{selectedForest.streak.count} days</span>
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-purple-50">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Rate This Forest</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    disabled={hasRated}
                    className={`text-3xl transition-all ${
                      star <= rating ? 'scale-125' : 'scale-100 opacity-50'
                    } ${hasRated ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {hasRated && (
                <p className="text-sm text-green-600 mb-3">✓ Thanks for rating!</p>
              )}

              <Button
                onClick={handleGiveHeart}
                disabled={hasGivenHeart || isLiking}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasGivenHeart ? '❤️ Heart Given' : isLiking ? '⏳ Giving...' : '🤍 Give Heart'}
              </Button>
            </Card>
          </div>

          <Card className="p-4 bg-blue-50">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Tree Species in This Forest</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(selectedForest.trees.map((t) => t.species))).map((species) => (
                <span key={species} className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700">
                  🌳 {species}
                </span>
              ))}
            </div>
          </Card>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🌍 Visit Other Forests</h2>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleForests.map((forest: GameState) => (
            <Card key={forest.userId} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{forest.username}</h3>
                  <p className="text-sm text-gray-600">Eco Score: {calculateEcoScore(forest)}</p>
                </div>
                <span className="text-2xl">🌳</span>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>🌲 {forest.trees.length} trees</p>
                <p>🎨 {forest.decorations.length} decorations</p>
                <p>🏆 {forest.badges.length} badges</p>
                <p>👥 {forest.visitCount || 0} visits</p>
              </div>

              <Button
                onClick={() => handleVisit(forest.userId)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Visit Forest
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
