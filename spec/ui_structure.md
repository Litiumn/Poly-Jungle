# EcoForest Base — UI Component Structure

## Component Hierarchy

```
App (page.tsx)
├── LandingScreen                    [if !gameStarted]
│   ├── Logo
│   ├── WalletConnectButton
│   └── EnterForestButton
│
├── ForestScene                      [main 3D view]
│   ├── Canvas (react-three-fiber)
│   │   ├── Camera
│   │   │   └── CameraController     [pan, zoom logic]
│   │   ├── Lighting
│   │   │   ├── AmbientLight
│   │   │   └── DirectionalLight
│   │   ├── Background
│   │   │   ├── ParallaxLayer (clouds)
│   │   │   └── ParallaxLayer (mountains)
│   │   ├── Terrain
│   │   │   └── TerrainPatch[]       [tiled grid]
│   │   ├── Trees
│   │   │   └── Tree[]               [planted trees with growth]
│   │   ├── Decorations
│   │   │   └── Decoration[]         [benches, rocks, etc.]
│   │   ├── Interactables
│   │   │   ├── TrashItem[]          [clickable cleanup]
│   │   │   └── WeedClump[]          [clickable removal]
│   │   ├── Particles
│   │   │   ├── WildlifeParticle[]   [birds, butterflies]
│   │   │   └── RainParticles        [if weather=rain]
│   │   └── Markers
│   │       └── GroupRootMarker[]    [glowing group trees]
│   │
│   └── ForestHUD                    [2D overlay]
│       ├── EcoPointsDisplay
│       ├── ForestHealthBar
│       ├── StreakCounter
│       └── ActionButtons
│           ├── PlantButton
│           ├── WaterButton
│           ├── MissionsButton
│           ├── InventoryButton
│           ├── VisitButton
│           └── LeaderboardButton
│
├── InventoryPanel                   [modal overlay]
│   ├── SeedInventory
│   │   └── SeedCard[]               [Oak, Pine, Cherry, etc.]
│   ├── DecorationInventory
│   │   └── DecorationCard[]
│   └── NFTInventory
│       └── NFTCard[]                [minted items]
│
├── MissionPanel                     [modal overlay]
│   ├── MissionTabs
│   │   ├── InAppMissions
│   │   └── BaseMissions
│   ├── MissionList
│   │   └── MissionCard[]
│   │       ├── Title
│   │       ├── Description
│   │       ├── ProgressBar
│   │       └── ClaimButton
│   └── CompletedMissions
│
├── VisitFlow                        [modal overlay]
│   ├── ForestList
│   │   └── ForestPreviewCard[]      [top forests or friends]
│   ├── VisitedForestView
│   │   ├── Canvas (read-only scene)
│   │   ├── ForestDetails
│   │   │   ├── OwnerName
│   │   │   ├── EcoScore
│   │   │   └── TreeCount
│   │   ├── RatingInput (1-5 stars)
│   │   └── GiveHeartButton
│   └── BackButton
│
├── LeaderboardPanel                 [modal overlay]
│   ├── CategoryTabs
│   │   ├── TopEcoForests
│   │   ├── MostLoved
│   │   ├── TreeCollector
│   │   ├── RareFinds
│   │   └── MostVisited
│   └── LeaderboardList
│       └── LeaderboardEntry[]
│           ├── Rank
│           ├── Username
│           ├── Score
│           └── VisitButton
│
├── GroupTreeModal                   [modal overlay]
│   ├── GroupInfo
│   │   ├── GroupName
│   │   └── MemberList
│   ├── ContributionForm
│   │   ├── EcoPointInput
│   │   └── ContributeButton
│   ├── GroupTreePreview
│   └── PlantButton (when funded)
│
├── TutorialOverlay                  [first visit only]
│   ├── WelcomeMessage
│   ├── StepIndicator
│   └── NextButton
│
└── SettingsMenu                     [dropdown]
    ├── WeatherToggle
    ├── SoundToggle
    └── LogoutButton
```

