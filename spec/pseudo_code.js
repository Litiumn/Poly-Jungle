// EcoForest Base — Core Game Logic Pseudo-Code
// This file documents the key algorithms and flows in plain pseudo-code

// ============================================================
// CAMERA CONTROLS
// ============================================================

function CameraController(camera, bounds) {
  let targetPosition = camera.position.clone();
  let targetZoom = camera.zoom;
  let isDragging = false;
  let lastMousePos = null;

  onMouseDown(event) {
    isDragging = true;
    lastMousePos = { x: event.clientX, y: event.clientY };
  }

  onMouseMove(event) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    
    // Pan camera in X/Z plane (isometric view)
    targetPosition.x -= deltaX * 0.05;
    targetPosition.z -= deltaY * 0.05;
    
    // Clamp to bounds
    targetPosition.x = clamp(targetPosition.x, bounds.minX, bounds.maxX);
    targetPosition.z = clamp(targetPosition.z, bounds.minZ, bounds.maxZ);
    
    lastMousePos = { x: event.clientX, y: event.clientY };
  }

  onMouseUp() {
    isDragging = false;
    lastMousePos = null;
  }

  onWheel(event) {
    // Zoom
    targetZoom += event.deltaY * -0.001;
    targetZoom = clamp(targetZoom, 10, 50);
  }

  update() {
    // Smooth interpolation
    camera.position.lerp(targetPosition, 0.1);
    camera.zoom = lerp(camera.zoom, targetZoom, 0.1);
    camera.updateProjectionMatrix();
  }
}

// ============================================================
// TREE PLANTING SEQUENCE
// ============================================================

function plantTree(species, position, gameState) {
  // 1. Validate
  if (!hasItemInInventory(gameState, species + '_seed')) {
    showError('No seeds available');
    return false;
  }
  
  if (!isValidPlantingPosition(position, gameState.trees)) {
    showError('Invalid planting location');
    return false;
  }
  
  // 2. Deduct seed
  removeFromInventory(gameState, species + '_seed', 1);
  
  // 3. Create tree object
  const newTree = {
    id: generateUUID(),
    species: species,
    position: position,
    plantedAt: Date.now(),
    growthStage: 'seedling',
    wateredToday: false,
    lastWatered: null,
    rarityTier: getTreeRarity(species),
    ecoImpactKgCO2: getTreeEcoImpact(species),
    metadata: {}
  };
  
  // 4. Add to game state
  gameState.trees.push(newTree);
  
  // 5. Award eco-points
  addEcoPoints(gameState, 5);
  
  // 6. Update mission progress
  updateMissionProgress(gameState, 'plant_tree', 1);
  
  // 7. Save
  saveGameState(gameState);
  
  // 8. Show success
  showSuccess(`${species} tree planted!`);
  
  return true;
}

function isValidPlantingPosition(position, existingTrees) {
  // Check not too close to other trees
  for (const tree of existingTrees) {
    const distance = calculateDistance(position, tree.position);
    if (distance < 5) {
      return false; // Too close
    }
  }
  
  // Check within planting bounds
  if (position.x < -30 || position.x > 30 || position.z < -30 || position.z > 30) {
    return false;
  }
  
  return true;
}

// ============================================================
// TREE GROWTH LOGIC
// ============================================================

function calculateGrowthStage(tree, now) {
  const speciesConfig = getSpeciesConfig(tree.species);
  const elapsedHours = (now - tree.plantedAt) / (1000 * 60 * 60);
  
  // Apply growth multipliers
  let multiplier = 1.0;
  if (tree.wateredToday) multiplier += 0.10;
  if (hasNearbyWeedRemoval(tree)) multiplier += 0.05;
  if (globalWeatherBonus()) multiplier += 0.02;
  
  const effectiveHours = elapsedHours * multiplier;
  
  // Determine stage
  if (effectiveHours < speciesConfig.youngHours) {
    return 'seedling';
  } else if (effectiveHours < speciesConfig.matureHours) {
    return 'young';
  } else if (effectiveHours < speciesConfig.ancientHours) {
    return 'mature';
  } else {
    return 'ancient';
  }
}

