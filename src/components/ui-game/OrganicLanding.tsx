'use client';

import { useState } from 'react';
import { mockAPI } from '@/lib/self-contained-storage';

interface OrganicLandingProps {
  onEnter: () => void;
}

export function OrganicLanding({ onEnter }: OrganicLandingProps): JSX.Element {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  const wallet = mockAPI.walletConnect();
  
  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-200 via-green-300 to-green-400 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce">🌳</div>
        <div className="absolute top-20 right-20 text-5xl animate-pulse">🌸</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>🌿</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌲</div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <h1 className="text-7xl font-bold text-green-900 mb-4 drop-shadow-lg">
          🌍 EcoForest Base
        </h1>
        <p className="text-2xl text-green-800 mb-8 drop-shadow">
          Plant, grow, and nurture your living forest
        </p>
        
        {/* Wooden Sign Frame */}
        <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl p-8 mb-8 shadow-2xl border-4 border-amber-950 max-w-md mx-auto">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 border-2 border-amber-900">
            <div className="text-amber-900 space-y-3">
              <div className="text-lg font-bold mb-4">🌱 Features</div>
              <div className="text-left text-sm space-y-2">
                <div>• Plant 5 unique tree species</div>
                <div>• Watch trees grow in real-time</div>
                <div>• Earn eco-points through actions</div>
                <div>• Clean trash & water trees</div>
                <div>• Dynamic weather & lighting</div>
                <div>• Visit friend forests (mocked)</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wallet Display (Mock) */}
        <div className="bg-green-900 text-green-100 px-6 py-3 rounded-full mb-6 inline-block shadow-lg">
          <div className="flex items-center gap-2">
            <span>🔗</span>
            <span className="font-mono text-sm">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</span>
            <span className="text-xs bg-green-700 px-2 py-1 rounded">Connected</span>
          </div>
        </div>
        
        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="bg-gradient-to-br from-green-600 to-green-800 text-white px-12 py-5 rounded-full text-2xl font-bold shadow-2xl hover:scale-110 transition-all mb-4 animate-pulse"
        >
          🌳 Enter Your Forest
        </button>
        
        {/* Help Button */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="block mx-auto text-green-800 hover:text-green-900 underline"
        >
          {showHelp ? '▲ Hide Help' : '▼ How to Play'}
        </button>
      </div>
      
      {/* Help Panel */}
      {showHelp && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-900 text-amber-100 rounded-xl p-6 shadow-2xl max-w-2xl border-4 border-amber-950 z-20">
          <h3 className="text-xl font-bold mb-3 text-amber-200">📖 How to Plant & Play</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Method 1:</strong> Click the big green "PLANT" button at bottom-center → Select a seed → Confirm</div>
            <div><strong>Method 2:</strong> Click directly on empty terrain → Select a seed from the menu</div>
            <div className="mt-3"><strong>Growing:</strong> Trees grow automatically based on real time. Water them daily for +10% growth bonus!</div>
            <div><strong>Earning:</strong> Clean trash (+5 eco-points), water trees (+2 eco-points), or complete missions</div>
            <div><strong>Weather:</strong> Click the weather icon (top-right) to cycle through sunny, cloudy, and rain</div>
            <div><strong>Debug:</strong> Click "Debug" button (bottom-left) to add eco-points or spawn trash for testing</div>
          </div>
          <div className="mt-4 text-xs text-amber-300">
            💾 Your progress is saved automatically to localStorage. All Web3 features are mocked (no real blockchain calls).
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="absolute bottom-4 text-green-800 text-sm">
        Self-contained prototype • No external dependencies • Built for Base Mini Apps
      </div>
    </div>
  );
}
