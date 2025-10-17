/**
 * Social Features Mock API
 * Brag Gardens, Seasonal Showcase, Friend Leaderboards
 */

import type { BragGarden, ShowcaseEntry, FriendLeaderboardEntry } from '@/types/social';
import type { GameState } from '@/types/game';

// Mock storage (in production, this would be in a database)
const mockBragGardens: BragGarden[] = [];
const mockShowcaseEntries: ShowcaseEntry[] = [];
const mockFriendConnections: Map<string, Set<string>> = new Map();

// ============================================================
// BRAG GARDENS
// ============================================================

export function createBragGarden(
  gameState: GameState,
  theme: BragGarden['theme'],
  displayTreeIds: string[]
): BragGarden {
  const garden: BragGarden = {
    id: generateId(),
    userId: gameState.userId,
    username: gameState.username,
    displayTrees: displayTreeIds.slice(0, 5),
    theme,
    decorations: [],
    visitors: 0,
    likes: 0,
    featured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  mockBragGardens.push(garden);
  return garden;
}

export function updateBragGarden(
  gardenId: string,
  updates: Partial<BragGarden>
): BragGarden | null {
  const garden = mockBragGardens.find((g) => g.id === gardenId);
  if (!garden) return null;

  Object.assign(garden, updates);
  garden.updatedAt = Date.now();

  return garden;
}

export function getBragGarden(userId: string): BragGarden | null {
  return mockBragGardens.find((g) => g.userId === userId) || null;
}

export function getFeaturedBragGardens(limit: number = 10): BragGarden[] {
  return mockBragGardens
    .filter((g) => g.featured)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}

export function likeBragGarden(gardenId: string): boolean {
  const garden = mockBragGardens.find((g) => g.id === gardenId);
  if (!garden) return false;

  garden.likes += 1;
  return true;
}

export function visitBragGarden(gardenId: string): boolean {
  const garden = mockBragGardens.find((g) => g.id === gardenId);
  if (!garden) return false;

  garden.visitors += 1;
  return true;
}

// ============================================================
// SEASONAL SHOWCASE
// ============================================================

export function submitShowcaseEntry(
  gameState: GameState,
  treeId: string,
  season: string
): ShowcaseEntry | null {
  const tree = gameState.trees.find((t) => t.id === treeId);
  if (!tree) return null;

  // Check if already submitted this season
  const existing = mockShowcaseEntries.find(
    (e) => e.userId === gameState.userId && e.season === season
  );
  if (existing) return null;

  const entry: ShowcaseEntry = {
    id: generateId(),
    userId: gameState.userId,
    username: gameState.username,
    treeId: tree.id,
    species: tree.species,
    rarityTier: tree.rarityTier,
    growthStage: tree.growthStage,
    showcasedAt: Date.now(),
    likes: 0,
    comments: [],
    season,
  };

  mockShowcaseEntries.push(entry);
  return entry;
}

export function getSeasonalShowcase(season: string): ShowcaseEntry[] {
  return mockShowcaseEntries
    .filter((e) => e.season === season)
    .sort((a, b) => b.likes - a.likes);
}

export function likeShowcaseEntry(entryId: string): boolean {
  const entry = mockShowcaseEntries.find((e) => e.id === entryId);
  if (!entry) return false;

  entry.likes += 1;
  return true;
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  if (month >= 2 && month <= 4) return `Spring ${year}`;
  if (month >= 5 && month <= 7) return `Summer ${year}`;
  if (month >= 8 && month <= 10) return `Fall ${year}`;
  return `Winter ${year}`;
}

// ============================================================
// FRIEND SYSTEM
// ============================================================

export function addFriend(userId: string, friendId: string): boolean {
  if (userId === friendId) return false;

  if (!mockFriendConnections.has(userId)) {
    mockFriendConnections.set(userId, new Set());
  }

  mockFriendConnections.get(userId)!.add(friendId);
  return true;
}

export function removeFriend(userId: string, friendId: string): boolean {
  const friends = mockFriendConnections.get(userId);
  if (!friends) return false;

  return friends.delete(friendId);
}

export function getFriends(userId: string): string[] {
  return Array.from(mockFriendConnections.get(userId) || []);
}

export function isFriend(userId: string, otherId: string): boolean {
  const friends = mockFriendConnections.get(userId);
  return friends ? friends.has(otherId) : false;
}

// ============================================================
// FRIEND LEADERBOARD
// ============================================================

export function getFriendLeaderboard(
  userId: string,
  allGameStates: GameState[]
): FriendLeaderboardEntry[] {
  const friends = getFriends(userId);
  
  return allGameStates.map((state) => ({
    userId: state.userId,
    username: state.username,
    score: calculateEcoScore(state),
    badge: getBadgeForScore(calculateEcoScore(state)),
    tier: state.playerTier || 'free_grower',
    isFriend: friends.includes(state.userId),
  }));
}

function calculateEcoScore(state: GameState): number {
  const treeScore = state.trees.length * 10;
  const matureTreeScore = state.trees.filter((t) => t.growthStage === 'mature' || t.growthStage === 'ancient').length * 20;
  const stakingScore = state.stakedTrees.length * 30;
  const badgeScore = state.badges.length * 15;
  
  return treeScore + matureTreeScore + stakingScore + badgeScore;
}

function getBadgeForScore(score: number): string {
  if (score >= 1000) return '🏆 Forest Guardian';
  if (score >= 500) return '🌳 Tree Master';
  if (score >= 250) return '🌿 Caretaker';
  if (score >= 100) return '🌱 Grower';
  return '🌾 Seedling';
}

// ============================================================
// MOCK DATA GENERATION
// ============================================================

export function seedMockSocialData(gameStates: GameState[]): void {
  // Create some featured brag gardens
  if (gameStates.length > 1 && mockBragGardens.length === 0) {
    for (let i = 0; i < Math.min(3, gameStates.length); i++) {
      const state = gameStates[i];
      if (state.trees.length >= 3) {
        const garden = createBragGarden(
          state,
          ['natural', 'mystical', 'ancient'][i % 3] as BragGarden['theme'],
          state.trees.slice(0, 5).map((t) => t.id)
        );
        garden.featured = true;
        garden.likes = Math.floor(Math.random() * 50) + 10;
        garden.visitors = Math.floor(Math.random() * 100) + 20;
      }
    }
  }

  // Create some showcase entries
  const currentSeason = getCurrentSeason();
  if (gameStates.length > 1 && mockShowcaseEntries.length === 0) {
    for (let i = 0; i < Math.min(5, gameStates.length); i++) {
      const state = gameStates[i];
      if (state.trees.length > 0) {
        const randomTree = state.trees[Math.floor(Math.random() * state.trees.length)];
        const entry = submitShowcaseEntry(state, randomTree.id, currentSeason);
        if (entry) {
          entry.likes = Math.floor(Math.random() * 30) + 5;
        }
      }
    }
  }
}

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
