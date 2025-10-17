// EcoForest Base — Mock API & Game Logic
// All Web3, server, and game mechanics are implemented here

import type {
  GameState,
  Tree,
  TreeSpecies,
  GrowthStage,
  Mission,
  LeaderboardEntry,
  LeaderboardCategory,
  NFT,
  Group,
  SpeciesConfig,
  RatingsStorage,
  Vector3,
} from '@/types/game';
import {
  loadGameState,
  saveGameState,
  loadRatings,
  saveRatings,
  loadVisitedForests,
  saveVisitedForests,
  loadSampleForests,
  saveSampleForests,
} from './storage';

// ============================================================
// CONSTANTS & CONFIGS
// ============================================================

const SPECIES_CONFIGS: Partial<Record<TreeSpecies, SpeciesConfig>> = {
  Oak: { youngHours: 6, matureHours: 24, ancientHours: 72, ecoImpact: 15, rarity: 'Common Grove', seedCost: 20 },
  Pine: { youngHours: 4, matureHours: 18, ancientHours: 60, ecoImpact: 12, rarity: 'Common Grove', seedCost: 20 },
  Cherry: { youngHours: 8, matureHours: 36, ancientHours: 96, ecoImpact: 20, rarity: 'Wildwood', seedCost: 35 },
  Baobab: { youngHours: 12, matureHours: 72, ancientHours: 168, ecoImpact: 50, rarity: 'Elderbark', seedCost: 60 },
  Mangrove: { youngHours: 14, matureHours: 96, ancientHours: 240, ecoImpact: 80, rarity: 'Mythroot', seedCost: 100 },
};

const RARITY_SCORES: Record<string, number> = {
  common: 0,
  rare: 10,
  epic: 25,
  legendary: 50,
};

// ============================================================
// INITIALIZATION
// ============================================================

export function initializeGame(): GameState {
  let state = loadGameState();
  
  if (!state) {
    state = createNewGameState();
    saveGameState(state);
    seedSampleForests();
  } else {
    // Check daily reset
    checkDailyReset(state);
    // Update tree growth
    updateAllTreeGrowth(state);
  }
  
  return state;
}

function createNewGameState(): GameState {
  const userId = generateUUID();
  return {
    userId,
    username: `Player_${userId.substring(0, 6)}`,
    wallet: {
      address: `0x${generateHex(40)}`,
      connected: false,
      forestBalance: 100, // Starting $FOREST tokens
      leafBalance: 500, // Starting $LEAF tokens
      buildingLogs: 0, // Starting building logs
    },
    ecoPoints: 50, // Legacy - will phase out
    trees: [],
    decorations: [],
    inventory: {
      oak_seed: 2,
      pine_seed: 2,
    },
    missions: initializeMissions(),
    groups: [],
    mintedNFTs: [],
    badges: [],
    streak: {
      count: 0,
      lastLogin: Date.now(),
    },
    stats: {
      totalTreesPlanted: 0,
      totalTrashCleaned: 0,
      totalTreesWatered: 0,
      totalHeartsReceived: 0,
      totalWeedsRemoved: 0,
      totalVisits: 0,
    },
    visitCount: 0,
    interactables: {
      trash: spawnTrashItems(),
      weeds: spawnWeedItems(),
    },
    lastDailyReset: Date.now(),
    tutorialCompleted: false,
    stakedTrees: [],
    totalRewardsEarned: {
      forest: 0,
      leaf: 0,
    },
  };
}

function seedSampleForests(): void {
  const sampleData = [
    require('../../sample_data/forest_01.json'),
    require('../../sample_data/forest_02.json'),
    require('../../sample_data/forest_03.json'),
  ];
  
  saveSampleForests(sampleData as GameState[]);
}

function initializeMissions(): Mission[] {
  const missionsData = require('../../config/missions.json');
  const missions = [
    ...missionsData.inAppMissions.slice(0, 5),
    ...missionsData.baseMissions.slice(0, 2),
  ] as Mission[];
  
  return missions.map((m: Mission) => ({
    ...m,
    currentProgress: 0,
    completed: false,
    claimed: false,
  }));
}