function updateAllTreeGrowth(gameState) {
  const now = Date.now();
  let anyChanged = false;
  
  for (const tree of gameState.trees) {
    const newStage = calculateGrowthStage(tree, now);
    if (newStage !== tree.growthStage) {
      tree.growthStage = newStage;
      anyChanged = true;
      
      // Award eco-points on stage advancement
      if (newStage === 'mature') addEcoPoints(gameState, 10);
      if (newStage === 'ancient') addEcoPoints(gameState, 25);
      
      // Check mission progress
      if (newStage === 'ancient') {
        updateMissionProgress(gameState, 'ancient_trees', 1);
      }
    }
  }
  
  if (anyChanged) {
    saveGameState(gameState);
  }
}

function getSpeciesConfig(species) {
  const configs = {
    Oak: { youngHours: 6, matureHours: 24, ancientHours: 72, ecoImpact: 15 },
    Pine: { youngHours: 4, matureHours: 18, ancientHours: 60, ecoImpact: 12 },
    Cherry: { youngHours: 8, matureHours: 36, ancientHours: 96, ecoImpact: 20 },
    Baobab: { youngHours: 12, matureHours: 72, ancientHours: 168, ecoImpact: 50 },
    Mangrove: { youngHours: 14, matureHours: 96, ancientHours: 240, ecoImpact: 80 }
  };
  return configs[species];
}

// ============================================================
// WATERING LOGIC
// ============================================================

function waterTree(treeId, gameState) {
  const tree = gameState.trees.find(t => t.id === treeId);
  if (!tree) return false;
  
  // Check if already watered today
  const today = new Date().toDateString();
  const lastWateredDate = tree.lastWatered ? new Date(tree.lastWatered).toDateString() : null;
  
  if (lastWateredDate === today) {
    showError('Already watered today');
    return false;
  }
  
  // Water the tree
  tree.lastWatered = Date.now();
  tree.wateredToday = true;
  
  // Award eco-points
  addEcoPoints(gameState, 2);
  
  // Update mission progress
  updateMissionProgress(gameState, 'water_tree', 1);
  
  // Save
  saveGameState(gameState);
  showSuccess('Tree watered!');
  
  return true;
}

function resetDailyWateringStatus(gameState) {
  // Called at 00:00 UTC
  for (const tree of gameState.trees) {
    tree.wateredToday = false;
  }
  saveGameState(gameState);
}

// ============================================================
// TRASH CLEANUP
// ============================================================

function spawnTrash(gameState) {
  const count = randomInt(3, 5);
  const trashItems = [];
  
  for (let i = 0; i < count; i++) {
    trashItems.push({
      id: generateUUID(),
      position: getRandomForestPosition(),
      type: 'trash'
    });
  }
  
  gameState.interactables.trash = trashItems;
  saveGameState(gameState);
}

function cleanTrash(trashId, gameState) {
  const index = gameState.interactables.trash.findIndex(t => t.id === trashId);
  if (index === -1) return false;
  
  // Remove trash
  gameState.interactables.trash.splice(index, 1);
  
  // Award eco-points
  addEcoPoints(gameState, 3);
  
  // Update mission progress
  updateMissionProgress(gameState, 'clean_trash', 1);
  
  // Save
  saveGameState(gameState);
  showSuccess('+3 eco-points');
  
  return true;
}

// ============================================================
// WEED REMOVAL
// ============================================================

function removeWeed(weedId, gameState) {
  const index = gameState.interactables.weeds.findIndex(w => w.id === weedId);
  if (index === -1) return false;
  
  // Remove weed
  const weed = gameState.interactables.weeds.splice(index, 1)[0];
  
  // Award eco-points
  addEcoPoints(gameState, 1);
  
  // Mark nearby trees for growth bonus
  markNearbyTreesForBonus(weed.position, gameState);
  
  // Update mission progress
  updateMissionProgress(gameState, 'remove_weed', 1);
  
  // Save
  saveGameState(gameState);
  showSuccess('Weed removed!');
  
  return true;
}

function markNearbyTreesForBonus(position, gameState) {
  for (const tree of gameState.trees) {
    const distance = calculateDistance(position, tree.position);
    if (distance < 10) {
      tree.weedBonusUntil = Date.now() + (24 * 60 * 60 * 1000); // 24h
    }
  }
}

// ============================================================
// MISSION COMPLETION FLOW
// ============================================================

function updateMissionProgress(gameState, action, amount) {
  const missions = gameState.missions;
  
  for (const mission of missions) {
    if (mission.claimed) continue;
    if (mission.goal.action !== action) continue;
    
    // Increment progress
    mission.currentProgress = (mission.currentProgress || 0) + amount;
    
    // Check completion
    if (mission.currentProgress >= mission.goal.target && !mission.completed) {
      mission.completed = true;
      mission.completedAt = Date.now();
      showNotification(`Mission completed: ${mission.title}`);
    }
  }
  
  saveGameState(gameState);
}

