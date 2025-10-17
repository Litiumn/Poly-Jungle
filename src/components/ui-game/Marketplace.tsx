'use client';

/**
 * Marketplace - Buy and sell trees, auction rare trees
 * 
 * Features:
 * - Fixed Price tab for all trees
 * - Auction tab for rare trees only (Mythroot, Celestial Bough, Origin Tree)
 * - Trees must be minted before listing
 * - Building logs economy
 */

import { useState } from 'react';
import type { TreeData } from '@/lib/self-contained-storage';
import { SEED_TIER_INFO, type SeedTier } from '@/lib/seed-system';

interface MarketplaceListing {
  id: string;
  treeId: string;
  sellerName: string;
  tree: TreeData;
  price: number;
  listedAt: number;
}

interface AuctionListing {
  id: string;
  treeId: string;
  sellerName: string;
  tree: TreeData;
  startingBid: number;
  currentBid: number;
  highestBidder: string | null;
  endsAt: number;
  bids: Array<{ bidder: string; amount: number; timestamp: number }>;
}

interface FurnitureItem {
  id: string;
  name: string;
  rarity: string;
  category: string;
  price: number;
}

interface MarketplaceProps {
  ecoPoints: number;
  playerTrees: TreeData[];
  playerName: string;
  playerFurniture?: FurnitureItem[];
  onClose: () => void;
  onListTree: (treeId: string, price: number) => void;
  onStartAuction: (treeId: string, startingBid: number, duration: number) => void;
  onBuyTree: (listingId: string) => void;
  onPlaceBid: (auctionId: string, amount: number) => void;
  onBuyFurniture?: (furnitureId: string) => void;
}

const RARE_TIERS: SeedTier[] = ['Mythroot', 'Celestial Bough', 'Origin Tree'];

// Mock marketplace data
const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: 'listing_1',
    treeId: 'tree_mock_1',
    sellerName: 'Alice',
    tree: {
      id: 'tree_mock_1',
      species: 'Oak',
      position: { x: 0, y: 0, z: 0 },
      plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      lastWatered: Date.now() - 1000 * 60 * 60 * 2,
      growthStage: 'mature',
      wateringBonusPercent: 30,
      isMinted: true,
      mintedAt: Date.now() - 1000 * 60 * 60 * 24,
      tier: 'Wildwood',
    },
    price: 150,
    listedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'listing_2',
    treeId: 'tree_mock_2',
    sellerName: 'Bob',
    tree: {
      id: 'tree_mock_2',
      species: 'Cherry',
      position: { x: 0, y: 0, z: 0 },
      plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      lastWatered: Date.now() - 1000 * 60 * 60 * 1,
      growthStage: 'mature',
      wateringBonusPercent: 50,
      isMinted: true,
      mintedAt: Date.now() - 1000 * 60 * 60 * 12,
      tier: 'Sacred Canopy',
    },
    price: 300,
    listedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

const MOCK_AUCTIONS: AuctionListing[] = [
  {
    id: 'auction_1',
    treeId: 'tree_auction_1',
    sellerName: 'Charlie',
    tree: {
      id: 'tree_auction_1',
      species: 'Oak',
      position: { x: 0, y: 0, z: 0 },
      plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      lastWatered: Date.now() - 1000 * 60 * 60 * 3,
      growthStage: 'mature',
      wateringBonusPercent: 80,
      isMinted: true,
      mintedAt: Date.now() - 1000 * 60 * 60 * 48,
      tier: 'Mythroot',
    },
    startingBid: 500,
    currentBid: 750,
    highestBidder: 'Diana',
    endsAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    bids: [
      { bidder: 'Diana', amount: 750, timestamp: Date.now() - 1000 * 60 * 30 },
      { bidder: 'Eve', amount: 600, timestamp: Date.now() - 1000 * 60 * 60 },
    ],
  },
  {
    id: 'auction_2',
    treeId: 'tree_auction_2',
    sellerName: 'Frank',
    tree: {
      id: 'tree_auction_2',
      species: 'Baobab',
      position: { x: 0, y: 0, z: 0 },
      plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      lastWatered: Date.now() - 1000 * 60 * 60 * 5,
      growthStage: 'mature',
      wateringBonusPercent: 100,
      isMinted: true,
      mintedAt: Date.now() - 1000 * 60 * 60 * 96,
      tier: 'Celestial Bough',
    },
    startingBid: 1000,
    currentBid: 1000,
    highestBidder: null,
    endsAt: Date.now() + 1000 * 60 * 60 * 48, // 48 hours
    bids: [],
  },
];

