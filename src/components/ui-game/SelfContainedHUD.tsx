'use client';

import type { GameStateData, Weather } from '@/lib/self-contained-storage';
import { mockAPI } from '@/lib/self-contained-storage';

interface SelfContainedHUDProps {
  gameState: GameStateData;
  weather: Weather;
  onToggleWeather: () => void;
  onOpenPlantMenu: () => void;
  onToggleDebug: () => void;
  onOpenMissions: () => void;
  onOpenTreeInventory: () => void;
  onOpenLeaderboard: () => void;
  onOpenVisitForests: () => void;
  onOpenSeedMarket: () => void;
  onOpenSeedInventory: () => void;
  onOpenMarketplace: () => void;
  onOpenBuildingLogs: () => void;
  onOpenWorkshop: () => void;
}

export function SelfContainedHUD({
  gameState,
  weather,
  onToggleWeather,
  onOpenPlantMenu,
  onToggleDebug,
  onOpenMissions,
  onOpenTreeInventory,
  onOpenLeaderboard,
  onOpenVisitForests,
  onOpenSeedMarket,
  onOpenSeedInventory,
  onOpenMarketplace,
  onOpenBuildingLogs,
  onOpenWorkshop,
}: SelfContainedHUDProps): JSX.Element {
  const ecoScore = mockAPI.calculateEcoScore(gameState);
  
  return (
    <>
      {/* Top Bar - Eco Points & Stats */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Eco Points */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-2xl">🍃</span>
          <span className="font-bold text-lg">{gameState.ecoPoints}</span>
          <span className="text-sm opacity-80">Eco-Points</span>
        </div>
        
        {/* Trees Count */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="font-bold text-lg">{gameState.trees.length}</span>
          <span className="text-sm opacity-80">Trees</span>
        </div>
        
        {/* Eco Score */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="font-bold text-lg">{ecoScore}</span>
          <span className="text-sm opacity-80">Score</span>
        </div>
        
        {/* Building Logs */}
        <button
          onClick={onOpenBuildingLogs}
          className="bg-gradient-to-br from-amber-600 to-orange-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
          title="Building Logs"
        >
          <span className="text-2xl">🪵</span>
          <span className="font-bold text-lg">{gameState.buildingLogs}</span>
          <span className="text-sm opacity-80">Logs</span>
        </button>
      </div>
      
      {/* Weather Toggle - Top Right */}
      <button
        onClick={onToggleWeather}
        className="absolute top-4 right-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
        title="Toggle Weather"
      >
        <span className="text-2xl">
          {weather === 'sunny' && '☀️'}
          {weather === 'cloudy' && '☁️'}
          {weather === 'rain' && '🌧️'}
        </span>
      </button>
      
      {/* Action Buttons - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Seed Market Button */}
        <button
          onClick={onOpenSeedMarket}
          className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Seed Market"
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl">📦</span>
            <span className="font-bold">MARKET</span>
          </div>
        </button>
        
        {/* Plant Button (Seed Inventory) */}
        <button
          onClick={onOpenSeedInventory}
          className="bg-gradient-to-br from-green-500 to-green-700 text-white px-8 py-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-pulse"
          title="Plant from Inventory"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <span className="font-bold text-xl">PLANT</span>
            {gameState.seedPackState && gameState.seedPackState.ownedSeeds.filter(s => !s.planted).length > 0 && (
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                {gameState.seedPackState.ownedSeeds.filter(s => !s.planted).length}
              </span>
            )}
          </div>
        </button>
        
        {/* Tree Inventory Button */}
        <button
          onClick={onOpenTreeInventory}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Tree Inventory"
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌳</span>
            <span className="font-bold">TREES</span>
          </div>
        </button>
      </div>
      
      {/* Right Side Buttons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
        {/* Missions Button */}
        <button
          onClick={onOpenMissions}
          className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all relative"
          title="Missions"
        >
          <span className="text-3xl">📜</span>
          {Array.isArray(gameState.missions) && gameState.missions.some(m => m.completed && !m.claimed) && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              !
            </div>
          )}
        </button>
        
        {/* Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Leaderboard"
        >
          <span className="text-3xl">🏆</span>
        </button>
        
        {/* Visit Forests Button */}
        <button
          onClick={onOpenVisitForests}
          className="bg-gradient-to-br from-pink-500 to-pink-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Visit Forests"
        >
          <span className="text-3xl">🌍</span>
        </button>
        
        {/* Marketplace Button */}
        <button
          onClick={onOpenMarketplace}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Marketplace"
        >
          <span className="text-3xl">🏪</span>
        </button>
        
        {/* Workshop Button */}
        <button
          onClick={onOpenWorkshop}
          className="bg-gradient-to-br from-orange-500 to-amber-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Workshop"
        >
          <span className="text-3xl">🏗️</span>
        </button>
      </div>
      
      {/* Debug Toggle - Bottom Left */}
      <button
        onClick={onToggleDebug}
        className="absolute bottom-4 left-4 bg-gradient-to-br from-gray-700 to-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform z-10 text-sm"
        title="Debug Controls"
      >
        🔧 Debug
      </button>
      
      {/* Help Text - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg text-sm max-w-xs z-10">
        <div className="font-bold mb-1">How to Play:</div>
        <div className="text-xs space-y-1 opacity-90">
          <div>• Click terrain to plant trees</div>
          <div>• Click trees to water them (+10% growth)</div>
          <div>• Click red trash to clean (+5 eco-points)</div>
          <div>• Trees grow in real-time</div>
        </div>
      </div>
      
      {/* Wallet Display - Top Left */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-xs z-10">
        <div className="font-bold">🔗 Wallet (Mock)</div>
        <div className="opacity-80 font-mono">{gameState.walletAddress.slice(0, 10)}...</div>
      </div>
    </>
  );
}