function claimMission(missionId, gameState) {
  const mission = gameState.missions.find(m => m.id === missionId);
  if (!mission || !mission.completed || mission.claimed) {
    return false;
  }
  
  // Award rewards
  addEcoPoints(gameState, mission.reward.ecoPoints);
  
  for (const item of mission.reward.items || []) {
    addToInventory(gameState, item, 1);
  }
  
  if (mission.reward.badge) {
    awardBadge(gameState, mission.reward.badge);
  }
  
  // Mark claimed
  mission.claimed = true;
  mission.claimedAt = Date.now();
  
  // Reset if repeatable
  if (mission.repeatable) {
    // Reset after duration (handled by daily reset logic)
  }
  
  saveGameState(gameState);
  showSuccess(`Claimed: +${mission.reward.ecoPoints} eco-points`);
  
  return true;
}

// ============================================================
// LEADERBOARD CALCULATION
// ============================================================

function calculateEcoScore(userData) {
  // Eco score formula
  const uniqueSpecies = countUniqueTreeSpecies(userData.trees);
  const uniqueDecorations = countUniqueDecorations(userData.decorations);
  const avgMaturity = calculateAvgTreeMaturity(userData.trees);
  const rarityScore = calculateRarityScore(userData);
  const communityRating = calculateAvgRating(userData.userId);
  
  const score = (Math.min(uniqueSpecies, 20) * 5)
              + (Math.min(uniqueDecorations, 30) * 2)
              + (avgMaturity * 3)
              + (Math.min(rarityScore, 500))
              + (communityRating * 10);
  
  return Math.round(score);
}

function countUniqueTreeSpecies(trees) {
  const species = new Set();
  for (const tree of trees) {
    species.add(tree.species);
  }
  return species.size;
}

function calculateAvgTreeMaturity(trees) {
  if (trees.length === 0) return 0;
  
  const stageValues = { seedling: 1, young: 2, mature: 3, ancient: 4 };
  let sum = 0;
  
  for (const tree of trees) {
    sum += stageValues[tree.growthStage] || 1;
  }
  
  return sum / trees.length;
}

function calculateRarityScore(userData) {
  const rarityValues = { common: 0, rare: 10, epic: 25, legendary: 50 };
  let score = 0;
  
  // Count trees
  for (const tree of userData.trees) {
    score += rarityValues[tree.rarityTier] || 0;
  }
  
  // Count decorations
  for (const deco of userData.decorations) {
    score += rarityValues[deco.rarityTier] || 0;
  }
  
  return score;
}

function getLeaderboard(category, allUserData) {
  let ranked = [];
  
  if (category === 'top_ecoforests') {
    ranked = allUserData.map(user => ({
      userId: user.userId,
      username: user.username,
      score: calculateEcoScore(user)
    }));
  } else if (category === 'most_loved') {
    ranked = allUserData.map(user => ({
      userId: user.userId,
      username: user.username,
      score: calculateAvgRating(user.userId)
    }));
  } else if (category === 'tree_collector') {
    ranked = allUserData.map(user => ({
      userId: user.userId,
      username: user.username,
      score: countUniqueTreeSpecies(user.trees)
    }));
  } else if (category === 'rare_finds') {
    ranked = allUserData.map(user => ({
      userId: user.userId,
      username: user.username,
      score: calculateRarityScore(user)
    }));
  } else if (category === 'most_visited') {
    ranked = allUserData.map(user => ({
      userId: user.userId,
      username: user.username,
      score: user.visitCount || 0
    }));
  }
  
  // Sort descending
  ranked.sort((a, b) => b.score - a.score);
  
  // Add rank
  ranked.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return ranked.slice(0, 10); // Top 10
}

// ============================================================
// VISIT & RATING FLOW
// ============================================================

function visitForest(forestId, visitorId, allUserData) {
  const forestData = allUserData.find(u => u.userId === forestId);
  if (!forestData) return null;
  
  // Increment visit count
  forestData.visitCount = (forestData.visitCount || 0) + 1;
  
  return {
    userId: forestData.userId,
    username: forestData.username,
    trees: forestData.trees,
    decorations: forestData.decorations,
    ecoScore: calculateEcoScore(forestData),
    avgRating: calculateAvgRating(forestData.userId)
  };
}