// ============================================================
// WALLET FUNCTIONS (MOCKED)
// ============================================================

export function connectWallet(state: GameState): void {
  state.wallet.connected = true;
  state.wallet.address = `0x${generateHex(40)}`;
  updateMissionProgress(state, 'connect_wallet', 1);
  saveGameState(state);
}

export function disconnectWallet(state: GameState): void {
  state.wallet.connected = false;
  saveGameState(state);
}

// ============================================================
// TREE PLANTING & GROWTH
// ============================================================

export function plantTree(
  state: GameState,
  species: TreeSpecies,
  position: Vector3
): boolean {
  const seedId = `${species.toLowerCase()}_seed`;
  
  if (!state.inventory[seedId] || state.inventory[seedId] < 1) {
    return false;
  }
  
  if (!isValidPlantingPosition(position, state.trees)) {
    return false;
  }
  
  const config = SPECIES_CONFIGS[species];
  const tree: Tree = {
    id: generateUUID(),
    species,
    position,
    plantedAt: Date.now(),
    growthStage: 'seed' as GrowthStage,
    wateredToday: false,
    lastWatered: null,
    rarityTier: config.rarity,
    ecoImpactKgCO2: config.ecoImpact,
  };
  
  state.trees.push(tree);
  state.inventory[seedId] = (state.inventory[seedId] || 0) - 1;
  state.ecoPoints += 5;
  state.stats.totalTreesPlanted += 1;
  
  updateMissionProgress(state, 'plant_tree', 1);
  updateMissionProgress(state, 'total_trees_planted', state.trees.length);
  
  const uniqueSpecies = new Set(state.trees.map((t: Tree) => t.species)).size;
  updateMissionProgress(state, 'plant_unique_species', uniqueSpecies);
  
  checkAndAwardBadges(state, 'plant_tree');
  saveGameState(state);
  
  return true;
}

function isValidPlantingPosition(position: Vector3, trees: Tree[]): boolean {
  for (const tree of trees) {
    const distance = calculateDistance(position, tree.position);
    if (distance < 5) return false;
  }
  
  if (Math.abs(position.x) > 30 || Math.abs(position.z) > 30) {
    return false;
  }
  
  return true;
}

export function updateAllTreeGrowth(state: GameState): void {
  const now = Date.now();
  let anyChanged = false;
  
  for (const tree of state.trees) {
    if (!tree.plantedAt) continue;
    
    const newStage = calculateGrowthStage(tree, now);
    if (newStage !== tree.growthStage) {
      tree.growthStage = newStage;
      anyChanged = true;
      
      if (newStage === 'mature') state.ecoPoints += 10;
      if (newStage === 'ancient') {
        state.ecoPoints += 25;
        const ancientCount = state.trees.filter((t: Tree) => t.growthStage === 'ancient').length;
        updateMissionProgress(state, 'ancient_trees', ancientCount);
      }
    }
  }
  
  if (anyChanged) {
    checkAndAwardBadges(state, 'growth_update');
    saveGameState(state);
  }
}

function calculateGrowthStage(tree: Tree, now: number): GrowthStage {
  if (!tree.plantedAt) return 'seed';
  
  const config = SPECIES_CONFIGS[tree.species];
  if (!config) return 'seed'; // Fallback for unknown species
  
  const elapsed = now - tree.plantedAt;
  const elapsedHours = elapsed / (1000 * 60 * 60);
  
  let multiplier = 1.0;
  if (tree.wateredToday) multiplier += 0.10;
  if (tree.weedBonusUntil && now < tree.weedBonusUntil) multiplier += 0.05;
  
  const effectiveHours = elapsedHours * multiplier;
  
  if (effectiveHours < config.youngHours) return 'seed';
  if (effectiveHours < config.matureHours) return 'young';
  if (effectiveHours < config.ancientHours) return 'mature';
  return 'ancient';
}

