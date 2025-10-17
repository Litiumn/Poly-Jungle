'use client';

import { Button } from '@/components/ui/button';

interface LandingScreenProps {
  onStart: () => void;
}

export function LandingScreen({ onStart }: LandingScreenProps): JSX.Element {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 via-green-50 to-green-100 p-8">
      <div className="text-center mb-12 pt-16">
        <h1 className="text-7xl font-bold text-green-800 mb-4">🌳 EcoForest Base 🌳</h1>
        <p className="text-2xl text-gray-700 mb-2">
          Plant. Grow. Thrive.
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build your own living forest on Base. Plant trees, earn eco-points, complete missions,
          and compete on the leaderboards. All Web3 features are mocked for seamless gameplay.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, Forest Guardian!</h2>
        <div className="space-y-3 text-gray-700 mb-6">
          <p>✨ Start with 50 eco-points</p>
          <p>🌱 Plant your first trees</p>
          <p>💧 Water them to boost growth</p>
          <p>🧹 Clean up trash for rewards</p>
          <p>🏆 Climb the leaderboards</p>
          <p>🌍 Visit and rate other forests</p>
        </div>

        <Button
          onClick={onStart}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-6"
        >
          Enter Your Forest
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 max-w-lg">
        <p className="mb-2">
          🌐 Built for Base Mini Apps • All blockchain features are locally mocked
        </p>
        <p>
          No external network calls • Data stored in localStorage
        </p>
      </div>
    </div>
  );
}
