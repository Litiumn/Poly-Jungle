'use client';

/**
 * Token Wallet - Display user's token balances and quick stats
 * 
 * Shows:
 * - $FOREST (governance token)
 * - $LEAF (utility token)
 * - Building Logs (crafting resource)
 * - Total earned rewards
 */

import { useState } from 'react';
import type { GameState } from '@/types/game';
import { formatTokenAmount, TOKEN_CONFIG } from '@/lib/tokenomics';

interface TokenWalletProps {
  gameState: GameState;
  compact?: boolean;
  onOpenStaking?: () => void;
}

export function TokenWallet({ gameState, compact = false, onOpenStaking }: TokenWalletProps): JSX.Element {
  const [expanded, setExpanded] = useState(!compact);

  if (compact && !expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4 shadow-lg cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">👛</div>
            <div>
              <div className="text-sm opacity-90">Wallet</div>
              <div className="font-bold">
                {formatTokenAmount(gameState.wallet.forestBalance)} {TOKEN_CONFIG.FOREST.emoji}
              </div>
            </div>
          </div>
          <div className="text-2xl">▶</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-6 shadow-xl border-2 border-indigo-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">👛 Token Wallet</h3>
          <p className="text-sm text-gray-600">Your digital asset balances</p>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* Wallet Address */}
      <div className="mb-6 bg-gray-100 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">Wallet Address</div>
        <div className="font-mono text-sm font-bold truncate">
          {gameState.wallet.address}
        </div>
        <div className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${
          gameState.wallet.connected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${gameState.wallet.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {gameState.wallet.connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Token Balances */}
      <div className="space-y-3 mb-6">
        {/* $FOREST Token */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{TOKEN_CONFIG.FOREST.emoji}</span>
              <div>
                <div className="font-bold text-lg">{TOKEN_CONFIG.FOREST.symbol}</div>
                <div className="text-xs text-gray-600">Governance Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {formatTokenAmount(gameState.wallet.forestBalance)}
              </div>
              <div className="text-xs text-gray-600">Balance</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            💡 Earn through staking & completing missions
          </div>
        </div>

        {/* $LEAF Token */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{TOKEN_CONFIG.LEAF.emoji}</span>
              <div>
                <div className="font-bold text-lg">{TOKEN_CONFIG.LEAF.symbol}</div>
                <div className="text-xs text-gray-600">Utility Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {formatTokenAmount(gameState.wallet.leafBalance)}
              </div>
              <div className="text-xs text-gray-600">Balance</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            💡 Used for marketplace, minting & game actions
          </div>
        </div>

        {/* Building Logs */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🪵</span>
              <div>
                <div className="font-bold text-lg">Building Logs</div>
                <div className="text-xs text-gray-600">Crafting Resource</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-700">
                {gameState.wallet.buildingLogs}
              </div>
              <div className="text-xs text-gray-600">Balance</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            💡 Obtained by cutting down mature trees
          </div>
        </div>
      </div>

      {/* Lifetime Rewards */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200 mb-4">
        <div className="text-sm font-bold text-gray-700 mb-3">📊 Lifetime Rewards Earned</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-600">Total $FOREST</div>
            <div className="text-lg font-bold text-green-600">
              {formatTokenAmount(gameState.totalRewardsEarned?.forest || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Total $LEAF</div>
            <div className="text-lg font-bold text-blue-600">
              {formatTokenAmount(gameState.totalRewardsEarned?.leaf || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {onOpenStaking && (
        <button
          onClick={onOpenStaking}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
        >
          🏦 Open Staking Vault
        </button>
      )}

      {/* Legacy EcoPoints Notice */}
      {gameState.ecoPoints > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-xs text-yellow-800">
            ⚠️ <strong>Legacy Balance:</strong> You have {gameState.ecoPoints} eco-points from the old system. 
            These will be automatically converted to $LEAF tokens.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Wallet Display - For HUD
 */
export function CompactWalletDisplay({ gameState }: { gameState: GameState }): JSX.Element {
  return (
    <div className="flex items-center gap-4">
      {/* $FOREST Balance */}
      <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
        <span className="text-xl">{TOKEN_CONFIG.FOREST.emoji}</span>
        <div>
          <div className="text-xs text-gray-600">$FOREST</div>
          <div className="font-bold text-green-700">{formatTokenAmount(gameState.wallet.forestBalance)}</div>
        </div>
      </div>

      {/* $LEAF Balance */}
      <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg">
        <span className="text-xl">{TOKEN_CONFIG.LEAF.emoji}</span>
        <div>
          <div className="text-xs text-gray-600">$LEAF</div>
          <div className="font-bold text-blue-700">{formatTokenAmount(gameState.wallet.leafBalance)}</div>
        </div>
      </div>

      {/* Building Logs */}
      <div className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-lg">
        <span className="text-xl">🪵</span>
        <div>
          <div className="text-xs text-gray-600">Logs</div>
          <div className="font-bold text-amber-700">{gameState.wallet.buildingLogs}</div>
        </div>
      </div>
    </div>
  );
}
