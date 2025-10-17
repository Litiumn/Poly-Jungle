'use client';

/**
 * Pack Opening Animation Modal
 * 
 * Features:
 * - Wooden chest opening animation
 * - Light burst effect
 * - Display obtained furniture with rarity colors
 * - Sparkle effects for legendary items
 */

import { useState, useEffect } from 'react';
import { FURNITURE_RARITY_INFO, type FurnitureData } from '@/lib/furniture-system';

interface PackOpeningModalProps {
  packName: string;
  packEmoji: string;
  obtainedFurniture: FurnitureData[];
  onClose: () => void;
}

export function PackOpeningModal({
  packName,
  packEmoji,
  obtainedFurniture,
  onClose,
}: PackOpeningModalProps): JSX.Element {
  const [stage, setStage] = useState<'opening' | 'reveal'>('opening');

  useEffect(() => {
    // Auto-transition to reveal after opening animation
    const timer = setTimeout(() => {
      setStage('reveal');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full">
        {stage === 'opening' && (
          <div className="text-center animate-bounce">
            <div className="text-9xl mb-6 animate-pulse">{packEmoji}</div>
            <h2 className="text-4xl font-bold text-white mb-2">Opening {packName}...</h2>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping animation-delay-200" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping animation-delay-400" />
            </div>
          </div>
        )}

        {stage === 'reveal' && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl p-8 animate-fade-in">
            {/* Burst effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/50 via-orange-200/50 to-yellow-200/50 rounded-2xl animate-pulse pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">✨</div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Pack Opened!</h2>
                <p className="text-gray-600">You received {obtainedFurniture.length} furniture items!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {obtainedFurniture.map((furniture, index) => {
                  const rarityInfo = FURNITURE_RARITY_INFO[furniture.rarity];
                  const isLegendary = rarityInfo.tier >= 6;

                  return (
                    <div
                      key={furniture.id}
                      className={`bg-white rounded-xl p-4 shadow-lg border-2 ${
                        isLegendary ? 'border-yellow-400 animate-pulse' : 'border-gray-200'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideUp 0.5s ease-out',
                      }}
                    >
                      {/* Legendary sparkle effect */}
                      {isLegendary && (
                        <div className="absolute -top-2 -right-2 text-3xl animate-spin">✨</div>
                      )}

                      <div className="text-center">
                        <div className="text-5xl mb-2">{rarityInfo.emoji}</div>
                        <h3 className="font-bold text-gray-800 mb-1">{furniture.name}</h3>
                        <div
                          className="text-xs font-bold px-3 py-1 rounded-full inline-block"
                          style={{ backgroundColor: rarityInfo.color, color: '#fff' }}
                        >
                          {furniture.rarity}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">{furniture.category}</div>
                        {furniture.fromLimitedPack && (
                          <div className="mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full inline-block">
                            ⭐ LIMITED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:scale-105"
                >
                  🎉 Awesome!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
