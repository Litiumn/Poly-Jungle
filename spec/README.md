# EcoForest Base — Technical Specification & Setup Guide

## Overview

**EcoForest Base** is a lightweight, 3D-isometric Web3 mini-game optimized for Base Mini Apps. Players plant, grow, and maintain a living forest using eco-points, participate in missions, and engage with a mocked Web3 ecosystem — all running entirely in-browser with no external network calls.

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Modern web browser with WebGL support

### Installation & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open browser
# Navigate to http://localhost:3000
```

### First Launch
On first visit, the app will:
1. Seed sample data in localStorage
2. Create a mock wallet address
3. Initialize starter eco-points (50)
4. Show tutorial overlay

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19
- **3D Rendering**: React Three Fiber + Three.js + Drei
- **State**: localStorage (single source of truth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Fully mocked (no blockchain calls)

### Key Design Decisions

1. **No External Network Calls**: All APIs, Web3 interactions, and multiplayer features are stubbed in `mock_api.ts`
2. **localStorage as Database**: Entire game state persists locally
3. **Deterministic Time**: Growth and missions use client clock (UTC)
4. **Low-Poly 3D**: Target ≤500 tris per tree, ≤300 per decoration
5. **Isometric Camera**: Fixed perspective, smooth pan/zoom

## Core Game Mechanics

### Eco-Points System
- **Earn eco-points by**:
  - Planting trees: +5
  - Watering trees: +2
  - Cleaning trash: +3 per item
  - Removing weeds: +1
  - Completing missions: varies (10-100)
  - Daily login streak: +10/day

- **Spend eco-points on**:
  - Seeds: 20-50 per species
  - Decorations: 10-200
  - Group tree contributions: pooled

### Tree Lifecycle
1. **Seed** (inventory item) → Plant on terrain
2. **Growth Stages**: Seedling (0h) → Young (6h) → Mature (24h) → Ancient (72h)
3. **Growth Accelerators**:
   - Watering: +10% growth speed (once/day per tree)
   - Weed removal nearby: +5% growth speed
   - Weather (rain): +2% global growth speed

### Tree Species (All Implemented)
- **Oak**: Common, 24h mature, 15kg CO₂ impact
- **Pine**: Common, 18h mature, 12kg CO₂ impact
- **Cherry**: Rare, 36h mature, 20kg CO₂ impact
- **Baobab**: Epic, 72h mature, 50kg CO₂ impact
- **Mangrove**: Legendary, 96h mature, 80kg CO₂ impact

### Daily Interactive Activities
- **Trash Cleanup**: 3-5 trash items spawn daily, click to remove
- **Weed Removal**: Weeds appear near trees, clear to boost growth
- **Watering**: One action per tree per day
- **Wildlife Events**: Random birds/butterflies spawn, click for +1 eco-point

### Missions
Two types:
1. **In-App Missions**: Plant 5 trees, water 10 times, clean 20 trash items
2. **Base Ecosystem Missions** (mocked): "Share on Base", "Trade in Base", "Join Base Community"

Mission rewards: 10-100 eco-points, cosmetic items, rare seeds

### Group & Cooperative Planting
- Create groups (mocked roster)
- Group trees require pooled eco-points (3+ members contribute)
- Visual marker: glowing root system + nameplate
- Shared ownership in mock NFT metadata

## Leaderboards & Scoring

### Eco Score Formula (Serverless Calculation)
```javascript
ecoScore = (uniqueTreeSpecies * 5)           // cap at 20 species
         + (uniqueDecorations * 2)           // cap at 30 decorations
         + (avgTreeMaturity * 3)             // avg growth stage 1..4
         + (rarityScore)                     // sum: common=0, rare=10, epic=25, legendary=50, cap at 500
         + (communityRating * 10)            // average rating 0..5
