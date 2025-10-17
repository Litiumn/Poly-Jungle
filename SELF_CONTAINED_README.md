# 🌳 EcoForest Base — Self-Contained Prototype

## 📖 Overview

This is a **fully self-contained, Ohara-optimized prototype** of EcoForest Base that runs entirely in the browser with **zero external dependencies**. No network calls, no GLB files, no external APIs—everything is embedded.

### ✨ Key Features

- **🌱 Two Planting Methods**
  - Method 1: Click big "PLANT" button → Select seed → Auto-plants at (0,0)
  - Method 2: Click empty terrain → Select seed → Plants at clicked location
  
- **⏱️ Real-Time Growth**
  - Trees grow based on actual timestamps (persists across reloads)
  - Growth stages: seed → sprout → young → mature
  - Each stage has visual size and appearance changes
  
- **💧 Watering Mechanics**
  - Click any tree to water it (once per 24 hours)
  - Each watering adds +10% growth bonus (cumulative)
  - Earn +2 eco-points per watering
  
- **🗑️ Trash Cleanup**
  - Red cubes are trash items
  - Click to clean and earn +5 eco-points
  - Use debug panel to spawn more trash for testing
  
- **🌦️ Weather System**
  - Toggle between sunny, cloudy, and rain
  - Rain shows animated falling particles
  - Weather affects lighting intensity
  
- **🌅 Time-of-Day Lighting**
  - Automatically syncs with your device's local time
  - Day (6am-6pm): Bright lighting
  - Night (6pm-6am): Dim blue lighting
  
- **🏞️ Rich Terrain**
  - Hills created with sine wave heightmap
  - Lake at position (6, 6) — cannot plant there
  - Grey rocks scattered around
  - All using Three.js primitives (no external models)
  
- **🔧 Debug Panel**
  - Add eco-points (100 or 500)
  - Spawn trash items
  - View current stats
  - Access growth stage information

---

## 🎮 How to Play

### Starting

1. **Run the app**: `pnpm dev` → Visit http://localhost:3000
2. **Landing Screen**: Click "🌳 Enter Your Forest"
3. **Your Forest**: 3D isometric view loads with terrain, lake, rocks

### Planting Trees

#### Method A: Plant Button
1. Click the pulsing green **"PLANT"** button at bottom-center
2. Seed menu appears with 5 species cards
3. Select a species (each has different cost)
4. Tree is planted at center (0, 0)

#### Method B: Direct Click
1. Click anywhere on the green terrain
2. If valid location (not in lake, not too close to other trees):
   - Seed menu appears
   - Select species
   - Tree plants at clicked location
3. If invalid:
   - Notification shows why (e.g., "Cannot plant in the lake!")

### Growing Trees

- Trees grow **automatically in real-time** based on planted timestamp
- Growth stages (for demo, faster than production):
  - **Seed** (0-30 minutes): Small sprout
  - **Sprout** (30-60 minutes): Medium tree with foliage
  - **Young** (60-120 minutes): Larger tree
  - **Mature** (120+ minutes): Full-sized tree
- **Watering bonus**: Each watering reduces time needed by 10%

### Earning Eco-Points

- **Starting**: 500 eco-points
- **Planting costs**:
  - Oak: 50
  - Pine: 60
  - Cherry: 80
  - Baobab: 100
  - Mangrove: 90
- **Earning methods**:
  - Clean trash: +5 eco-points
  - Water tree: +2 eco-points

### Interacting

- **Water Tree**: Click any tree → If not watered in 24h, adds +10% growth bonus
- **Clean Trash**: Click red cubes → Removes trash, gives +5 eco-points
- **Toggle Weather**: Click weather icon (top-right) → Cycles sunny → cloudy → rain
- **Debug Mode**: Click "Debug" button (bottom-left) → Opens debug panel

---

## 💾 Data Persistence

### localStorage Keys

All game data is stored in localStorage:

- **`ecoforest_self_contained`**: Main game state
  - User ID, username, wallet address
  - Eco-points balance
  - All trees (with timestamps)
  - Decorations
  - Trash items
  - Inventory (seed counts)
  - Stats (trees planted, trash cleaned, trees watered)
  - Streak data
  - Last daily reset

