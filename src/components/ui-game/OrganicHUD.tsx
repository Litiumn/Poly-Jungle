'use client';

import { Button } from '@/components/ui/button';
import type { GameState } from '@/types/game';
import type { WeatherType } from '../forest/WeatherSystem';
import type { TimeOfDay } from '../forest/TimeOfDay';

interface OrganicHUDProps {
  gameState: GameState;
  onOpenPanel: (panel: string) => void;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  onWeatherChange: (weather: WeatherType) => void;
}

export function OrganicHUD({
  gameState,
  onOpenPanel,
  weather,
  timeOfDay,
  onWeatherChange,
}: OrganicHUDProps): JSX.Element {
  const forestHealth = Math.min(
    100,
    (gameState.stats.totalTreesPlanted * 5) + (gameState.stats.totalTrashCleaned * 2)
  );

  const getHealthColor = (): string => {
    if (forestHealth >= 75) return 'from-green-400 to-green-600';
    if (forestHealth >= 50) return 'from-yellow-400 to-yellow-600';
    if (forestHealth >= 25) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const timeIcons: Record<TimeOfDay, string> = {
    dawn: '🌅',
    morning: '☀️',
    afternoon: '🌤️',
    dusk: '🌇',
    night: '🌙',
  };

  const weatherIcons: Record<WeatherType, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    foggy: '🌫️',
  };

  const weatherCycle: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'foggy'];

  const cycleWeather = (): void => {
    const currentIndex = weatherCycle.indexOf(weather);
    const nextIndex = (currentIndex + 1) % weatherCycle.length;
    onWeatherChange(weatherCycle[nextIndex]);
  };

  return (
    <>
      {/* Top organic info bar */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none z-20">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          {/* Left: User stats */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            {/* Eco-Points */}
            <div
              className="bg-gradient-to-br from-green-100 to-green-200 px-6 py-3 rounded-full shadow-lg border-4 border-green-600 transform transition-transform hover:scale-105"
              style={{ boxShadow: '0 8px 25px rgba(34, 139, 34, 0.3)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-lg">🌿</span>
                <div>
                  <p className="text-xs font-semibold text-green-700">Eco-Points</p>
                  <p className="text-2xl font-bold text-green-900">{gameState.ecoPoints}</p>
                </div>
              </div>
            </div>

            {/* Streak & Trees */}
            <div className="flex gap-2">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 px-4 py-2 rounded-full shadow-md border-3 border-orange-500">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-bold text-orange-800">{gameState.streak.count}d</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-blue-200 px-4 py-2 rounded-full shadow-md border-3 border-blue-500">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌳</span>
                  <span className="text-sm font-bold text-blue-800">{gameState.trees.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Time & Weather */}
          <div className="flex flex-col gap-3 pointer-events-auto items-end">
            {/* Time of Day */}
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 px-5 py-2 rounded-full shadow-md border-3 border-sky-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{timeIcons[timeOfDay]}</span>
                <span className="text-sm font-bold text-sky-800 capitalize">{timeOfDay}</span>
              </div>
            </div>

            {/* Weather Control */}
            <button
              onClick={cycleWeather}
              className="bg-gradient-to-br from-purple-100 to-purple-200 px-5 py-2 rounded-full shadow-md border-3 border-purple-500 hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{weatherIcons[weather]}</span>
                <span className="text-sm font-bold text-purple-800 capitalize">{weather}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Forest Health Bar */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 px-6 py-3 rounded-full shadow-lg border-4 border-amber-600"
          style={{ boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)' }}
        >
          <p className="text-xs font-semibold text-amber-800 text-center mb-2">🌲 Forest Health 🌲</p>
          <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-amber-700">
            <div
              className={`h-full bg-gradient-to-r ${getHealthColor()} transition-all duration-1000`}
              style={{ width: `${forestHealth}%` }}
            />
          </div>
          <p className="text-center text-xs font-bold text-amber-900 mt-1">{forestHealth}%</p>
        </div>
      </div>

      {/* Organic action buttons - Right side */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-20">
        <Button
          onClick={() => onOpenPanel('inventory')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 shadow-xl transform transition-all duration-300 hover:scale-110 border-4 border-white"
          style={{ boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)' }}
        >
          <span className="text-3xl">🎒</span>
        </Button>

        <Button
          onClick={() => onOpenPanel('missions')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 shadow-xl transform transition-all duration-300 hover:scale-110 border-4 border-white"
          style={{ boxShadow: '0 8px 25px rgba(168, 85, 247, 0.5)' }}
        >
          <span className="text-3xl">🎯</span>
        </Button>

        <Button
          onClick={() => onOpenPanel('visit')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 shadow-xl transform transition-all duration-300 hover:scale-110 border-4 border-white"
          style={{ boxShadow: '0 8px 25px rgba(236, 72, 153, 0.5)' }}
        >
          <span className="text-3xl">🌍</span>
        </Button>

        <Button
          onClick={() => onOpenPanel('leaderboard')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 shadow-xl transform transition-all duration-300 hover:scale-110 border-4 border-white"
          style={{ boxShadow: '0 8px 25px rgba(234, 179, 8, 0.5)' }}
        >
          <span className="text-3xl">🏆</span>
        </Button>
      </div>

      {/* User badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-20">
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 px-6 py-2 rounded-full shadow-md border-3 border-indigo-500">
          <span className="text-sm font-bold text-indigo-800">👤 {gameState.username}</span>
        </div>
      </div>
    </>
  );
}