```

### Leaderboard Categories
1. **Top EcoForests**: Highest eco score
2. **Most Loved**: Highest average visitor rating
3. **Tree Collector**: Most unique species planted
4. **Rare Finds**: Highest cumulative rarity score
5. **Most Visited**: Most unique visitor sessions

Leaderboards recompute on every action and display top 10 globally (from mock sample data).

### Visit & Rating System
- Visit friend forests (load from sample_data)
- Give 1-5 star rating (one vote per visitor session)
- Give one "heart" per visit (cosmetic)
- Validation in mock_api prevents spam

## NFT & Web3 Policy

### Minting Policy
Only **rare, epic, and legendary** items are mintable as NFTs:
- Common trees and decorations: off-chain only
- Rare items: optional mint (simulate ERC-1155)
- Epic/Legendary: auto-mint on acquisition

### Mock Mint Flow
1. Select item from inventory
2. Preview metadata (name, traits, image reference)
3. Click "Mint" → simulate signature request
4. Confirm → item marked as minted in localStorage["mock_nfts"]
5. Assigned to mock wallet address

No actual blockchain calls. See `nft_catalog.json` for mintable items.

## Asset Specification

### Total Assets: 23 (Within 20-25 Target)

**Trees** (5):
- oak_tree.glb — 450 tris
- pine_tree.glb — 420 tris
- cherry_tree.glb — 480 tris
- baobab_tree.glb — 500 tris
- mangrove_tree.glb — 490 tris

**Decorations** (9):
- bush_fern.glb — 250 tris
- flower_patch.glb — 280 tris
- rock_small.glb — 180 tris
- log_deco.glb — 240 tris
- bench.glb — 300 tris
- pond_tile.glb — 380 tris
- lantern.glb — 190 tris
- mushroom_cluster.glb — 200 tris
- trash_obj.glb — 80 tris

**Terrain & Markers** (3):
- terrain_patch.glb — 800 tris (tiled)
- group_root_marker.glb — 150 tris (animated glow)
- particle_birds.sprite — 2D sprite

**UI & Sky** (6):
- particle_butterflies.sprite
- sky_parallax_layer_1.png (clouds)
- sky_parallax_layer_2.png (far mountains)
- ui_buttons_atlas.png
- ui_icons_atlas.png
- seed_inventory_icons.png

See `visuals.json` for complete manifest with tri budgets, textures, and LOD rules.

## Performance Guidelines

### Optimization Rules
1. **Concurrent Objects**: Limit to ≤30 interactive instances
2. **Instancing**: Use Three.js InstancedMesh for repeated objects (trees, trash)
3. **LOD**: Swap to low-poly beyond 50 units distance
4. **Lazy Loading**: Defer decorative assets until needed
5. **Texture Size**: Max 256×256 per asset
6. **Bundle Size**: Target <20MB initial load

### LOD Strategy
- **High Detail** (0-30 units): Full geometry
- **Medium Detail** (30-60 units): 50% tris
- **Low Detail** (60+ units): Billboard sprite fallback

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main entry point
│   └── layout.tsx
├── components/
│   ├── forest/                     # 3D scene components
│   │   ├── ForestScene.tsx         # Main 3D canvas
│   │   ├── Tree.tsx                # Tree model & growth
│   │   ├── Terrain.tsx             # Ground tiles
│   │   ├── Decoration.tsx          # Interactive decorations
│   │   ├── TrashItem.tsx           # Clickable trash
│   │   ├── WildlifeParticle.tsx    # Birds/butterflies
│   │   └── CameraController.tsx    # Pan/zoom logic
│   └── ui-game/                    # Game UI overlays
│       ├── LandingScreen.tsx       # Entry + wallet connect
│       ├── ForestHUD.tsx           # Eco-points, health bar
│       ├── MissionPanel.tsx        # Mission list & progress
│       ├── InventoryPanel.tsx      # Seeds & items
│       ├── VisitFlow.tsx           # Friend forest viewer
│       ├── LeaderboardPanel.tsx    # Rankings
│       ├── GroupTreeModal.tsx      # Group planting UI
│       └── TutorialOverlay.tsx     # First-time instructions
├── lib/
│   ├── mock_api.ts                 # ALL game logic & APIs
│   ├── game-state.ts               # State management hooks
│   ├── storage.ts                  # localStorage wrapper
│   └── scoring.ts                  # Eco score calculation
├── types/
│   └── game.ts                     # TypeScript interfaces
└── config/
    ├── visuals.json                # Asset manifest
    ├── missions.json               # Mission definitions
    ├── nft_catalog.json            # Mintable items
    └── scene_spec.json             # Initial scene layout
```