export function Marketplace({
  ecoPoints,
  playerTrees,
  playerName,
  playerFurniture = [],
  onClose,
  onListTree,
  onStartAuction,
  onBuyTree,
  onPlaceBid,
  onBuyFurniture,
}: MarketplaceProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'market' | 'auction' | 'myTrees' | 'furniture'>('market');
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [listingPrice, setListingPrice] = useState<string>('');
  const [auctionStartBid, setAuctionStartBid] = useState<string>('');
  const [auctionDuration, setAuctionDuration] = useState<number>(24);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);

  const mintedTrees = playerTrees.filter(t => t.isMinted && t.growthStage === 'mature');
  const rareTrees = mintedTrees.filter(t => RARE_TIERS.includes(t.tier as SeedTier));

  const handleListForSale = () => {
    if (!selectedTree || !listingPrice) return;
    const price = parseInt(listingPrice);
    if (isNaN(price) || price <= 0) return;
    
    onListTree(selectedTree.id, price);
    setSelectedTree(null);
    setListingPrice('');
  };

  const handleStartAuction = () => {
    if (!selectedTree || !auctionStartBid) return;
    const startBid = parseInt(auctionStartBid);
    if (isNaN(startBid) || startBid <= 0) return;
    
    onStartAuction(selectedTree.id, startBid, auctionDuration);
    setSelectedTree(null);
    setAuctionStartBid('');
  };

  const handlePlaceBid = () => {
    if (!selectedAuction || !bidAmount) return;
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= selectedAuction.currentBid) return;
    
    onPlaceBid(selectedAuction.id, amount);
    setSelectedAuction(null);
    setBidAmount('');
  };

  const getTierInfo = (tier: string | undefined) => {
    if (!tier) return null;
    return SEED_TIER_INFO[tier as SeedTier];
  };

  const formatTimeLeft = (endsAt: number): string => {
    const msLeft = endsAt - Date.now();
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 24) {
      const daysLeft = Math.floor(hoursLeft / 24);
      return `${daysLeft}d ${hoursLeft % 24}h`;
    }
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">🏪 Marketplace</h2>
            <p className="text-sm opacity-90 mt-1">Trade trees, furniture, and rare items</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-sm opacity-90">Balance:</span>
              <span className="font-bold ml-2">{ecoPoints} 🍃</span>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-green-200 bg-white">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'market'
                ? 'bg-green-100 text-green-800 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            🛒 Market
          </button>
          <button
            onClick={() => setActiveTab('auction')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'auction'
                ? 'bg-green-100 text-green-800 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            🔨 Auctions
          </button>
          <button
            onClick={() => setActiveTab('myTrees')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'myTrees'
                ? 'bg-green-100 text-green-800 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            🌳 My Trees ({mintedTrees.length})
          </button>
          <button
            onClick={() => setActiveTab('furniture')}
            className={`flex-1 py-4 font-bold transition-colors ${
              activeTab === 'furniture'
                ? 'bg-green-100 text-green-800 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            🪑 Furniture Market
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Fixed Price Market Tab */}
          {activeTab === 'market' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_LISTINGS.map((listing) => {
                const tierInfo = getTierInfo(listing.tree.tier);
                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200 hover:border-green-400 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-lg font-bold flex items-center gap-2">
                          {tierInfo?.emoji} {listing.tree.species}
                        </div>
                        <div
                          className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block"
                          style={{ backgroundColor: tierInfo?.glowColor, color: '#fff' }}
                        >
                          {listing.tree.tier}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{listing.price} 🍃</div>
                        <div className="text-xs text-gray-500">Fixed Price</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div>Growth: <span className="font-bold">{listing.tree.growthStage}</span></div>
                      <div>Watering Bonus: <span className="font-bold">+{listing.tree.wateringBonusPercent}%</span></div>
                      <div>Seller: <span className="font-bold">{listing.sellerName}</span></div>
                    </div>

                    <button
                      onClick={() => onBuyTree(listing.id)}
                      disabled={ecoPoints < listing.price}
                      className={`w-full py-2 rounded-lg font-bold transition-colors ${
                        ecoPoints >= listing.price
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {ecoPoints >= listing.price ? '🛒 Buy Now' : '💰 Not Enough Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Auction Tab */}
          {activeTab === 'auction' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚡ <strong>Rare Tree Auctions:</strong> Only Mythroot, Celestial Bough, and Origin Tree can be auctioned!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_AUCTIONS.map((auction) => {
                  const tierInfo = getTierInfo(auction.tree.tier);
                  return (
                    <div
                      key={auction.id}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-purple-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xl font-bold flex items-center gap-2">
                            {tierInfo?.emoji} {auction.tree.species}
                          </div>
                          <div
                            className="text-xs font-bold px-2 py-1 rounded mt-2 inline-block"
                            style={{ backgroundColor: tierInfo?.glowColor, color: '#fff' }}
                          >
                            {auction.tree.tier} ✨
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Time Left</div>
                          <div className="text-lg font-bold text-purple-600">
                            {formatTimeLeft(auction.endsAt)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                        <div className="text-3xl font-bold text-purple-700">{auction.currentBid} 🍃</div>
                        {auction.highestBidder && (
                          <div className="text-xs text-gray-500 mt-1">
                            by <span className="font-bold">{auction.highestBidder}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <div>Growth: <span className="font-bold">{auction.tree.growthStage}</span></div>
                        <div>Watering Bonus: <span className="font-bold">+{auction.tree.wateringBonusPercent}%</span></div>
                        <div>Starting Bid: <span className="font-bold">{auction.startingBid} 🍃</span></div>
                        <div>Total Bids: <span className="font-bold">{auction.bids.length}</span></div>
                      </div>

                      <button
                        onClick={() => setSelectedAuction(auction)}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                      >
                        🔨 Place Bid
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bid Modal */}
              {selectedAuction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-2xl font-bold mb-4">Place Your Bid</h3>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">Current Bid</div>
                      <div className="text-3xl font-bold text-purple-600">{selectedAuction.currentBid} 🍃</div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2">Your Bid Amount</label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min: ${selectedAuction.currentBid + 50}`}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least {selectedAuction.currentBid + 50} eco-points
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedAuction(null);
                          setBidAmount('');
                        }}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePlaceBid}
                        disabled={
                          !bidAmount ||
                          parseInt(bidAmount) <= selectedAuction.currentBid ||
                          ecoPoints < parseInt(bidAmount)
                        }
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                          bidAmount && parseInt(bidAmount) > selectedAuction.currentBid && ecoPoints >= parseInt(bidAmount)
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Trees Tab */}
          {activeTab === 'myTrees' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Note:</strong> Only mature, minted trees can be listed for sale. Rare trees (Mythroot+) can be auctioned for potentially higher prices!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mintedTrees.map((tree) => {
                  const tierInfo = getTierInfo(tree.tier);
                  const isRare = RARE_TIERS.includes(tree.tier as SeedTier);
                  
                  return (
                    <div
                      key={tree.id}
                      className={`bg-white rounded-xl p-4 shadow-lg border-2 ${
                        isRare ? 'border-purple-300 bg-gradient-to-br from-white to-purple-50' : 'border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-lg font-bold flex items-center gap-2">
                            {tierInfo?.emoji} {tree.species}
                          </div>
                          <div
                            className="text-xs font-bold px-2 py-1 rounded mt-1 inline-block"
                            style={{ backgroundColor: tierInfo?.glowColor, color: '#fff' }}
                          >
                            {tree.tier} {isRare && '✨'}
                          </div>
                        </div>
                        {tree.isMinted && (
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                            🏅 MINTED
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>Growth: <span className="font-bold">{tree.growthStage}</span></div>
                        <div>Watering Bonus: <span className="font-bold">+{tree.wateringBonusPercent}%</span></div>
                        {tree.tier && (
                          <div>Value: <span className="font-bold text-green-600">{tierInfo?.ecoPointYield}× yield</span></div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedTree(tree)}
                          className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                          📝 List for Fixed Price
                        </button>
                        {isRare && (
                          <button
                            onClick={() => setSelectedTree(tree)}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                          >
                            🔨 Start Auction
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {mintedTrees.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🌱</div>
                    <p className="text-lg font-bold">No minted trees yet</p>
                    <p className="text-sm">Grow trees to maturity and mint them as NFTs first!</p>
                  </div>
                )}
              </div>

              {/* Listing Modal */}
              {selectedTree && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-2xl font-bold mb-4">
                      {RARE_TIERS.includes(selectedTree.tier as SeedTier) ? '🔨 Start Auction' : '📝 List for Sale'}
                    </h3>
                    
                    {RARE_TIERS.includes(selectedTree.tier as SeedTier) ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-bold mb-2">Starting Bid (Eco-Points)</label>
                          <input
                            type="number"
                            value={auctionStartBid}
                            onChange={(e) => setAuctionStartBid(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-bold mb-2">Auction Duration</label>
                          <select
                            value={auctionDuration}
                            onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
                          >
                            <option value={24}>24 Hours</option>
                            <option value={48}>48 Hours</option>
                            <option value={72}>72 Hours</option>
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedTree(null);
                              setAuctionStartBid('');
                            }}
                            className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleStartAuction}
                            disabled={!auctionStartBid || parseInt(auctionStartBid) <= 0}
                            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                              auctionStartBid && parseInt(auctionStartBid) > 0
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Start Auction
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-bold mb-2">Price (Eco-Points)</label>
                          <input
                            type="number"
                            value={listingPrice}
                            onChange={(e) => setListingPrice(e.target.value)}
                            placeholder="e.g. 150"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 outline-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedTree(null);
                              setListingPrice('');
                            }}
                            className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleListForSale}
                            disabled={!listingPrice || parseInt(listingPrice) <= 0}
                            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                              listingPrice && parseInt(listingPrice) > 0
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            List for Sale
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
