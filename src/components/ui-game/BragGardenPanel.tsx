'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BragGarden } from '@/types/social';

interface BragGardenPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userGarden?: BragGarden;
  featuredGardens: BragGarden[];
  onCreateGarden: (theme: BragGarden['theme']) => void;
  onLikeGarden: (gardenId: string) => void;
  onVisitGarden: (gardenId: string) => void;
}

export function BragGardenPanel({
  isOpen,
  onClose,
  userGarden,
  featuredGardens,
  onCreateGarden,
  onLikeGarden,
  onVisitGarden,
}: BragGardenPanelProps) {
  const [selectedTheme, setSelectedTheme] = useState<BragGarden['theme']>('natural');

  if (!isOpen) return null;

  const themes: Array<{ value: BragGarden['theme']; label: string; emoji: string; description: string }> = [
    { value: 'natural', label: 'Natural', emoji: '🌿', description: 'Lush and organic' },
    { value: 'mystical', label: 'Mystical', emoji: '✨', description: 'Magical and ethereal' },
    { value: 'ancient', label: 'Ancient', emoji: '🏛️', description: 'Timeless and wise' },
    { value: 'celestial', label: 'Celestial', emoji: '🌟', description: 'Heavenly and divine' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-50 to-teal-50 border-4 border-emerald-600 shadow-2xl m-4">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 z-10 text-2xl hover:bg-emerald-200 rounded-full w-10 h-10"
        >
          ✕
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>🏡</span>
            <span>Brag Gardens</span>
          </h2>
          <p className="text-emerald-100 mt-1">
            Showcase your favorite trees in a beautiful garden display
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Your Garden Section */}
          {!userGarden ? (
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-300">
              <h3 className="text-xl font-bold mb-4 text-emerald-800">
                Create Your Brag Garden 🌱
              </h3>
              <p className="text-gray-600 mb-4">
                Display your most prized trees for visitors to admire!
              </p>

              {/* Theme Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.value
                        ? 'border-emerald-600 bg-emerald-50 scale-105'
                        : 'border-gray-300 bg-white hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-3xl mb-1">{theme.emoji}</div>
                    <div className="font-semibold text-gray-800">{theme.label}</div>
                    <div className="text-xs text-gray-600">{theme.description}</div>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => onCreateGarden(selectedTheme)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700"
              >
                Create Garden
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-800">
                    Your Garden: {themes.find((t) => t.value === userGarden.theme)?.emoji} {themes.find((t) => t.value === userGarden.theme)?.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {userGarden.displayTrees.length} / 5 trees displayed
                  </p>
                </div>
                {userGarden.featured && (
                  <Badge className="bg-yellow-500 text-white">⭐ Featured</Badge>
                )}
              </div>

              <div className="flex gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{userGarden.visitors} visitors</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>❤️</span>
                  <span>{userGarden.likes} likes</span>
                </div>
              </div>

              <Button
                onClick={() => onVisitGarden(userGarden.id)}
                className="mt-4 w-full bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Edit Garden
              </Button>
            </div>
          )}

          {/* Featured Gardens */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>⭐</span>
              <span>Featured Gardens</span>
            </h3>

            {featuredGardens.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                No featured gardens yet. Be the first!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredGardens.map((garden) => {
                  const theme = themes.find((t) => t.value === garden.theme);
                  return (
                    <Card
                      key={garden.id}
                      className="p-4 border-2 border-gray-300 hover:border-emerald-400 transition-all cursor-pointer"
                      onClick={() => onVisitGarden(garden.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {garden.username}'s Garden
                          </div>
                          <div className="text-sm text-gray-600">
                            {theme?.emoji} {theme?.label} Theme
                          </div>
                        </div>
                        <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                      </div>

                      <div className="text-sm text-gray-700 mb-3">
                        {garden.displayTrees.length} trees on display
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>👥 {garden.visitors}</span>
                          <span>❤️ {garden.likes}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLikeGarden(garden.id);
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          ❤️ Like
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
            <h4 className="font-semibold text-emerald-800 mb-2">💡 Tips for a Great Garden</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Select up to 5 of your most beautiful trees</li>
              <li>• Mix different species and rarities for visual appeal</li>
              <li>• Add decorations to enhance your theme</li>
              <li>• Gardens with high engagement get featured!</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
