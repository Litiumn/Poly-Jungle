'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ShowcaseEntry } from '@/types/social';

interface SeasonalShowcasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  showcaseEntries: ShowcaseEntry[];
  currentSeason: string;
  onSubmitTree: (treeId: string) => void;
  onLikeEntry: (entryId: string) => void;
  userTrees: Array<{ id: string; species: string; rarityTier: string }>;
}

export function SeasonalShowcasePanel({
  isOpen,
  onClose,
  showcaseEntries,
  currentSeason,
  onSubmitTree,
  onLikeEntry,
  userTrees,
}: SeasonalShowcasePanelProps) {
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  if (!isOpen) return null;

  const sortedEntries = [...showcaseEntries].sort((a, b) => b.likes - a.likes);
  const topCollectors = sortedEntries.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-600 shadow-2xl m-4">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 z-10 text-2xl hover:bg-purple-200 rounded-full w-10 h-10"
        >
          ✕
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>🏆</span>
            <span>Seasonal Showcase</span>
          </h2>
          <p className="text-purple-100 mt-1">
            {currentSeason} — Celebrate rare and beautiful tree collections
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Submit Your Tree */}
          <div className="bg-white rounded-xl p-6 border-2 border-purple-300">
            {!showSubmitForm ? (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-purple-800">
                  ✨ Submit Your Best Tree
                </h3>
                <p className="text-gray-600 mb-4">
                  Show off your rarest species and earn recognition!
                </p>
                <Button
                  onClick={() => setShowSubmitForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  Submit Tree
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4 text-purple-800">
                  Choose a Tree to Submit
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4 max-h-60 overflow-y-auto">
                  {userTrees.map((tree) => (
                    <button
                      key={tree.id}
                      onClick={() => setSelectedTreeId(tree.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTreeId === tree.id
                          ? 'border-purple-600 bg-purple-50 scale-105'
                          : 'border-gray-300 bg-white hover:border-purple-400'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{tree.species}</div>
                      <Badge className="mt-1 text-xs">{tree.rarityTier}</Badge>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSubmitForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedTreeId) {
                        onSubmitTree(selectedTreeId);
                        setShowSubmitForm(false);
                        setSelectedTreeId('');
                      }
                    }}
                    disabled={!selectedTreeId}
                    className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Top Collectors */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>👑</span>
              <span>Top Collectors This Season</span>
            </h3>

            {topCollectors.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                No submissions yet. Be the first to showcase!
              </div>
            ) : (
              <div className="space-y-3">
                {topCollectors.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`p-4 border-2 transition-all ${
                      index === 0
                        ? 'border-yellow-500 bg-yellow-50'
                        : index === 1
                        ? 'border-gray-400 bg-gray-50'
                        : index === 2
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {entry.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.species} • {entry.rarityTier}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-rose-600">
                            ❤️ {entry.likes}
                          </div>
                          <div className="text-xs text-gray-600">likes</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onLikeEntry(entry.id)}
                          className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Like
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Season Info */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-300">
            <h4 className="font-semibold text-purple-800 mb-2">🌟 About Seasonal Showcase</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Submit your rarest trees each season</li>
              <li>• Top collectors get exclusive badges and rewards</li>
              <li>• Earn bragging rights and community recognition</li>
              <li>• Season resets every 3 months with new themes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