- **`ecoforest_sample_forests`**: Friend forests for visits (future feature)
  - 3 pre-seeded sample forests
  - Alice, Bob, Charlie with different tree configurations

### Timestamp-Based Growth

Trees store their `plantedAt` timestamp (ISO format). On every load and every 10 seconds, the app recalculates growth stage:

```typescript
elapsedHours = (now - plantedAt) / (1000 * 60 * 60)
effectiveHours = elapsedHours * (1 + wateringBonusPercent / 100)

if (effectiveHours < 0.5) stage = 'seed'
else if (effectiveHours < 1.0) stage = 'sprout'
else if (effectiveHours < 2.0) stage = 'young'
else stage = 'mature'
```

This ensures trees continue growing even when the app is closed!

---

## 🎨 Visual Design

### Three.js Primitives

No external 3D models—everything uses built-in geometries:

- **Trees**:
  - Trunk: `CylinderGeometry` (brown)
  - Foliage: `SphereGeometry` + `ConeGeometry` (species-specific colors)
  - Size scales with growth stage
  
- **Terrain**:
  - `PlaneGeometry` 20×20 with 20×20 subdivision
  - Heightmap using sine waves for hills
  - Green color
  
- **Lake**:
  - `CircleGeometry` radius 3
  - Blue with transparency
  
- **Rocks**:
  - `DodecahedronGeometry` grey
  - 4 instances scattered around
  
- **Trash**:
  - `BoxGeometry` small red cubes
  - Clickable for cleanup

### Colors by Species

- **Oak**: `#7cb342` (green)
- **Pine**: `#558b2f` (dark green)
- **Cherry**: `#f48fb1` (pink)
- **Baobab**: `#8d6e63` (brown)
- **Mangrove**: `#4db6ac` (teal)

### UI Style

**Organic, nature-themed UI embedded in the scene:**

- Eco-points: Green gradient rounded badge with leaf emoji
- Trees count: Amber gradient with tree emoji
- Eco score: Blue gradient with star emoji
- Plant button: Large pulsing green button at bottom
- Weather toggle: Purple rounded button with weather emoji
- Seed menu: Wooden frame appearance (amber gradients)
- Debug panel: Dark grey with yellow accents

**No dashboard panels**—everything feels part of the forest world.

---

## 🔧 Technical Details

### Architecture

```
src/app/page.tsx                          → Main entry point
src/lib/self-contained-storage.ts         → All localStorage + game logic
src/components/forest/SelfContainedForest.tsx   → 3D scene + game loop
src/components/ui-game/
  ├── OrganicLanding.tsx                  → Landing screen
  ├── SelfContainedHUD.tsx                → In-game HUD
  ├── PlantMenu.tsx                       → Seed selection menu
  └── DebugPanel.tsx                      → Debug controls
```

### Object Count Budget

To meet stability requirements (≤30 interactive objects):

- **Trees**: Player-planted (variable, recommend ≤15)
- **Trash**: 5 initial + debug spawns
- **Rocks**: 4 static
- **Lake**: 1 static
- **Terrain**: 1 static
- **Total**: ~11 static + player trees

### Performance Optimizations

1. **Instancing**: Rocks use same geometry
2. **Simple Lighting**: Only ambient + 1 directional light
3. **LOD**: None needed due to low poly count
4. **No Physics**: All animations are CSS/WebGL transforms
5. **Deterministic**: No random physics or complex calculations
6. **Auto-refresh**: Growth recalculated every 10s (not every frame)

### Browser Compatibility

- **Required**: WebGL support (for Three.js)
- **Optional**: localStorage (game will initialize if missing)
- **Tested**: Chrome, Firefox, Safari, Edge

---

## 🚀 Quick Start

### Installation

```bash
# Already installed from previous steps
pnpm install
```

### Development

```bash
pnpm dev
# Visit http://localhost:3000
```

### Build

```bash
pnpm build
pnpm start
```

### Testing the Prototype