## Component Responsibilities

### LandingScreen
- Display game logo and title
- Wallet connect button (mock)
- "Enter Forest" to start game
- Tutorial prompt for new users

### ForestScene (3D Canvas)
**Purpose**: Main 3D isometric view of the player's forest

**State**:
- Camera position/zoom
- Planted trees with positions
- Decorations with positions
- Active interactables (trash, weeds)
- Wildlife particle positions
- Weather state

**Interactions**:
- Click terrain to plant tree (if seed selected)
- Click tree to open tree detail/water
- Click trash to clean (+3 eco-points)
- Click weed to remove (+1 eco-point)
- Click wildlife for bonus (+1 eco-point)
- Pan camera with mouse/touch drag
- Zoom with scroll/pinch

### Tree Component
**Props**: 
- species: TreeSpecies
- position: Vector3
- plantedAt: timestamp
- growthStage: 'seedling' | 'young' | 'mature' | 'ancient'
- isGroupTree: boolean

**Rendering**:
- Load GLB model based on species
- Scale based on growth stage
- Apply LOD based on camera distance
- Show growth animation on stage transition
- Show group marker glow if isGroupTree

**Logic**:
- Calculate current growth stage from `plantedAt` timestamp
- Check for watering/weed bonuses
- Update visual when stage changes

### CameraController
**Purpose**: Manages isometric camera pan and zoom

**Controls**:
- Mouse drag → pan X/Z
- Mouse wheel → zoom
- Touch drag → pan
- Pinch → zoom
- Bounds: -50 to +50 X/Z

**State**:
- targetPosition: Vector3
- targetZoom: number
- Smooth interpolation (lerp)

### ForestHUD
**Purpose**: 2D overlay displaying stats and actions

**Elements**:
- Eco-Points: Live count with icon
- Forest Health: Colored bar (green → grey)
- Streak: Day count + fire icon
- Action Buttons: Row of circular buttons

**State**:
- ecoPoints (from game state)
- forestHealth (computed from actions)
- loginStreak (from localStorage)

### InventoryPanel
**Purpose**: Modal showing owned seeds, decorations, NFTs

**Tabs**:
1. Seeds: Oak, Pine, Cherry, Baobab, Mangrove
2. Decorations: Benches, lanterns, ponds, etc.
3. NFTs: Minted items with metadata

**Actions**:
- Click seed → enter plant mode
- Click decoration → place in forest
- Click NFT → view metadata or mint (if not minted)

### MissionPanel
**Purpose**: Display active and completed missions

**Tabs**:
1. In-App: Plant trees, water, cleanup
2. Base: Ecosystem missions (mocked)

**Mission Card**:
- Title + description
- Progress bar (current/target)
- Reward preview (eco-points + items)
- Claim button (enabled when complete)

**Logic**:
- Track progress in localStorage
- Update on player actions
- Award rewards on claim
- Reset daily missions at 00:00 UTC

### VisitFlow
**Purpose**: View and rate other forests

**Flow**:
1. Show list of forests (sample data)
2. Click forest → load read-only 3D view
3. Pan around, view trees/decorations
4. Give 1-5 star rating (one vote per visit)
5. Give one heart (cosmetic)
6. Return to list

**State**:
- selectedForestId
- visitedForests (prevent spam)
- rating (1-5)

**Validation**:
- One rating per user per forest per session
- Store in localStorage

### LeaderboardPanel
**Purpose**: Display rankings across categories

**Categories**:
1. Top EcoForests (eco score)
2. Most Loved (avg rating)
3. Tree Collector (unique species)
4. Rare Finds (rarity score)
5. Most Visited (visit count)

**Rendering**:
- Top 10 per category
- Compute rankings from sample + user data
- Highlight user's position
- Visit button to jump to their forest

**Refresh**:
- Recompute on every action
- Store last computed rankings in memory

### GroupTreeModal
**Purpose**: Facilitate cooperative group tree planting

