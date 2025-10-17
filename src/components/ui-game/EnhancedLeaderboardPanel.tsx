'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EnhancedLeaderboardEntry, LeaderboardTab, RankTier } from '@/lib/leaderboard-system';
import {
  getLeaderboard,
  getTierColor,
  getTierBadge,
  getTierEmblem,
  getTierName,
  getCurrentSeason,
  getSeasonTimeRemaining,
  searchLeaderboard,
  filterByTier,
  claimReward,
} from '@/lib/leaderboard-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface EnhancedLeaderboardPanelProps {
  currentUser: string;
  onClose: () => void;
}

export function EnhancedLeaderboardPanel({
  currentUser,
  onClose,
}: EnhancedLeaderboardPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<RankTier | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'myTier' | 'top100'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [leaderboardData, setLeaderboardData] = useState<Record<LeaderboardTab, EnhancedLeaderboardEntry[]>>({
    global: [],
    friends: [],
    stake: [],
  });
  const [selectedEntry, setSelectedEntry] = useState<EnhancedLeaderboardEntry | null>(null);
  
  const ENTRIES_PER_PAGE = 50;

  // Load leaderboard data
  useEffect(() => {
    const loadData = (): void => {
      setLeaderboardData({
        global: getLeaderboard('global'),
        friends: getLeaderboard('friends'),
        stake: getLeaderboard('stake'),
      });
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  // Find current user entry
  const currentUserEntry = useMemo(() => {
    const entries = Array.isArray(leaderboardData[activeTab]) ? leaderboardData[activeTab] : [];
    return entries.find(entry => entry?.username === currentUser);
  }, [leaderboardData, activeTab, currentUser]);
  
  // Filter and search
  const filteredEntries = useMemo(() => {
    let entries = Array.isArray(leaderboardData[activeTab]) ? leaderboardData[activeTab] : [];
    
    // Apply search
    if (searchQuery) {
      entries = searchLeaderboard(entries, searchQuery);
    }
    
    // Apply tier filter
    if (tierFilter !== 'all') {
      entries = filterByTier(entries, tierFilter);
    }
    
    // Apply view mode
    if (viewMode === 'top100') {
      entries = Array.isArray(entries) ? entries.slice(0, 100) : [];
    } else if (viewMode === 'myTier' && currentUserEntry) {
      entries = Array.isArray(entries) ? entries.filter(entry => entry?.tier === currentUserEntry.tier) : [];
    }
    
    return Array.isArray(entries) ? entries : [];
  }, [leaderboardData, activeTab, searchQuery, tierFilter, viewMode, currentUserEntry]);
  
  // Paginate entries
  const paginatedEntries = useMemo(() => {
    const safeEntries = Array.isArray(filteredEntries) ? filteredEntries : [];
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    const endIndex = startIndex + ENTRIES_PER_PAGE;
    return safeEntries.slice(startIndex, endIndex);
  }, [filteredEntries, currentPage]);
  
  const totalPages = Math.ceil((Array.isArray(filteredEntries) ? filteredEntries.length : 0) / ENTRIES_PER_PAGE);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, viewMode, activeTab]);

  const season = getCurrentSeason();
  const timeRemaining = getSeasonTimeRemaining();

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };

  const handleClaimReward = (rewardId: string): void => {
    const success = claimReward(currentUser, rewardId);
    if (success) {
      // Refresh leaderboard data
      setLeaderboardData({
        global: getLeaderboard('global', true),
        friends: getLeaderboard('friends', true),
        stake: getLeaderboard('stake', true),
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-900">
        <CardContent className="p-6 flex flex-col h-full overflow-hidden">
          {/* Header with Close Button */}
          <div className="text-center mb-4 relative">
            <Button
              onClick={onClose}
              className="absolute right-0 top-0 bg-red-600 hover:bg-red-700 text-white w-10 h-10 p-0 rounded-full"
              size="sm"
            >
              ✕
            </Button>
            <h2 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
              🏆 Leaderboard
            </h2>
            <p className="text-indigo-700 text-lg">Compete. Climb. Conquer.</p>
            
            {/* Season Info */}
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <Badge variant="outline" className="bg-purple-100 text-purple-900 border-purple-300">
                Season {season.seasonId}
              </Badge>
              <span className="text-indigo-600 font-semibold">
                ⏳ Ends in: {timeRemaining}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeaderboardTab)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-indigo-100">
              <TabsTrigger value="global" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                🌍 Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                👥 Friends
              </TabsTrigger>
              <TabsTrigger value="stake" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                💎 Stake
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white"
                />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as RankTier | 'all')}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="celestial">👑 Celestial (1-100)</option>
                  <option value="platinum">💎 Platinum (101-400)</option>
                  <option value="gold">🏆 Gold (401-1K)</option>
                  <option value="silver">🥈 Silver (1K-5K)</option>
                  <option value="bronze">🥉 Bronze (5K-20K)</option>
                  <option value="wood">🪵 Growing (20K+)</option>
                </select>
              </div>
              
              {/* View Mode Toggles */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  onClick={() => setViewMode('all')}
                  className="flex-1"
                >
                  All Players
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'top100' ? 'default' : 'outline'}
                  onClick={() => setViewMode('top100')}
                  className="flex-1"
                >
                  Top 100
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'myTier' ? 'default' : 'outline'}
                  onClick={() => setViewMode('myTier')}
                  className="flex-1"
                  disabled={!currentUserEntry}
                >
                  My Tier Only
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value={activeTab} className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-2">
                  {(Array.isArray(paginatedEntries) ? paginatedEntries : []).map((entry) => {
                    if (!entry) return null;
                    const isCurrentUser = entry.username === currentUser;
                    
                    return (
                      <HoverCard key={entry.userId}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`
                              rounded-xl p-4 shadow-lg flex items-center justify-between cursor-pointer
                              transition-all hover:scale-[1.02]
                              ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-green-400 to-green-600 border-4 border-green-800 text-white'
                                  : 'bg-white text-gray-900 border-2 border-gray-200'
                              }
                            `}
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Rank Badge */}
                              <div
                                className={`
                                  bg-gradient-to-br ${getTierColor(entry.tier)}
                                  text-white font-bold px-4 py-3 rounded-full text-lg
                                  shadow-lg min-w-[80px] text-center
                                `}
                              >
                                {getRankEmoji(entry.rank)}
                                <span className="ml-1">#{entry.rank}</span>
                              </div>

                              {/* Player Info */}
                              <div className="flex-1">
                                <div className="font-bold text-lg flex items-center gap-2">
                                  {entry?.username || 'Anonymous'}
                                  {isCurrentUser && <span className="text-sm">(You)</span>}
                                  <Badge
                                    variant="secondary"
                                    className={`${isCurrentUser ? 'bg-white/20' : 'bg-indigo-100'}`}
                                  >
                                    Lv.{entry?.forestLevel || 0}
                                  </Badge>
                                </div>
                                <div className={`text-sm ${isCurrentUser ? 'text-white/80' : 'text-gray-600'}`}>
                                  {getTierBadge(entry?.tier || 'bronze')} {getTierName(entry?.tier || 'bronze')}
                                  {' • '}
                                  🌲 {entry?.totalTrees || 0} trees
                                  {activeTab === 'stake' && entry?.stake && (
                                    <>
                                      {' • '}
                                      💰 {entry.stake.toLocaleString()} staked
                                    </>
                                  )}
                                </div>
                                
                                {/* Tier Progress Bar */}
                                {entry?.tierProgress !== undefined && entry?.tier !== 'celestial' && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={isCurrentUser ? 'text-white/70' : 'text-gray-500'}>
                                        Progress to next tier
                                      </span>
                                      <span className={`font-semibold ${isCurrentUser ? 'text-white' : 'text-indigo-600'}`}>
                                        {entry.tierProgress}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full bg-gradient-to-r ${getTierColor(entry.tier)} transition-all duration-500`}
                                        style={{ width: `${entry.tierProgress}%` }}
                                      />
                                    </div>
                                    {entry.nextTierRank && (
                                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/60' : 'text-gray-500'}`}>
                                        Reach rank #{entry.nextTierRank} for next tier
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                              <div
                                className={`
                                  font-bold text-2xl px-4 py-2 rounded-full
                                  ${isCurrentUser ? 'bg-white/20' : 'bg-indigo-100 text-indigo-900'}
                                `}
                              >
                                {activeTab === 'stake' ? '💎' : '⭐'} {entry.score.toLocaleString()}
                              </div>
                              {Array.isArray(entry?.rewards) && entry.rewards.length > 0 && (
                                <div className="mt-1 text-xs text-yellow-600 font-semibold">
                                  🎁 {(entry?.rewards || []).length} reward{(entry?.rewards || []).length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </HoverCardTrigger>

                        {/* Hover Card */}
                        <HoverCardContent className="w-80 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300">
                          <div className="space-y-2">
                            <h4 className="font-bold text-lg text-indigo-900">{entry?.username || 'Anonymous'}</h4>
                            <Separator />
                            <div className="text-sm space-y-1">
                              <p>🏅 Rank: #{entry?.rank || 0}</p>
                              <p>🎖️ Tier: {getTierBadge(entry?.tier || 'bronze')} {getTierName(entry?.tier || 'bronze')}</p>
                              <p>📊 Forest Level: {entry?.forestLevel || 0}</p>
                              <p>🌳 Total Trees: {entry?.totalTrees || 0}</p>
                              <p>🏆 Badges: {(entry?.badges || []).length}</p>
                              {activeTab === 'stake' && entry?.stake && (
                                <p>💰 Staked: {entry.stake.toLocaleString()}</p>
                              )}
                              {entry?.tierProgress !== undefined && entry?.tier !== 'celestial' && (
                                <p>📈 Tier Progress: {entry.tierProgress}%</p>
                              )}
                            </div>

                            {Array.isArray(entry.rewards) && entry.rewards.length > 0 && (
                              <>
                                <Separator />
                                <div>
                                  <p className="font-semibold text-sm mb-2">Available Rewards:</p>
                                  {(entry.rewards ?? []).map((reward) => (
                                    <div
                                      key={reward.id}
                                      className="flex items-center justify-between p-2 bg-white rounded-lg mb-1"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{reward.icon}</span>
                                        <div>
                                          <p className="text-xs font-semibold">{reward.name}</p>
                                          <p className="text-xs text-gray-600">{reward.description}</p>
                                        </div>
                                      </div>
                                      {isCurrentUser && !reward.claimed && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClaimReward(reward.id);
                                          }}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Claim
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}

                  {paginatedEntries.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No players found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-indigo-700 font-semibold px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Current User Stats Summary */}
          {currentUserEntry && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-semibold">Your Position</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {getTierBadge(currentUserEntry.tier)} Rank #{currentUserEntry.rank}
                  </p>
                  <p className="text-xs text-indigo-700">{getTierName(currentUserEntry.tier)} Tier</p>
                </div>
                {currentUserEntry.tierProgress !== undefined && currentUserEntry.tier !== 'celestial' && (
                  <div className="text-right">
                    <p className="text-sm text-indigo-600 font-semibold">Next Tier Progress</p>
                    <p className="text-3xl font-bold text-indigo-900">{currentUserEntry.tierProgress}%</p>
                    {currentUserEntry.nextTierRank && (
                      <p className="text-xs text-indigo-700">Reach #{currentUserEntry.nextTierRank}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Info Footer */}
          <div className="mt-3 p-3 bg-indigo-100/50 rounded-lg text-center text-sm text-indigo-800">
            <p className="font-semibold mb-1">🎯 How to Rank Up</p>
            <p>Plant rare trees, collect badges, maintain streaks, and engage with the community!</p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full mt-4 bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold"
            size="lg"
          >
            ✕ Close Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