1. **Test Planting**:
   - Click "PLANT" button → Select Oak → Should see small sprout at center
   - Click terrain at (-3, -3) → Select Pine → Should plant at that location
   - Try clicking lake → Should get "Cannot plant in the lake!" notification

2. **Test Growth**:
   - Open Debug panel
   - Note current tree stages
   - Wait 30 minutes (or modify growth constants in storage.ts for faster testing)
   - Refresh page → Trees should advance to next stage

3. **Test Watering**:
   - Click any tree
   - Should see notification: "💧 Watered tree! +2 eco-points, +10% growth"
   - Click same tree again → "Already watered today!"
   - Check eco-points increased by 2

4. **Test Trash Cleanup**:
   - Click red cube
   - Should disappear and give +5 eco-points
   - Use Debug to spawn more trash

5. **Test Weather**:
   - Click weather icon → Should cycle sunny → cloudy → rain
   - Rain should show falling particle animation

6. **Test Time-of-Day**:
   - Check lighting based on your local time
   - If daytime: Bright yellow lighting
   - If nighttime: Dim blue lighting

7. **Test Persistence**:
   - Plant several trees
   - Refresh page
   - Trees should still be there with correct growth stages

---

## 🎯 Design Decisions

### Why Three.js Primitives?

- **No external assets**: Completely self-contained
- **Faster loading**: No downloading GLB files
- **Stable**: Built-in geometries are well-tested
- **Flexible**: Easy to modify colors, sizes, shapes

### Why Timestamp-Based Growth?

- **Persists across sessions**: Trees keep growing even when closed
- **No server needed**: Client-side calculation only
- **Deterministic**: Same time always produces same result
- **Testable**: Can modify timestamps in localStorage for testing

### Why localStorage Only?

- **Self-contained**: No backend or database needed
- **Instant**: No network latency
- **Portable**: Works offline
- **Simple**: Easy to inspect and debug

### Why Two Planting Methods?

- **Accessibility**: Some users prefer button clicks
- **Direct interaction**: Power users can click terrain
- **Discoverability**: Big button is obvious, terrain clicking is bonus
- **Flexibility**: Choose what feels natural

---

## 🐛 Troubleshooting

### Trees Not Growing

- **Check timestamps**: Open DevTools → Application → localStorage → `ecoforest_self_contained`
- **Verify planted times**: Should be ISO timestamps (e.g., `2025-01-15T12:00:00.000Z`)
- **Growth constants**: In `self-contained-storage.ts`, growth durations are 0.5h, 1h, 2h for demo
- **Auto-refresh**: Growth recalculates every 10 seconds

### Can't Plant Trees

- **Check eco-points**: Top-left badge shows current balance
- **Check location**: Cannot plant in lake or too close to other trees (2 unit minimum)
- **Check inventory**: Seeds are unlimited if you have eco-points

### Performance Issues

- **Reduce tree count**: Aim for ≤15 trees total
- **Disable debug panel**: Close debug when not needed
- **Check browser**: Ensure WebGL is enabled

### Data Not Persisting

- **Check localStorage**: Open DevTools → Application → localStorage
- **Private browsing**: May not persist in incognito mode
- **Storage limit**: Browser may have quota limits (unlikely with this data size)

---

## 📊 Stats & Scoring

### Eco Score Formula

```typescript
ecoScore = (uniqueSpecies × 5)
         + (uniqueDecorations × 2)
         + (avgMaturity × 3)
         + rarityScore
         + (communityRating × 10)
```

For this prototype (no decorations or ratings yet):

```typescript
ecoScore = (uniqueSpecies × 5) + (avgMaturity × 3)
```

Example:
- 3 Oak trees (mature), 2 Pine trees (young)
- Unique species: 2
- Avg maturity: (4+4+4+3+3)/5 = 3.6
- Score = (2 × 5) + (3.6 × 3) = 10 + 10.8 = **20.8**

### Stats Tracked

- **Trees Planted**: Total count across all sessions
- **Trash Cleaned**: Number of trash items removed
- **Trees Watered**: Total watering actions
- **Streak**: Daily login count (not yet implemented fully)

---