function rateForest(forestId, visitorId, rating, ratingsStorage) {
  // Validate one rating per visitor per forest
  const key = `${visitorId}_${forestId}`;
  if (ratingsStorage[key]) {
    return false; // Already rated
  }
  
  // Store rating
  ratingsStorage[key] = {
    rating: rating,
    timestamp: Date.now()
  };
  
  saveRatings(ratingsStorage);
  return true;
}

function calculateAvgRating(forestId, ratingsStorage) {
  let sum = 0;
  let count = 0;
  
  for (const key in ratingsStorage) {
    if (key.endsWith(`_${forestId}`)) {
      sum += ratingsStorage[key].rating;
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
}

// ============================================================
// GROUP TREE LOGIC
// ============================================================

function createGroup(name, memberIds, gameState) {
  const group = {
    id: generateUUID(),
    name: name,
    members: memberIds,
    pooledEcoPoints: 0,
    threshold: 100,
    createdAt: Date.now()
  };
  
  gameState.groups = gameState.groups || [];
  gameState.groups.push(group);
  saveGameState(gameState);
  
  return group;
}

function contributeToGroupTree(groupId, userId, amount, gameState) {
  const group = gameState.groups.find(g => g.id === groupId);
  if (!group) return false;
  
  if (!group.members.includes(userId)) {
    return false; // Not a member
  }
  
  if (gameState.ecoPoints < amount) {
    return false; // Insufficient points
  }
  
  // Deduct points
  addEcoPoints(gameState, -amount);
  
  // Add to pool
  group.pooledEcoPoints += amount;
  
  // Track contributor
  group.contributors = group.contributors || {};
  group.contributors[userId] = (group.contributors[userId] || 0) + amount;
  
  saveGameState(gameState);
  
  // Check if threshold reached
  if (group.pooledEcoPoints >= group.threshold) {
    // Enable planting
    group.readyToPlant = true;
  }
  
  return true;
}

function plantGroupTree(groupId, species, position, gameState) {
  const group = gameState.groups.find(g => g.id === groupId);
  if (!group || !group.readyToPlant) return false;
  
  // Plant tree with group marker
  const tree = {
    id: generateUUID(),
    species: species,
    position: position,
    plantedAt: Date.now(),
    growthStage: 'seedling',
    isGroupTree: true,
    groupId: groupId,
    rarityTier: 'rare',
    ecoImpactKgCO2: getTreeEcoImpact(species) * 1.5 // Bonus for group
  };
  
  gameState.trees.push(tree);
  
  // Mark group as planted
  group.planted = true;
  group.treeId = tree.id;
  
  saveGameState(gameState);
  showSuccess(`Group tree planted by ${group.name}!`);
  
  return true;
}

// ============================================================
// MOCK NFT MINTING
// ============================================================

function mintNFT(itemId, gameState) {
  const nftCatalog = loadNFTCatalog();
  const item = nftCatalog.mintableItems.find(i => i.id === itemId);
  
  if (!item) return false;
  
  // Validate item is owned and rare+
  if (!hasItemInInventory(gameState, itemId)) {
    return false;
  }
  
  if (item.rarity === 'common') {
    return false; // Cannot mint common items
  }
  
  // Simulate mint
  const nft = {
    tokenId: generateUUID(),
    itemId: itemId,
    owner: gameState.wallet.address,
    mintedAt: Date.now(),
    metadata: {
      name: item.name,
      description: item.description,
      traits: item.traits,
      image: item.imageReference
    },
    txHash: 'mock_0x' + randomHex(64)
  };
  
  gameState.mintedNFTs = gameState.mintedNFTs || [];
  gameState.mintedNFTs.push(nft);
  
  saveGameState(gameState);
  showSuccess(`NFT minted: ${item.name}`);
  
  return nft;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function addEcoPoints(gameState, amount) {
  gameState.ecoPoints = (gameState.ecoPoints || 0) + amount;
  if (gameState.ecoPoints < 0) gameState.ecoPoints = 0;
}

function hasItemInInventory(gameState, itemId) {
  return (gameState.inventory[itemId] || 0) > 0;
}

function addToInventory(gameState, itemId, amount) {
  gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + amount;
}

function removeFromInventory(gameState, itemId, amount) {
  gameState.inventory[itemId] = Math.max(0, (gameState.inventory[itemId] || 0) - amount);
}

function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHex(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}

function getRandomForestPosition() {
  return {
    x: randomInt(-25, 25),
    y: 0,
    z: randomInt(-25, 25)
  };
}

// ============================================================
// END OF PSEUDO-CODE
// ============================================================