## Testing Offline

### Seed Data
On first launch, `mock_api.ts` seeds:
- 6 sample user forests (for leaderboards & visits)
- Your forest with 50 starter eco-points
- 3 in-app missions
- 2 Base ecosystem missions

### Testing Scenarios

1. **Plant & Grow**:
   - Buy oak seed (20 eco-points)
   - Click terrain to plant
   - Wait or fast-forward time (modify `plantedAt` in localStorage)
   - Watch growth stages

2. **Missions**:
   - Open mission panel
   - Complete "Plant 3 Trees"
   - Claim reward (+50 eco-points)

3. **Visit Friend**:
   - Open visit flow
   - Select "Forest_02" from sample data
   - Pan around, give 5-star rating

4. **Leaderboards**:
   - Check rankings (computed from sample forests)
   - Your forest should appear if score > 0

5. **Mock Mint**:
   - Plant a rare Cherry tree
   - Wait until mature
   - Open inventory → Mint → Confirm
   - Check localStorage["mock_nfts"]

### Modify Time (for Testing)
```javascript
// In browser console
const state = JSON.parse(localStorage.getItem('ecoforest_gamestate'));
state.trees[0].plantedAt = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
localStorage.setItem('ecoforest_gamestate', JSON.stringify(state));
location.reload();
```

## Mock API Reference

All functions in `src/lib/mock_api.ts`:

### Wallet
- `connectWallet()` → { address, balance }
- `disconnectWallet()`

### Inventory
- `buyItem(itemId, cost)` → boolean
- `useItem(itemId)` → boolean

### Planting
- `plantTree(species, position)` → tree object
- `waterTree(treeId)` → boolean
- `removeWeed(position)` → +1 eco-point

### Cleanup
- `cleanTrash(trashId)` → +3 eco-points
- `spawnTrash()` → new trash positions

### Missions
- `getMissions()` → mission array
- `updateMissionProgress(missionId, action)`
- `claimMission(missionId)` → reward

### Leaderboards
- `getLeaderboard(category)` → ranked users
- `calculateEcoScore(userData)` → score number

### Visits
- `visitForest(userId)` → forest data
- `rateForest(userId, rating)` → boolean
- `giveHeart(userId)` → boolean

### Groups
- `createGroup(name, members)` → group object
- `contributeToGroupTree(groupId, ecoPoints)` → boolean

### NFT
- `mintNFT(itemId)` → { txHash, tokenId }
- `getMintedNFTs()` → array
- `getNFTMetadata(tokenId)` → metadata object

## Known Limitations

1. **No Real Blockchain**: All Web3 is simulated
2. **Single Device**: State doesn't sync across devices
3. **Time-Based Growth**: Requires device to stay in sync with UTC
4. **No Multiplayer**: Group features are mocked
5. **Asset Placeholders**: 3D models are referenced but not bundled (use placeholder geometry)

## Future Enhancements (Not Implemented)

- Real Web3 integration with Base network
- IPFS for NFT metadata storage
- Multiplayer real-time collaboration
- GPS-based real-world tree planting
- Advanced weather system
- Seasonal events with unique decorations

## Troubleshooting

### Issue: Blank screen on load
- **Solution**: Open console, check for WebGL errors. Ensure browser supports WebGL 2.

### Issue: Trees not growing
- **Solution**: Check device time is correct. Growth uses UTC timestamp.

### Issue: localStorage full
- **Solution**: Clear old data: `localStorage.clear()` then reload.

### Issue: Performance lag
- **Solution**: Reduce concurrent objects. Limit decorations to <20.

## Credits & License

Built for Base Mini Apps ecosystem.  
Uses React Three Fiber, Three.js, shadcn/ui.  
All game logic and mock APIs are open for modification.

---

**Enjoy building your EcoForest! 🌳🌿**