## 🔮 Future Enhancements

### Planned for Full Version

1. **Friend Visits**: Load sample forests, rate and give hearts
2. **Leaderboards**: Compute from local + sample data
3. **Missions**: Daily tasks for eco-points
4. **Decorations**: Place rocks, benches, flowers
5. **Group Trees**: Cooperative planting
6. **NFT Minting**: Mock minting of rare trees
7. **Badges**: Achievement system
8. **Seasonal Events**: Special limited-time content

### Not in Prototype

- Real blockchain calls (all mocked)
- Multiplayer networking (all local)
- External APIs (none)
- GLB model loading (primitives only)
- Physics engine (simple transforms only)

---

## 📝 Code Structure

### Main Components

#### `src/app/page.tsx`
- Entry point
- State: `hasEntered`, `isInitialized`
- Initializes game state from localStorage or creates new
- Switches between landing and forest views

#### `src/lib/self-contained-storage.ts`
- All type definitions
- Storage operations (load/save)
- Game logic (growth calculation, seed costs)
- Mock API functions (wallet, mint, scoring)
- Constants (growth durations, seed costs, species info)

#### `src/components/forest/SelfContainedForest.tsx`
- Main 3D scene and game loop
- Handles planting, watering, cleaning
- Manages weather and notifications
- Auto-refresh growth every 10 seconds
- Click handlers for terrain and trees

#### `src/components/ui-game/SelfContainedHUD.tsx`
- Top badges (eco-points, trees, score)
- Weather toggle button
- Plant button
- Debug toggle
- Help text
- Wallet display

#### `src/components/ui-game/PlantMenu.tsx`
- Modal with seed cards
- Shows cost and affordability
- Species info (emoji, description, color)
- Handles seed selection and planting

#### `src/components/ui-game/DebugPanel.tsx`
- Current stats display
- Add eco-points buttons
- Spawn trash button
- Growth info helper

#### `src/components/ui-game/OrganicLanding.tsx`
- Welcome screen
- Feature list
- Wallet display (mock)
- How to play instructions
- Enter forest button

---

## 🧪 Testing Checklist

- [ ] Landing screen loads
- [ ] Can enter forest
- [ ] Terrain with hills visible
- [ ] Lake at (6, 6) visible
- [ ] 4 grey rocks visible
- [ ] 5 red trash cubes visible
- [ ] Click "PLANT" button opens seed menu
- [ ] Can select Oak and plant at center
- [ ] Can click terrain to plant
- [ ] Cannot plant in lake (shows notification)
- [ ] Cannot plant too close to existing tree
- [ ] Eco-points deduct on planting
- [ ] Click tree to water (+2 eco-points, +10% bonus)
- [ ] Cannot water same tree twice in 24h
- [ ] Click trash to clean (+5 eco-points)
- [ ] Weather toggles correctly (sunny → cloudy → rain)
- [ ] Rain particles animate when weather is rain
- [ ] Lighting changes based on local time (day/night)
- [ ] Debug panel opens and shows stats
- [ ] Can add 100 eco-points via debug
- [ ] Can spawn trash via debug
- [ ] Trees grow over time (check after 30min+)
- [ ] Refresh page maintains all trees
- [ ] Growth stages update on reload

---

## 📞 Support

This is a self-contained prototype. For issues:

1. Check browser console for errors
2. Verify WebGL support
3. Clear localStorage and restart
4. Check this README for troubleshooting section

---

## 🌟 Summary

**EcoForest Base Self-Contained Prototype** is a fully functional, stable, browser-based forest game with:

- ✅ No external network calls
- ✅ No external assets (Three.js primitives only)
- ✅ localStorage persistence
- ✅ Real-time timestamp-based growth
- ✅ Two planting methods (button + direct click)
- ✅ Weather system with visual effects
- ✅ Time-of-day lighting
- ✅ Rich terrain (hills, lake, rocks)
- ✅ Debug controls for testing
- ✅ Organic, embedded UI
- ✅ ≤30 interactive objects
- ✅ Stable and deterministic

**Ready to grow your forest on Base! 🌳🌿✨**