export function waterTree(state: GameState, treeId: string): boolean {
  const tree = state.trees.find((t: Tree) => t.id === treeId);
  if (!tree) return false;
  
  const today = new Date().toDateString();
  const lastWateredDate = tree.lastWatered ? new Date(tree.lastWatered).toDateString() : null;
  
  if (lastWateredDate === today) {
    return false;
  }
  
  tree.lastWatered = Date.now();
  tree.wateredToday = true;
  state.ecoPoints += 2;
  state.stats.totalTreesWatered += 1;
  
  updateMissionProgress(state, 'water_tree', 1);
  checkAndAwardBadges(state, 'water_tree');
  saveGameState(state);
  
  return true;
}

// ============================================================
// INTERACTABLES (TRASH & WEEDS)
// ============================================================

function spawnTrashItems() {
  const count = randomInt(3, 5);
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: generateUUID(),
      position: getRandomForestPosition(),
      type: 'trash' as const,
    });
  }
  return items;
}

function spawnWeedItems() {
  const count = randomInt(4, 6);
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: generateUUID(),
      position: getRandomForestPosition(),
      type: 'weed' as const,
    });
  }
  return items;
}

export function cleanTrash(state: GameState, trashId: string): boolean {
  const index = state.interactables.trash.findIndex((t) => t.id === trashId);
  if (index === -1) return false;
  
  state.interactables.trash.splice(index, 1);
  state.ecoPoints += 3;
  state.stats.totalTrashCleaned += 1;
  
  updateMissionProgress(state, 'clean_trash', 1);
  checkAndAwardBadges(state, 'clean_trash');
  saveGameState(state);
  
  return true;
}

export function removeWeed(state: GameState, weedId: string): boolean {
  const index = state.interactables.weeds.findIndex((w) => w.id === weedId);
  if (index === -1) return false;
  
  const weed = state.interactables.weeds.splice(index, 1)[0];
  state.ecoPoints += 1;
  state.stats.totalWeedsRemoved = (state.stats.totalWeedsRemoved || 0) + 1;
  
  // Apply growth bonus to nearby trees
  for (const tree of state.trees) {
    const distance = calculateDistance(weed.position, tree.position);
    if (distance < 10) {
      tree.weedBonusUntil = Date.now() + 24 * 60 * 60 * 1000;
    }
  }
  
  updateMissionProgress(state, 'remove_weed', 1);
  saveGameState(state);
  
  return true;
}

// ============================================================
// MISSIONS
// ============================================================

function updateMissionProgress(state: GameState, action: string, amount: number): void {
  for (const mission of state.missions) {
    if (mission.claimed || mission.completed) continue;
    if (mission.goal.action !== action) continue;
    
    mission.currentProgress = (mission.currentProgress || 0) + amount;
    
    if (mission.currentProgress >= mission.goal.target) {
      mission.completed = true;
      mission.completedAt = Date.now();
    }
  }
}

export function claimMission(state: GameState, missionId: string): boolean {
  const mission = state.missions.find((m: Mission) => m.id === missionId);
  if (!mission || !mission.completed || mission.claimed) return false;
  
  state.ecoPoints += mission.reward.ecoPoints;
  
  if (mission.reward.items) {
    for (const item of mission.reward.items) {
      state.inventory[item] = (state.inventory[item] || 0) + 1;
    }
  }
  
  if (mission.reward.badge) {
    if (!state.badges.includes(mission.reward.badge)) {
      state.badges.push(mission.reward.badge);
    }
  }
  
  mission.claimed = true;
  mission.claimedAt = Date.now();
  
  saveGameState(state);
  return true;
}

// ============================================================
// LEADERBOARDS
// ============================================================