**Flow**:
1. Select "Plant Group Tree" option
2. Choose group (or create new)
3. Show contribution form
4. Members contribute eco-points (pooled)
5. When threshold reached, plant tree
6. Tree shows group marker glow

**State**:
- selectedGroup
- currentPool (eco-points)
- requiredPool (threshold)
- contributors (list)

**Validation**:
- Min 3 members to form group
- Each contributes ≥10 eco-points

### TutorialOverlay
**Purpose**: First-time user onboarding

**Steps**:
1. Welcome to EcoForest
2. Plant your first tree
3. Water it to boost growth
4. Clean trash for eco-points
5. Complete missions for rewards
6. Visit friends and climb leaderboards

**State**:
- currentStep (0-5)
- completed (in localStorage)

**Behavior**:
- Show once per user
- Highlight relevant UI elements
- Advance on action completion

## Data Flow

### State Management

**Global State** (localStorage):
```typescript
{
  wallet: { address, connected },
  ecoPoints: number,
  trees: Tree[],
  decorations: Decoration[],
  inventory: { seeds, decorations, nfts },
  missions: MissionProgress[],
  streak: { count, lastLogin },
  ratings: { [forestId]: rating },
  minted: NFT[]
}
```

**Session State** (React hooks):
- Selected tool (plant/water/clean)
- Active modals (inventory, missions, visit, leaderboard)
- Camera position/zoom
- Wildlife particle positions
- Trash/weed spawn positions

### Action Flow Examples

**Plant Tree**:
1. User clicks "Inventory" → selects oak seed
2. State: `selectedTool = 'plant', selectedSeed = 'oak'`
3. User clicks valid terrain position
4. Validate: has seed, position valid, enough eco-points
5. Deduct seed from inventory
6. Create tree object: `{ species: 'oak', position, plantedAt: Date.now(), growthStage: 'seedling' }`
7. Add to trees array
8. Save to localStorage
9. Trigger mission progress update
10. Award +5 eco-points for planting

**Water Tree**:
1. User clicks tree in scene
2. Check: not watered today
3. Deduct 0 eco-points (free action)
4. Mark tree as watered (timestamp)
5. Apply +10% growth multiplier
6. Award +2 eco-points
7. Update mission progress
8. Save state

**Complete Mission**:
1. User completes mission goal (e.g., plant 5 trees)
2. Mission progress reaches target
3. User opens mission panel
4. Clicks "Claim" on completed mission
5. Validate: mission complete, not already claimed
6. Award eco-points + items
7. Mark mission as claimed
8. If repeatable, reset after duration
9. Show reward toast notification

## Styling

**Design System**:
- Primary color: Forest green (#2d5016)
- Accent: Bright green (#4ade80)
- Background: Soft cream (#faf9f6)
- Text: Dark grey (#1f2937)
- Buttons: Rounded, shadowed, hover effects

**3D Scene**:
- Isometric camera angle (~45°)
- Soft ambient + warm directional lighting
- Subtle shadows
- Smooth camera transitions (lerp)

**UI Overlays**:
- Frosted glass effect (backdrop-blur)
- Rounded corners (border-radius: 16px)
- Drop shadows for depth
- Smooth fade-in/out animations

**Responsive**:
- Desktop: Full scene + side panels
- Tablet: Collapsible panels
- Mobile: Full-screen scene + bottom sheet modals

## Performance Considerations

1. **Instancing**: Use InstancedMesh for repeated objects (trash, rocks)
2. **LOD**: Swap to low-poly models beyond 60 units
3. **Culling**: Enable frustum culling
4. **Lazy Load**: Defer decorations until placed
5. **Limit Particles**: Max 20 wildlife particles
6. **Debounce**: Camera updates, growth checks
7. **Memoization**: Tree/decoration components with React.memo

## Accessibility

- Keyboard navigation for all modals
- ARIA labels on buttons
- Screen reader announcements for actions
- High contrast mode option
- Focus indicators
- Skip to content link

---

This structure ensures a clear separation of concerns, maintainable codebase, and smooth user experience.
