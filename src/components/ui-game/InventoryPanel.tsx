'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GameState, TreeSpecies } from '@/types/game';

interface InventoryPanelProps {
  gameState: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export function InventoryPanel({ gameState, onClose }: InventoryPanelProps): JSX.Element {
  const seeds = [
    { id: 'oak_seed', name: 'Oak Seed', species: 'Oak' as TreeSpecies, cost: 20 },
    { id: 'pine_seed', name: 'Pine Seed', species: 'Pine' as TreeSpecies, cost: 20 },
    { id: 'cherry_seed', name: 'Cherry Seed', species: 'Cherry' as TreeSpecies, cost: 35 },
    { id: 'baobab_seed', name: 'Baobab Seed', species: 'Baobab' as TreeSpecies, cost: 60 },
    { id: 'mangrove_seed', name: 'Mangrove Seed', species: 'Mangrove' as TreeSpecies, cost: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🎒 Inventory</h2>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <Tabs defaultValue="seeds" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="seeds">Seeds</TabsTrigger>
            <TabsTrigger value="decorations">Decorations</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>

          <TabsContent value="seeds" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {seeds.map((seed) => {
                const count = gameState.inventory[seed.id] || 0;
                return (
                  <Card
                    key={seed.id}
                    className={`p-4 border-2 ${count > 0 ? 'border-green-500' : 'border-gray-200'}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌱</div>
                      <h3 className="font-bold text-lg text-gray-800">{seed.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Species: {seed.species}</p>
                      <p className="text-lg font-semibold text-green-600">
                        {count > 0 ? `${count} available` : 'None owned'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Cost: {seed.cost} eco-points</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="decorations" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Decorations are earned through missions and rewards.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {['bench', 'lantern', 'pond_tile', 'flower_patch'].map((deco) => {
                  const count = gameState.inventory[deco] || 0;
                  return (
                    <Card key={deco} className="p-4">
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {deco === 'bench' && '🪑'}
                          {deco === 'lantern' && '🏮'}
                          {deco === 'pond_tile' && '💧'}
                          {deco === 'flower_patch' && '🌸'}
                        </div>
                        <p className="text-sm font-semibold">{deco.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-600">{count} owned</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <div className="text-center py-12">
              {gameState.mintedNFTs.length === 0 ? (
                <div>
                  <p className="text-xl text-gray-600 mb-4">No NFTs minted yet</p>
                  <p className="text-sm text-gray-500">
                    Grow rare trees to Ancient stage to unlock minting!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.mintedNFTs.map((nft) => (
                    <Card key={nft.tokenId} className="p-4 border-2 border-purple-500">
                      <h3 className="font-bold text-lg mb-2">{nft.metadata.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{nft.metadata.description}</p>
                      <p className="text-xs text-gray-500">Token ID: {nft.tokenId.substring(0, 12)}...</p>
                      <p className="text-xs text-gray-500">Minted: {new Date(nft.mintedAt).toLocaleDateString()}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