export function calculateEcoScore(userData: GameState): number {
  const uniqueSpecies = new Set(userData.trees.map((t: Tree) => t.species)).size;
  const uniqueDecos = new Set(userData.decorations.map((d) => d.type)).size;
  const avgMaturity = calculateAvgTreeMaturity(userData.trees);
  const rarityScore = calculateRarityScore(userData);
  const communityRating = calculateAvgRating(userData.userId);
  
  const score =
    Math.min(uniqueSpecies, 20) * 5 +
    Math.min(uniqueDecos, 30) * 2 +
    avgMaturity * 3 +
    Math.min(rarityScore, 500) +
    communityRating * 10;
  
  return Math.round(score);
}

function calculateAvgTreeMaturity(trees: Tree[]): number {
  if (trees.length === 0) return 0;
  
  const stageValues: Record<GrowthStage, number> = {
    seed: 1,
    sprout: 1.5,
    young: 2,
    mature: 3,
    ancient: 4,
  };
  
  let sum = 0;
  for (const tree of trees) {
    sum += stageValues[tree.growthStage] || 1;
  }
  
  return sum / trees.length;
}

function calculateRarityScore(userData: GameState): number {
  let score = 0;
  
  for (const tree of userData.trees) {
    score += RARITY_SCORES[tree.rarityTier] || 0;
  }
  
  for (const deco of userData.decorations) {
    score += RARITY_SCORES[deco.rarityTier] || 0;
  }
  
  return score;
}

