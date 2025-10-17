'use client';

/**
 * Tokenomics Panel - Educational overview of the EcoForest token economy
 * 
 * Explains:
 * - Three-token system ($FOREST, $LEAF, Building Logs)
 * - How to earn tokens
 * - Staking mechanics
 * - NFT minting costs
 * - Marketplace fees
 * - Burn mechanics
 */

import {
  TOKEN_CONFIG,
  TOKEN_DISTRIBUTION,
  STAKING_TIERS,
  NFT_MINTING_COSTS,
  MARKETPLACE_FEES,
  type StakingLockPeriod,
} from '@/lib/tokenomics';

interface TokenomicsPanelProps {
  onClose: () => void;
  onOpenStaking?: () => void;
}

export function TokenomicsPanel({ onClose, onOpenStaking }: TokenomicsPanelProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 EcoForest Tokenomics</h2>
              <p className="text-sm opacity-90">Understanding the three-token economy</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Token Overview */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🪙</span> Three-Token System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* $FOREST */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border-2 border-green-300">
                <div className="text-4xl mb-2">{TOKEN_CONFIG.FOREST.emoji}</div>
                <div className="font-bold text-xl mb-1">{TOKEN_CONFIG.FOREST.symbol}</div>
                <div className="text-sm text-gray-700 mb-3">Governance Token</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>✓ Earned through staking trees</li>
                  <li>✓ Mission rewards</li>
                  <li>✓ Achievement bonuses</li>
                  <li>✓ Daily login streaks</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-green-300 text-xs">
                  <strong>Total Supply:</strong> {(TOKEN_CONFIG.FOREST.totalSupply / 1_000_000_000).toFixed(1)}B
                </div>
              </div>

              {/* $LEAF */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-5 border-2 border-blue-300">
                <div className="text-4xl mb-2">{TOKEN_CONFIG.LEAF.emoji}</div>
                <div className="font-bold text-xl mb-1">{TOKEN_CONFIG.LEAF.symbol}</div>
                <div className="text-sm text-gray-700 mb-3">Utility Token</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>✓ Marketplace currency</li>
                  <li>✓ NFT minting fees</li>
                  <li>✓ In-game purchases</li>
                  <li>✓ Staking rewards</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-300 text-xs">
                  <strong>Total Supply:</strong> {(TOKEN_CONFIG.LEAF.totalSupply / 1_000_000_000).toFixed(1)}B
                </div>
              </div>

              {/* Building Logs */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-5 border-2 border-amber-300">
                <div className="text-4xl mb-2">🪵</div>
                <div className="font-bold text-xl mb-1">Building Logs</div>
                <div className="text-sm text-gray-700 mb-3">Crafting Resource</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>✓ Cut down mature trees</li>
                  <li>✓ Craft furniture items</li>
                  <li>✓ Build structures</li>
                  <li>✓ Trade in marketplace</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-amber-300 text-xs">
                  <strong>Obtained by:</strong> Chopping trees
                </div>
              </div>
            </div>
          </section>

          {/* Token Distribution */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📈</span> Token Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* $FOREST Distribution */}
              <div className="bg-white rounded-xl p-5 border-2 border-green-200">
                <div className="font-bold text-lg mb-3 flex items-center gap-2">
                  {TOKEN_CONFIG.FOREST.emoji} $FOREST Allocation
                </div>
                <div className="space-y-2">
                  {Object.entries(TOKEN_DISTRIBUTION.FOREST).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm w-12 text-right">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* $LEAF Distribution */}
              <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                <div className="font-bold text-lg mb-3 flex items-center gap-2">
                  {TOKEN_CONFIG.LEAF.emoji} $LEAF Allocation
                </div>
                <div className="space-y-2">
                  {Object.entries(TOKEN_DISTRIBUTION.LEAF).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm w-12 text-right">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Staking Mechanics */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🏦</span> Staking Rewards
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 mb-4">
              <p className="text-sm text-gray-700 mb-4">
                Stake your mature trees to earn passive $FOREST and $LEAF rewards. Higher rarity trees and longer lock periods yield better APY rates!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(STAKING_TIERS) as StakingLockPeriod[]).map((period) => {
                  const tier = STAKING_TIERS[period];
                  return (
                    <div key={period} className="bg-white rounded-lg p-3 text-center border border-purple-200">
                      <div className="text-2xl mb-1">{tier.emoji}</div>
                      <div className="font-bold text-sm mb-1">{tier.label}</div>
                      <div className="text-xs text-gray-600 mb-2">
                        {tier.lockDays === 0 ? 'No lock' : `${tier.lockDays} days`}
                      </div>
                      <div className="text-lg font-bold text-purple-600">{tier.baseAPY}% APY</div>
                      {tier.earlyUnstakePenalty > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          -{tier.earlyUnstakePenalty}% penalty
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {onOpenStaking && (
                <button
                  onClick={onOpenStaking}
                  className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  🏦 Start Staking Now
                </button>
              )}
            </div>
          </section>

          {/* NFT Minting Costs */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span> NFT Minting Costs
            </h3>
            <div className="bg-white rounded-xl p-5 border-2 border-indigo-200">
              <p className="text-sm text-gray-700 mb-4">
                Mint your mature trees as NFTs to trade on the marketplace. Rarer trees require more tokens to mint.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(NFT_MINTING_COSTS).map(([tier, cost]) => (
                  <div key={tier} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <span className="font-bold text-sm">{tier}</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Minting Cost</div>
                      <div className="font-bold text-sm">
                        {cost.leaf} 🍃 {cost.forest > 0 && `+ ${cost.forest} 🌲`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Marketplace Fees */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🏪</span> Marketplace Economics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="text-sm text-gray-600 mb-1">Listing Fee</div>
                <div className="text-2xl font-bold text-green-600">{MARKETPLACE_FEES.listingFee}%</div>
                <div className="text-xs text-gray-500 mt-2">Paid when listing an item</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Platform Fee</div>
                <div className="text-2xl font-bold text-blue-600">{MARKETPLACE_FEES.platformFee}%</div>
                <div className="text-xs text-gray-500 mt-2">Deducted from sale price</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Creator Royalty</div>
                <div className="text-2xl font-bold text-purple-600">{MARKETPLACE_FEES.creatorRoyalty}%</div>
                <div className="text-xs text-gray-500 mt-2">Goes to original minter</div>
              </div>
            </div>
          </section>

          {/* How to Earn */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>💰</span> How to Earn Tokens
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                <div className="font-bold text-lg mb-3 flex items-center gap-2">
                  🌲 Earn $FOREST
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Stake trees (5-50% APY based on lock period)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Complete missions (+1-10 tokens)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Daily login streaks (+0.2 tokens)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Achievement badges (various amounts)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                <div className="font-bold text-lg mb-3 flex items-center gap-2">
                  🍃 Earn $LEAF
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Plant trees (+10 tokens)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Water trees (+5 tokens)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Clean trash (+8 tokens)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Stake trees (passive income)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Sell items on marketplace</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Deflationary Mechanics */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🔥</span> Burn Mechanics (Deflationary)
            </h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
              <p className="text-sm text-gray-700 mb-4">
                Certain actions burn tokens permanently, reducing supply and increasing scarcity over time.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">🔥</span>
                  <span><strong>Marketplace sales:</strong> 1% of transaction burned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">🔥</span>
                  <span><strong>Name changes:</strong> 5% fee burned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">🔥</span>
                  <span><strong>Failed transactions:</strong> 0.5% burned</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
