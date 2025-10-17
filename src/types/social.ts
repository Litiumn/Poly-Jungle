/**
 * Social Features Type Definitions
 * Brag Gardens, Seasonal Showcase, Friend Leaderboards
 */

export interface ShowcaseEntry {
  id: string;
  userId: string;
  username: string;
  treeId: string;
  species: string;
  rarityTier: string;
  growthStage: string;
  showcasedAt: number;
  likes: number;
  comments: ShowcaseComment[];
  season: string; // e.g., "Winter 2024"
}

export interface ShowcaseComment {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface BragGarden {
  id: string;
  userId: string;
  username: string;
  displayTrees: string[]; // Up to 5 tree IDs
  theme: 'natural' | 'mystical' | 'ancient' | 'celestial';
  decorations: string[]; // Decoration IDs
  visitors: number;
  likes: number;
  featured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FriendConnection {
  userId: string;
  friendId: string;
  connectedAt: number;
  mutualFriends: string[];
}

export interface FriendLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  badge: string;
  tier: string;
  isFriend: boolean;
  forestPreview?: string; // Preview image URL
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  rewards: {
    leaf: number;
    forest: number;
    exclusiveNFTs: string[];
  };
  participants: number;
  status: 'upcoming' | 'active' | 'ended';
}

export interface PrestigeCollection {
  id: string;
  name: string;
  description: string;
  nftIds: string[];
  completionReward: {
    badge: string;
    title: string;
    leaf: number;
    forest: number;
  };
  completedBy: string[]; // User IDs who completed it
  rarity: 'rare' | 'epic' | 'legendary';
}

export interface PlayerProfile {
  userId: string;
  username: string;
  tier: 'free_grower' | 'caretaker' | 'patron';
  badges: string[];
  titles: string[];
  activeTitle?: string;
  bragGarden?: BragGarden;
  showcaseEntries: ShowcaseEntry[];
  friends: string[];
  forestVisitors: number;
  totalLikes: number;
  joinedAt: number;
}