function calculateAvgRating(forestId: string): number {
  const ratings = loadRatings();
  let sum = 0;
  let count = 0;
  
  for (const key in ratings) {
    if (key.endsWith(`_${forestId}`)) {
      sum += ratings[key].rating;
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
}

export function getLeaderboard(category: LeaderboardCategory): LeaderboardEntry[] {
  const allUserData = getAllUserData();
  let ranked: LeaderboardEntry[] = [];
  
  if (category === 'top_ecoforests') {
    ranked = allUserData.map((user: GameState) => ({
      userId: user.userId,
      username: user.username,
      score: calculateEcoScore(user),
      rank: 0,
    }));
  } else if (category === 'most_loved') {
    ranked = allUserData.map((user: GameState) => ({
      userId: user.userId,
      username: user.username,
      score: calculateAvgRating(user.userId),
      rank: 0,
    }));
  } else if (category === 'tree_collector') {
    ranked = allUserData.map((user: GameState) => ({
      userId: user.userId,
      username: user.username,
      score: new Set(user.trees.map((t: Tree) => t.species)).size,
      rank: 0,
    }));
  } else if (category === 'rare_finds') {
    ranked = allUserData.map((user: GameState) => ({
      userId: user.userId,
      username: user.username,
      score: calculateRarityScore(user),
      rank: 0,
    }));
  } else if (category === 'most_visited') {
    ranked = allUserData.map((user: GameState) => ({
      userId: user.userId,
      username: user.username,
      score: user.visitCount || 0,
      rank: 0,
    }));
  }
  
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return ranked.slice(0, 10);
}

function getAllUserData(): GameState[] {
  const currentUser = loadGameState();
  const sampleForests = loadSampleForests();
  
  return currentUser ? [currentUser, ...sampleForests] : sampleForests;
}

// ============================================================
// VISIT & RATING
// ============================================================

export function visitForest(forestId: string): GameState | null {
  const allForests = getAllUserData();
  const forest = allForests.find((f: GameState) => f.userId === forestId);
  
  if (forest) {
    forest.visitCount = (forest.visitCount || 0) + 1;
  }
  
  return forest || null;
}

export function rateForest(visitorId: string, forestId: string, rating: number): boolean {
  const key = `${visitorId}_${forestId}`;
  const ratings = loadRatings();
  
  if (ratings[key]) return false;
  
  ratings[key] = { rating, timestamp: Date.now() };
  saveRatings(ratings);
  
  return true;
}

export function giveHeart(state: GameState, forestId: string): boolean {
  const visited = loadVisitedForests();
  const key = `${state.userId}_${forestId}_heart`;
  
  if (visited.has(key)) return false;
  
  visited.add(key);
  saveVisitedForests(visited);
  
  return true;
}

// ============================================================
// GROUP TREES (MOCKED)
// ============================================================

export function createGroup(state: GameState, name: string, memberIds: string[]): Group {
  const group: Group = {
    id: generateUUID(),
    name,
    members: memberIds,
    pooledEcoPoints: 0,
    threshold: 100,
    createdAt: Date.now(),
  };
  
  state.groups.push(group);
  saveGameState(state);
  
  return group;
}

export function contributeToGroup(state: GameState, groupId: string, amount: number): boolean {
  const group = state.groups.find((g: Group) => g.id === groupId);
  if (!group || state.ecoPoints < amount) return false;
  
  state.ecoPoints -= amount;
  group.pooledEcoPoints += amount;
  
  if (group.pooledEcoPoints >= group.threshold) {
    group.readyToPlant = true;
  }
  
  saveGameState(state);
  return true;
}

// ============================================================
// NFT MINTING (MOCKED)
// ============================================================

export function mintNFT(state: GameState, itemId: string): NFT | null {
  const nftCatalog = require('../../config/nft_catalog.json');
  const item = nftCatalog.mintableItems.find((i: {id: string}) => i.id === itemId);
  
  if (!item || item.rarity === 'common') return null;
  
  const nft: NFT = {
    tokenId: generateUUID(),
    itemId,
    owner: state.wallet.address,
    mintedAt: Date.now(),
    metadata: {
      name: item.name,
      description: item.description,
      traits: item.traits,
      image: item.imageReference,
    },
    txHash: `mock_0x${generateHex(64)}`,
  };
  
  state.mintedNFTs.push(nft);
  saveGameState(state);
  
  return nft;
}

// ============================================================
// BADGES
// ============================================================

function checkAndAwardBadges(state: GameState, action: string): void {
  if (action === 'plant_tree' && state.trees.length === 1 && !state.badges.includes('first_tree')) {
    state.badges.push('first_tree');
  }
  
  if (action === 'plant_tree' && state.trees.length === 20 && !state.badges.includes('forest_builder')) {
    state.badges.push('forest_builder');
  }
  
  if (action === 'clean_trash' && state.stats.totalTrashCleaned === 100 && !state.badges.includes('cleanup_hero')) {
    state.badges.push('cleanup_hero');
  }
  
  if (action === 'water_tree' && state.stats.totalTreesWatered === 50 && !state.badges.includes('water_master')) {
    state.badges.push('water_master');
  }
}

// ============================================================
// DAILY RESET
// ============================================================

function checkDailyReset(state: GameState): void {
  const now = Date.now();
  const lastReset = new Date(state.lastDailyReset);
  const today = new Date(now);
  
  if (lastReset.toDateString() !== today.toDateString()) {
    // Reset daily flags
    for (const tree of state.trees) {
      tree.wateredToday = false;
    }
    
    // Respawn interactables
    state.interactables.trash = spawnTrashItems();
    state.interactables.weeds = spawnWeedItems();
    
    state.lastDailyReset = now;
    
    // Update streak
    const daysSinceLastLogin = Math.floor((now - state.streak.lastLogin) / (1000 * 60 * 60 * 24));
    if (daysSinceLastLogin === 1) {
      state.streak.count += 1;
      state.ecoPoints += 10;
      
      if (state.streak.count === 7 && !state.badges.includes('seven_day_streak')) {
        state.badges.push('seven_day_streak');
      }
    } else if (daysSinceLastLogin > 1) {
      state.streak.count = 0;
    }
    
    state.streak.lastLogin = now;
    saveGameState(state);
  }
}

// ============================================================
// HELPERS
// ============================================================

function calculateDistance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function getRandomForestPosition(): Vector3 {
  return {
    x: randomInt(-25, 25),
    y: 0,
    z: randomInt(-25, 25),
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateHex(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}
