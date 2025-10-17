'use client';

/**
 * StableForest — Simplified, optimized 3D forest scene
 * 
 * Stability features:
 * - Maximum 25 render objects
 * - Simple lighting (1 ambient + 1 directional)
 * - No fog, bloom, or post-processing
 * - Flat color materials only
 * - No animations or particle effects
 * - Safe localStorage with try/catch
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { GameStateData, TreeData, TreeSpecies, Weather } from '@/lib/self-contained-storage';
import {
  loadGameState,
  saveGameState,
  getSeedCost,
  canAffordSeed,
  calculateGrowthStage,
  getDecorationCost,
  canAffordDecoration,
  mockAPI,
  loadSampleForests,
  type DecorationData,
  type DecorationType,
  type Mission,
  type SampleForest,
} from '@/lib/self-contained-storage';
import { SelfContainedHUD } from '@/components/ui-game/SelfContainedHUD';
import { PlantMenu } from '@/components/ui-game/PlantMenu';
import { DebugPanel } from '@/components/ui-game/DebugPanel';
import { TreeDetailsPopup } from '@/components/ui-game/TreeDetailsPopup';
import { TreeInventory } from '@/components/ui-game/TreeInventory';
import { DebugTreeGrowth } from '@/components/ui-game/DebugTreeGrowth';
import { VisualDebugPanel } from '@/components/ui-game/VisualDebugPanel';
import { WorkshopMerged } from '@/components/ui-game/WorkshopMerged';
import { MissionBoard } from '@/components/ui-game/MissionBoard';
import { EnhancedLeaderboardPanel } from '@/components/ui-game/EnhancedLeaderboardPanel';
import { VisitForestsPanel } from '@/components/ui-game/VisitForestsPanel';
import { SeedMarket } from '@/components/ui-game/SeedMarket';
import { SeedInventory } from '@/components/ui-game/SeedInventory';
import { Marketplace } from '@/components/ui-game/Marketplace';
import { BuildingLogsPanel } from '@/components/ui-game/BuildingLogsPanel';

import { FurnitureInventory } from '@/components/ui-game/FurnitureInventory';
import { PackOpeningModal } from '@/components/ui-game/PackOpeningModal';
import { PlacedFurniture } from '@/components/forest/FurnitureModels';
import { PlacementPreview } from '@/components/forest/PlacementPreview';
import { SelectionHighlight } from '@/components/forest/SelectionHighlight';
import { PlacementControls } from '@/components/ui-game/PlacementControls';
import { ChoppingAnimation } from '@/components/ui-game/ChoppingAnimation';
import { ChoppingConfirmationModal } from '@/components/ui-game/ChoppingConfirmationModal';
import { executeChopTree, computeChopYield, canChopTree } from '@/lib/tree-chopping';
import { Tree } from '@/components/forest/Tree';
import { getValidSpecies } from '@/lib/tree-migration';
import type { PackType, SeedData, SeedTier } from '@/lib/seed-system';
import { openSeedPack, PACK_DEFINITIONS, SEED_TIER_INFO } from '@/lib/seed-system';
import { openFurniturePack, FURNITURE_PACK_DEFINITIONS, type FurniturePackType, type FurnitureData } from '@/lib/furniture-system';
import { usePlacementSystem } from '@/hooks/usePlacementSystem';
import type { PlacedObject } from '@/lib/placement-manager';
import { EnhancedTerrain } from '@/components/forest/EnhancedTerrain';
import { ProceduralGrass } from '@/components/forest/ProceduralGrass';
import { CoordinateDebugTool, DebugCoordinateDisplay } from '@/components/forest/CoordinateDebugTool';

const MAX_TREES = 15; // Limit trees to stay under 25 total objects

// Simplified terrain - no heightmap
function Terrain({ onTerrainClick, plantMode }: { onTerrainClick: (x: number, z: number) => void; plantMode: boolean }): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const handlePointerDown = useCallback((event: any) => {
    if (!meshRef.current) return;
    
    // Check if this is a click (not a drag)
    // event.delta represents mouse movement in pixels
    if (event.delta && event.delta > 5) {
      console.log('⚠️ Drag detected (delta > 5px), ignoring click');
      return; // This was a drag, not a click
    }
    
    // Stop propagation to prevent OrbitControls from capturing this event
    event.stopPropagation();
    
    // Debug: Log what was clicked
    console.log('🎯 Terrain pointer down!', {
      meshName: meshRef.current.name,
      plantMode,
      point: event.point,
      delta: event.delta
    });
    
    const intersect = event.intersections[0];
    if (intersect && intersect.point) {
      const x = Math.round(intersect.point.x);
      const z = Math.round(intersect.point.z);
      
      console.log('✅ Valid terrain click at:', { x, z });
      onTerrainClick(x, z);
    }
  }, [onTerrainClick, plantMode]);
  
  // Set mesh name for debugging
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.name = 'Ground';
    }
  }, []);
  
  return (
    <mesh
      ref={meshRef}
      name="Ground"
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color={plantMode ? "#a5d6a7" : "#8bc34a"} 
        flatShading 
        side={THREE.DoubleSide}
        opacity={plantMode ? 0.9 : 1}
        transparent={plantMode}
      />
    </mesh>
  );
}

// Enhanced lake with glossy water texture - circular with low-poly look
function Lake(): JSX.Element {
  // Create circular water geometry with slight imperfections and low-poly height variations
  const waterGeometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(2.2, 16); // Circle with 16 segments for low-poly look
    const positions = geo.attributes.position;
    
    // Apply slight imperfections to make it not perfectly circular
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Skip center vertex (it's at 0,0)
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 0.1) continue;
      
      // Calculate angle for this vertex
      const angle = Math.atan2(y, x);
      
      // Add slight radius variations (8-12% variation)
      const radiusVariation = 1.0 + Math.sin(angle * 4) * 0.1 + Math.cos(angle * 7) * 0.08;
      
      // Adjust vertex position for imperfect circle
      positions.setX(i, x * radiusVariation);
      positions.setY(i, y * radiusVariation);
      
      // Add low-poly height variations for texture
      const heightVariation = 
        Math.sin(x * 1.5) * 0.07 +
        Math.cos(y * 1.3) * 0.06 +
        Math.sin(angle * 5) * 0.05;
      
      positions.setZ(i, heightVariation);
    }
    
    // Compute normals for faceted low-poly look
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <group position={[8, 0.15, 8]}>
      {/* Water surface with glossy low-poly material */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        geometry={waterGeometry}
      >
        <meshStandardMaterial
          color="#2a8bc8"
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0.7}
          emissive="#1a5d8a"
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
          depthWrite={true}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}

// Enhanced rocks with more variety
function Rocks(): JSX.Element {
  const positions: [number, number, number][] = [
    [-7, 0.3, -7],
    [8, 0.3, -6],
    [-8, 0.25, 4],
    [7, 0.35, 7],
    [-5, 0.3, 8],
  ];
  
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#a0a0a0" flatShading />
        </mesh>
      ))}
    </>
  );
}

// Decorative flowers
function Flowers(): JSX.Element {
  const positions: [number, number, number][] = [
    [-6, 0.2, -5],
    [5, 0.2, -7],
    [-8, 0.2, 2],
    [8, 0.2, 3],
  ];
  
  const colors = ['#ff69b4', '#ffeb3b', '#9c27b0', '#4fc3f7'];
  
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Stem */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
            <meshStandardMaterial color="#4caf50" flatShading />
          </mesh>
          {/* Petals */}
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color={colors[i]} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Small bridge decoration
function Bridge(): JSX.Element {
  return (
    <group position={[8, 0, -2]}>
      {/* Bridge planks */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#8d6e63" flatShading />
      </mesh>
      {/* Bridge rails */}
      <mesh position={[-0.9, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 1]} />
        <meshStandardMaterial color="#6d4c41" flatShading />
      </mesh>
      <mesh position={[0.9, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 1]} />
        <meshStandardMaterial color="#6d4c41" flatShading />
      </mesh>
    </group>
  );
}

function TrashObjects({
  trash,
  onCleanTrash,
}: {
  trash: Array<{ id: string; position: { x: number; y: number; z: number } }>;
  onCleanTrash: (id: string) => void;
}): JSX.Element {
  return (
    <>
      {trash.map((item) => (
        <mesh
          key={item.id}
          position={[item.position.x, 0.3, item.position.z]}
          onClick={(e) => {
            e.stopPropagation();
            onCleanTrash(item.id);
          }}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#c62828" flatShading />
        </mesh>
      ))}
    </>
  );
}

// Enhanced lighting with day/night cycle
function EnhancedLighting({ weather }: { weather: Weather }): JSX.Element {
  const hour = new Date().getHours();
  
  // Bright lighting as requested (ambient=1.2, directional=1.0)
  let ambientIntensity = 1.2;
  let directionalIntensity = 1.0;
  let directionalColor = '#fff5e6'; // Warm sunlight
  let skyColor = '#87ceeb'; // Light blue day
  
  // Day/night cycle
  if (hour >= 6 && hour < 18) {
    // Day: Bright and warm
    ambientIntensity = 1.2;
    directionalIntensity = 1.0;
    directionalColor = '#fff5e6';
    skyColor = '#87ceeb';
  } else {
    // Night: Dim and cool
    ambientIntensity = 0.6;
    directionalIntensity = 0.5;
    directionalColor = '#b3d4fc';
    skyColor = '#1a237e';
  }
  
  // Weather adjustments
  if (weather === 'cloudy') {
    directionalIntensity *= 0.85;
    skyColor = '#b0bec5';
  }
  if (weather === 'rain') {
    directionalIntensity *= 0.75;
    skyColor = '#78909c';
  }
  
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={directionalIntensity}
        color={directionalColor}
      />
      <hemisphereLight args={[skyColor, '#7cb342', 0.3]} />
    </>
  );
}

// Rain particles for weather effect
function RainParticles(): JSX.Element {
  const particleCount = 50; // Reduced for stability
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20 + 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#4fc3f7" transparent opacity={0.6} />
    </points>
  );
}

// Placed decorations from game state
function PlacedDecorations({ decorations }: { decorations: any[] }): JSX.Element {
  return (
    <>
      {decorations.map((deco) => {
        const { type, position, id } = deco;
        
        if (type === 'SmallFlower') {
          return (
            <group key={id} position={[position.x, 0.2, position.z]}>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
                <meshStandardMaterial color="#4caf50" flatShading />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshStandardMaterial color="#ff69b4" flatShading />
              </mesh>
            </group>
          );
        }
        
        if (type === 'Bush') {
          return (
            <mesh key={id} position={[position.x, 0.3, position.z]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color="#66bb6a" flatShading />
            </mesh>
          );
        }
        
        if (type === 'Rock') {
          return (
            <mesh key={id} position={[position.x, 0.25, position.z]}>
              <dodecahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color="#9e9e9e" flatShading />
            </mesh>
          );
        }
        
        if (type === 'Bench') {
          return (
            <group key={id} position={[position.x, 0.3, position.z]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 0.1, 0.4]} />
                <meshStandardMaterial color="#8d6e63" flatShading />
              </mesh>
              <mesh position={[-0.4, -0.15, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#6d4c41" flatShading />
              </mesh>
              <mesh position={[0.4, -0.15, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#6d4c41" flatShading />
              </mesh>
            </group>
          );
        }
        
        if (type === 'Lantern') {
          return (
            <group key={id} position={[position.x, 0.5, position.z]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />
                <meshStandardMaterial color="#ffd54f" emissive="#ff9800" emissiveIntensity={0.5} flatShading />
              </mesh>
              <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.3, 4]} />
                <meshStandardMaterial color="#424242" flatShading />
              </mesh>
            </group>
          );
        }
        
        if (type === 'Fence') {
          return (
            <group key={id} position={[position.x, 0.3, position.z]}>
              <mesh position={[-0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.6, 0.1]} />
                <meshStandardMaterial color="#8d6e63" flatShading />
              </mesh>
              <mesh position={[0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.6, 0.1]} />
                <meshStandardMaterial color="#8d6e63" flatShading />
              </mesh>
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.8, 0.05, 0.05]} />
                <meshStandardMaterial color="#6d4c41" flatShading />
              </mesh>
            </group>
          );
        }
        
        return null;
      })}
    </>
  );
}

// NFT glow effect for minted trees
function NFTGlow({ position }: { position: [number, number, number] }): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    let frame = 0;
    const animate = () => {
      if (meshRef.current) {
        frame += 0.02;
        meshRef.current.rotation.y = frame;
        meshRef.current.position.y = position[1] + Math.sin(frame * 2) * 0.1;
      }
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [position]);
  
  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1.2, 0.05, 8, 32]} />
      <meshStandardMaterial color="#ffd700" emissive="#ffeb3b" emissiveIntensity={0.8} />
    </mesh>
  );
}

function SceneContent({
  gameState,
  onTerrainClick,
  onTreeClick,
  onCleanTrash,
  weather,
  plantMode,
  placementPreview,
  selectedObjectId,
  isEditMode,
  plantingTreeIds,
  cuttingTreeIds,
  setPreviewVisualSeed,
  setPreviewSpecies,
  showCoordinateDebug,
  onDebugHover,
  onDebugClick,
}: {
  gameState: GameStateData;
  onTerrainClick: (x: number, z: number) => void;
  onTreeClick: (treeId: string) => void;
  onCleanTrash: (id: string) => void;
  weather: Weather;
  plantMode: boolean;
  placementPreview?: {
    position: { x: number; y: number; z: number } | null;
    rotation: number;
    type: 'tree' | 'furniture';
    isValid: boolean;
    treeType?: SeedTier;
    furnitureType?: string;
    terrainNormal?: any;
  };
  selectedObjectId?: string | null;
  isEditMode?: boolean;
  plantingTreeIds: Set<string>;
  cuttingTreeIds: Set<string>;
  setPreviewVisualSeed: (seed: number) => void;
  setPreviewSpecies: (species: string) => void;
  showCoordinateDebug: boolean;
  onDebugHover?: (x: number, y: number, z: number) => void;
  onDebugClick?: (x: number, y: number, z: number) => void;
}): JSX.Element {
  const { scene } = useThree();
  const hour = new Date().getHours();
  
  // Dynamic sky color based on time
  useEffect(() => {
    let skyColor = '#87ceeb';
    
    if (hour >= 6 && hour < 18) {
      skyColor = '#87ceeb'; // Day
    } else {
      skyColor = '#1a237e'; // Night
    }
    
    if (weather === 'cloudy') skyColor = '#b0bec5';
    if (weather === 'rain') skyColor = '#78909c';
    
    scene.background = new THREE.Color(skyColor);
    
    return () => {
      scene.background = null;
    };
  }, [scene, weather, hour]);
  
  return (
    <>
      <EnhancedLighting weather={weather} />
      
      {/* Environment */}
      <EnhancedTerrain onTerrainClick={({ x, y, z }) => onTerrainClick(x, z)} />
      
      {/* Procedural grass around trees */}
      <ProceduralGrass 
        treePositions={gameState.trees?.map(t => t.position) || []}
        treeSeeds={gameState.trees?.map(t => (t.metadata?.visualSeed as number) || undefined) || []}
        density={6}
      />
      <Lake />
      <Rocks />
      <Flowers />
      <Bridge />
      
      {/* Placed decorations */}
      <PlacedDecorations decorations={gameState.decorations} />
      
      {/* Placed furniture */}
      {gameState.furniturePackState?.ownedFurniture
        .filter(f => f.placed && f.position)
        .map(furniture => (
          <PlacedFurniture 
            key={furniture.id} 
            furniture={furniture}
            onFurnitureClick={(id) => {
              console.log('🪑 Furniture clicked:', id);
              // Open furniture inventory to show details
              const clickedFurniture = gameState.furniturePackState?.ownedFurniture.find(f => f.id === id);
              if (clickedFurniture) {
                showNotification(`🪑 ${clickedFurniture.name} (${clickedFurniture.rarity})`);
              }
            }}
          />
        ))}
      
      {/* Placement preview */}
      {placementPreview && placementPreview.position && (
        <PlacementPreview
          position={placementPreview.position}
          rotation={placementPreview.rotation}
          type={placementPreview.type}
          isValid={placementPreview.isValid}
          treeType={placementPreview.treeType}
          furnitureType={placementPreview.furnitureType}
          terrainNormal={placementPreview.terrainNormal}
          onVisualSeedGenerated={(seed, species) => {
            setPreviewVisualSeed(seed);
            setPreviewSpecies(species);
          }}
        />
      )}
      
      {/* Selection highlight for edit mode */}
      {isEditMode && selectedObjectId && (() => {
        const selectedTree = gameState.trees.find(t => t.id === selectedObjectId);
        if (selectedTree) {
          return <SelectionHighlight position={selectedTree.position} />;
        }
        const selectedFurniture = gameState.furniturePackState?.ownedFurniture.find(f => f.id === selectedObjectId);
        if (selectedFurniture && selectedFurniture.position) {
          return <SelectionHighlight position={selectedFurniture.position} />;
        }
        return null;
      })()}
      
      {/* Trees with NFT glows and animations */}
      {gameState.trees.slice(0, MAX_TREES).map((tree: TreeData) => {
        const isPlanting = plantingTreeIds.has(tree.id);
        const isCutting = cuttingTreeIds.has(tree.id);
        const animationType = isPlanting ? 'planting' : isCutting ? 'cutting' : 'none';
        
        return (
          <group key={tree.id}>
            <Tree
              tree={tree}
              onClick={() => onTreeClick(tree.id)}
              animationType={animationType}
              onAnimationComplete={() => {
                if (isPlanting) {
                  setPlantingTreeIds(prev => {
                    const next = new Set(prev);
                    next.delete(tree.id);
                    return next;
                  });
                } else if (isCutting) {
                  setCuttingTreeIds(prev => {
                    const next = new Set(prev);
                    next.delete(tree.id);
                    return next;
                  });
                }
              }}
            />
            {tree.isMinted && (
              <NFTGlow position={[tree.position.x, 1, tree.position.z]} />
            )}
          </group>
        );
      })}
      
      {/* Trash */}
      <TrashObjects trash={gameState.trash} onCleanTrash={onCleanTrash} />
      
      {/* Weather effects */}
      {weather === 'rain' && <RainParticles />}
      
      {/* Coordinate Debug Tool */}
      <CoordinateDebugTool
        enabled={showCoordinateDebug}
        onTerrainHover={onDebugHover}
        onTerrainClick={onDebugClick}
        gridSize={50}
        gridDivisions={50}
      />
      
      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enableDamping={false}
        enablePan={false}
        minDistance={15}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export function StableForest(): JSX.Element {
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [showPlantMenu, setShowPlantMenu] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; z: number } | null>(null);
  const [weather, setWeather] = useState<Weather>('sunny');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');
  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [showTreeInventory, setShowTreeInventory] = useState<boolean>(false);
  const [showDebugTreeGrowth, setShowDebugTreeGrowth] = useState<boolean>(false);
  const [showVisualDebug, setShowVisualDebug] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showVisitForests, setShowVisitForests] = useState<boolean>(false);
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [showSeedMarket, setShowSeedMarket] = useState<boolean>(false);
  const [showSeedInventory, setShowSeedInventory] = useState<boolean>(false);
  const [showMarketplace, setShowMarketplace] = useState<boolean>(false);
  const [showBuildingLogs, setShowBuildingLogs] = useState<boolean>(false);
  const [showWorkshop, setShowWorkshop] = useState<boolean>(false);
  const [showFurnitureInventory, setShowFurnitureInventory] = useState<boolean>(false);
  const [packOpening, setPackOpening] = useState<{ packName: string; packEmoji: string; furniture: FurnitureData[] } | null>(null);
  const [choppingTreeId, setChoppingTreeId] = useState<string | null>(null);
  const [treeToChop, setTreeToChop] = useState<TreeData | null>(null);
  
  // Lock system to prevent double-chopping
  const chopLockRef = useRef<Record<string, boolean>>({});
  const [furniturePlacementMode, setFurniturePlacementMode] = useState<boolean>(false);
  const [selectedFurnitureToPlace, setSelectedFurnitureToPlace] = useState<string | null>(null);
  
  // NEW: Plant mode state
  const [plantMode, setPlantMode] = useState<boolean>(false);
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<string | null>(null);
  
  // NEW: Visual seed tracking from preview
  const [previewVisualSeed, setPreviewVisualSeed] = useState<number | null>(null);
  const [previewSpecies, setPreviewSpecies] = useState<string | null>(null);
  
  // NEW: Animation tracking
  const [plantingTreeIds, setPlantingTreeIds] = useState<Set<string>>(new Set());
  const [cuttingTreeIds, setCuttingTreeIds] = useState<Set<string>>(new Set());
  
  // NEW: Tree move mode state
  const [treeMoveMode, setTreeMoveMode] = useState<boolean>(false);
  const [selectedTreeToMove, setSelectedTreeToMove] = useState<string | null>(null);
  
  // Coordinate debug tool state
  const [showCoordinateDebug, setShowCoordinateDebug] = useState<boolean>(false);
  const [debugCursorPosition, setDebugCursorPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [debugClickedPosition, setDebugClickedPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  
  // Terrain mesh ref for placement system
  const terrainMeshRef = useRef<THREE.Mesh>(null);
  
  // Initialize placement system
  const placementSystem = usePlacementSystem({
    onPlaceTree: (position, rotation, seedId, visualSeed, species) => {
      console.log('✅ onPlaceTree callback triggered:', { position, rotation, seedId, visualSeed, species });
      
      // Store visual seed and species for consistent planting
      if (visualSeed !== undefined) setPreviewVisualSeed(visualSeed);
      if (species) setPreviewSpecies(species);
      
      // Call planting handler - seed will be consumed only on success
      const success = handlePlantSeedAtPosition(seedId, position.x, position.z);
      if (success) {
        console.log('🌱 Tree planted successfully!');
      } else {
        console.warn('❌ Failed to plant tree');
      }
    },
    onPlaceFurniture: (position, rotation, furnitureId) => {
      console.log('🪑 onPlaceFurniture callback triggered:', { position, rotation, furnitureId });
      // Place furniture using existing handler
      handleFurniturePlacement(position.x, position.z);
    },
    terrainMeshRef,
    existingTrees: gameState?.trees?.map(t => ({
      id: t.id,
      type: 'tree' as const,
      position: { x: t.position.x, y: 0, z: t.position.z },
      rotation: 0,
    })) || [],
    existingFurniture: gameState?.furniturePackState?.ownedFurniture
      ?.filter(f => f.placed && f.position)
      ?.map(f => ({
        id: f.id,
        type: 'furniture' as const,
        position: { x: f.position!.x, y: 0, z: f.position!.z },
        rotation: f.rotation || 0,
      })) || [],
  });
  
  // Load game state on mount with safe error handling
  useEffect(() => {
    try {
      const state = loadGameState();
      if (state) {
        // Additional safety: ensure all arrays exist
        state.trees = Array.isArray(state.trees) ? state.trees : [];
        state.decorations = Array.isArray(state.decorations) ? state.decorations : [];
        state.trash = Array.isArray(state.trash) ? state.trash : [];
        state.missions = Array.isArray(state.missions) ? state.missions : [];
        state.nfts = Array.isArray(state.nfts) ? state.nfts : [];
        
        // Initialize seed pack state if missing
        if (!state.seedPackState) {
          state.seedPackState = {
            ownedSeeds: [],
            packsOpened: 0,
            totalSeedsObtained: 0,
            lastPackOpenedAt: null,
          };
        }
        
        // Initialize furniture pack state if missing
        if (!state.furniturePackState) {
          state.furniturePackState = {
            ownedFurniture: [],
            packsOpened: 0,
            totalFurnitureObtained: 0,
            lastPackOpenedAt: null,
          };
        }
        
        setGameState(state);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
      setNotification('Failed to load game. Refresh to start new.');
    }
  }, []);
  
  // Save game state whenever it changes
  useEffect(() => {
    if (gameState) {
      try {
        saveGameState(gameState);
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    }
  }, [gameState]);
  
  // Auto-refresh growth every 10 seconds
  useEffect(() => {
    if (!gameState) return;
    
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        
        const trees = Array.isArray(prev.trees) ? prev.trees : [];
        
        return {
          ...prev,
          trees: trees.map((tree: TreeData) => ({
            ...tree,
            growthStage: calculateGrowthStage(
              tree.plantedAt,
              tree.species,
              tree.wateringBonusPercent || 0,
              tree.tier
            ),
          })),
        };
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);
  
  const handleTerrainClick = useCallback((x: number, z: number) => {
    if (!gameState) return;
    
    console.log('🌍 handleTerrainClick', { x, z, isPlacing: placementSystem.isPlacing, selectedSeedToPlant, treeMoveMode, selectedTreeToMove });
    console.log('placementState', { 
      mode: placementSystem.placementState.mode,
      isValid: placementSystem.placementState.isValidPlacement,
      previewPos: placementSystem.placementState.previewPosition 
    });
    
    // Handle tree move mode
    if (treeMoveMode && selectedTreeToMove) {
      handleMoveTreeToPosition(selectedTreeToMove, x, z);
      return;
    }
    
    // If placement system is active, update preview and confirm on click
    if (placementSystem.isPlacing) {
      try {
        // Update preview position
        placementSystem.updatePreview({ x, y: 0, z });
        
        // Check if placement is valid
        if (!placementSystem.placementState.isValidPlacement) {
          showNotification('❌ Invalid placement location');
          console.warn('Invalid placement - too close to objects or in water');
          return;
        }
        
        // Confirm placement - this triggers onPlaceTree callback
        console.log('✅ confirmPlacement called');
        placementSystem.confirmPlacement();
        return;
      } catch (err) {
        console.error('Placement confirm error', err);
        showNotification('Placement error. Check console.');
        placementSystem.cancelPlacement();
        return;
      }
    }
    
    // Handle furniture placement mode (existing logic)
    if (furniturePlacementMode && selectedFurnitureToPlace) {
      handleFurniturePlacement(x, z);
      return;
    }
    
    // If not placing but in plantMode with seed selected, start placement
    if (plantMode && selectedSeedToPlant && !placementSystem.isPlacing) {
      const seed = gameState.seedPackState?.ownedSeeds.find(s => s.id === selectedSeedToPlant);
      if (!seed) {
        showNotification('Seed not available.');
        return;
      }
      console.log('🌱 Starting placement for seed:', seed.tier);
      placementSystem.startTreePlacement(selectedSeedToPlant, seed.tier as SeedTier);
      showNotification('Placement started: click to place. R to rotate, ESC to cancel.');
      return;
    }
    
    // Otherwise ignore clicks when not in any mode
    console.log('⚠️ Click ignored - not in placement or plant mode');
  }, [gameState, showNotification, plantMode, selectedSeedToPlant, furniturePlacementMode, selectedFurnitureToPlace, treeMoveMode, selectedTreeToMove, placementSystem]);
  
  const handlePlantSeed = useCallback((species: TreeSpecies) => {
    if (!gameState || !selectedPosition) return;
    
    const cost = getSeedCost(species);
    
    if (!canAffordSeed(gameState.ecoPoints, species)) {
      showNotification(`Not enough eco-points! Need ${cost}.`);
      return;
    }
    
    if (gameState.trees.length >= MAX_TREES) {
      showNotification(`Maximum ${MAX_TREES} trees reached!`);
      return;
    }
    
    const newTree: TreeData = {
      id: 'tree_' + Date.now(),
      species,
      position: { x: selectedPosition.x, y: 0, z: selectedPosition.z },
      plantedAt: Date.now(),
      lastWatered: null,
      growthStage: 'seed',
      wateringBonusPercent: 0,
      isMinted: false,
      mintedAt: null,
    };
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints - cost,
      trees: [...(Array.isArray(gameState.trees) ? gameState.trees : []), newTree],
      stats: {
        ...gameState.stats,
        treesPlanted: gameState.stats.treesPlanted + 1,
      },
      missions: Array.isArray(gameState.missions) ? gameState.missions.map(m =>
        m.type === 'plant' && !m.completed
          ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target }
          : m
      ) : [],
    });
    
    setShowPlantMenu(false);
    setSelectedPosition(null);
    showNotification(`🌱 Planted ${species} tree!`);
  }, [gameState, selectedPosition, showNotification]);
  
  const handleTreeClick = useCallback((treeId: string) => {
    if (!gameState) return;
    
    const trees = Array.isArray(gameState.trees) ? gameState.trees : [];
    const tree = trees.find((t: TreeData) => t.id === treeId);
    if (!tree) return;
    
    // Open tree details popup
    setSelectedTree(tree);
  }, [gameState]);
  
  const handleWaterTree = useCallback((treeId: string) => {
    if (!gameState) return;
    
    const trees = Array.isArray(gameState.trees) ? gameState.trees : [];
    const tree = trees.find((t: TreeData) => t.id === treeId);
    if (!tree) return;
    
    // Check if can water
    const now = Date.now();
    const lastWateredTime = tree.lastWatered || 0;
    const hoursSinceWatering = (now - lastWateredTime) / (1000 * 60 * 60);
    
    if (hoursSinceWatering < 24) {
      const hoursLeft = Math.ceil(24 - hoursSinceWatering);
      showNotification(`Tree already watered! Wait ${hoursLeft}h`);
      return;
    }
    
    // Water the tree
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints + 2,
      trees: Array.isArray(gameState.trees) ? gameState.trees.map(t =>
        t.id === treeId
          ? {
              ...t,
              lastWatered: now,
              wateringBonusPercent: t.wateringBonusPercent + 10,
            }
          : t
      ) : [],
      stats: {
        ...gameState.stats,
        treesWatered: gameState.stats.treesWatered + 1,
      },
      missions: gameState.missions.map(m =>
        m.type === 'water' && !m.completed
          ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target }
          : m
      ),
    });
    
    setSelectedTree(null);
    showNotification('💧 Tree watered! +2 eco-points');
  }, [gameState, showNotification]);
  
  const handleCleanTrash = useCallback((trashId: string) => {
    if (!gameState) return;
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints + 5,
      trash: gameState.trash.filter((t) => t.id !== trashId),
      stats: {
        ...gameState.stats,
        trashCleaned: gameState.stats.trashCleaned + 1,
      },
      missions: gameState.missions.map(m =>
        m.type === 'clean' && !m.completed
          ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target }
          : m
      ),
    });
    
    showNotification('🗑️ Trash cleaned! +5 eco-points');
  }, [gameState, showNotification]);
  
  const handleBuyDecoration = useCallback((type: DecorationType) => {
    if (!gameState) return;
    
    const cost = getDecorationCost(type);
    
    if (!canAffordDecoration(gameState.ecoPoints, type)) {
      showNotification(`Not enough eco-points! Need ${cost}.`);
      return;
    }
    
    // Find random valid position
    const x = (Math.random() - 0.5) * 16;
    const z = (Math.random() - 0.5) * 16;
    
    const newDecoration: DecorationData = {
      id: 'deco_' + Date.now(),
      type,
      position: { x, y: 0, z },
      placedAt: Date.now(),
    };
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints - cost,
      decorations: [...(Array.isArray(gameState.decorations) ? gameState.decorations : []), newDecoration],
    });
    
    showNotification(`🎨 ${type} placed!`);
  }, [gameState, showNotification]);
  
  const handleMintNFT = useCallback((treeId: string) => {
    if (!gameState) return;
    
    const tree = gameState.trees.find(t => t.id === treeId);
    if (!tree || tree.isMinted || tree.growthStage !== 'mature') {
      showNotification('Cannot mint this tree');
      return;
    }
    
    // Mock NFT mint using mockAPI
    const result = mockAPI.mintNFT(treeId);
    
    if (result.success) {
      setGameState({
        ...gameState,
        trees: Array.isArray(gameState.trees) ? gameState.trees.map(t =>
          t.id === treeId
            ? { ...t, isMinted: true, mintedAt: Date.now() }
            : t
        ) : [],
        nfts: [
          ...(Array.isArray(gameState.nfts) ? gameState.nfts : []),
          {
            treeId,
            tokenId: result.tokenId,
            mintedAt: Date.now(),
            txHash: result.txHash,
          },
        ],
        stats: {
          ...gameState.stats,
          nftsMinted: gameState.stats.nftsMinted + 1,
        },
      });
      
      setSelectedTree(null);
      showNotification('✨ Tree minted as NFT!');
    }
  }, [gameState, showNotification]);
  
  const handleClaimMission = useCallback((missionId: string) => {
    if (!gameState) return;
    
    const missions = Array.isArray(gameState.missions) ? gameState.missions : [];
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;
    
    const updates: Partial<GameStateData> = {
      ecoPoints: gameState.ecoPoints + mission.reward.ecoPoints,
      missions: missions.map(m =>
        m.id === missionId ? { ...m, claimed: true } : m
      ),
    };
    
    // Add decoration reward if any
    if (mission.reward.decoration) {
      const x = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16;
      
      const newDecoration: DecorationData = {
        id: 'deco_reward_' + Date.now(),
        type: mission.reward.decoration,
        position: { x, y: 0, z },
        placedAt: Date.now(),
      };
      
      updates.decorations = [...gameState.decorations, newDecoration];
    }
    
    setGameState({ ...gameState, ...updates } as GameStateData);
    showNotification(`✅ Mission claimed! +${mission.reward.ecoPoints} eco-points`);
  }, [gameState, showNotification]);
  
  const handleBuySeedPack = useCallback((packType: PackType, revealedSeeds: SeedData[]) => {
    if (!gameState || !gameState.seedPackState) return;
    
    const pack = PACK_DEFINITIONS[packType];
    
    if (gameState.ecoPoints < pack.cost) {
      showNotification(`Not enough eco-points! Need ${pack.cost}.`);
      return;
    }
    
    // Use the seeds that were already generated (no second call!)
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints - pack.cost,
      seedPackState: {
        ownedSeeds: [...gameState.seedPackState.ownedSeeds, ...revealedSeeds],
        packsOpened: gameState.seedPackState.packsOpened + 1,
        totalSeedsObtained: gameState.seedPackState.totalSeedsObtained + revealedSeeds.length,
        lastPackOpenedAt: Date.now(),
      },
    });
    
    showNotification(`📦 Opened ${pack.name}! Got ${revealedSeeds.length} seeds!`);
  }, [gameState, showNotification]);
  
  const handleCutDownTree = useCallback(async (treeId: string) => {
    if (!gameState) {
      console.error('❌ handleCutDownTree: No game state');
      return;
    }
    
    // Check lock - prevent double-chopping
    if (chopLockRef.current[treeId]) {
      console.warn('⚠️ handleCutDownTree: Tree is already being chopped', treeId);
      showNotification('❌ Tree is already being chopped!');
      return;
    }
    
    const tree = gameState.trees.find(t => t.id === treeId);
    
    // Validate tree
    const validation = canChopTree(tree);
    if (!validation.canChop) {
      console.warn('⚠️ handleCutDownTree: Validation failed', validation.reason);
      showNotification(`❌ ${validation.reason}`);
      return;
    }
    
    if (!tree) {
      console.error('❌ handleCutDownTree: Tree not found after validation');
      return;
    }
    
    console.log('🪓 handleCutDownTree: Starting chop process', {
      treeId,
      species: tree.species,
      tier: tree.tier,
      growthStage: tree.growthStage,
      position: tree.position,
      ageInHours: ((Date.now() - tree.plantedAt) / (1000 * 60 * 60)).toFixed(2),
      plantedAt: new Date(tree.plantedAt).toISOString(),
    });
    
    // Show confirmation modal
    setTreeToChop(tree);
  }, [gameState, showNotification]);
  
  const handleConfirmChop = useCallback(async () => {
    if (!gameState || !treeToChop) return;
    
    const treeId = treeToChop.id;
    
    try {
      // Acquire lock
      chopLockRef.current[treeId] = true;
      console.log('🔒 Chop lock acquired for tree:', treeId);
      
      // Close confirmation modal
      setTreeToChop(null);
      
      // Start chopping animation
      setChoppingTreeId(treeId);
      setCuttingTreeIds(prev => new Set(prev).add(treeId));
      console.log('🎬 Starting chopping animation for tree:', treeId);
      
      // Wait for animation to complete (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      console.log('✅ Chopping animation complete');
      
      // Execute atomic chop operation
      const result = executeChopTree(gameState, treeId);
      
      if (!result.success) {
        console.error('❌ Chop operation failed:', result.error);
        showNotification(`❌ Chop failed: ${result.error}`);
        
        // Clear chopping animation
        setChoppingTreeId(null);
        setCuttingTreeIds(prev => {
          const next = new Set(prev);
          next.delete(treeId);
          return next;
        });
        return;
      }
      
      // Success - update state
      if (result.newState && result.logsGained !== undefined) {
        console.log('✅ Chop operation successful', {
          logsGained: result.logsGained,
          newTreeCount: result.newState.trees.length,
          newBuildingLogs: result.newState.buildingLogs,
        });
        
        setGameState(result.newState);
        
        // Clear chopping animation
        setChoppingTreeId(null);
        setCuttingTreeIds(prev => {
          const next = new Set(prev);
          next.delete(treeId);
          return next;
        });
        
        // Close tree details if open
        setSelectedTree(null);
        
        // Show success notification
        showNotification(`🪓 ${treeToChop.species} cut down! +${result.logsGained} Building Logs 🪵`);
      }
    } catch (error) {
      console.error('❌ handleConfirmChop: Unexpected error', error);
      showNotification('❌ An error occurred while chopping the tree');
      
      // Clear animation on error
      setChoppingTreeId(null);
    } finally {
      // Always release lock
      chopLockRef.current[treeId] = false;
      console.log('🔓 Chop lock released for tree:', treeId);
    }
  }, [gameState, treeToChop, showNotification]);
  
  const handleCancelChop = useCallback(() => {
    console.log('🚫 Tree chop cancelled by user');
    setTreeToChop(null);
  }, []);
  
  // Marketplace handlers (mock implementations)
  const handleListTree = useCallback((treeId: string, price: number) => {
    showNotification(`Tree listed for ${price} eco-points!`);
    setShowMarketplace(false);
  }, [showNotification]);
  
  const handleStartAuction = useCallback((treeId: string, startingBid: number, duration: number) => {
    showNotification(`Auction started at ${startingBid} eco-points!`);
    setShowMarketplace(false);
  }, [showNotification]);
  
  const handleBuyTree = useCallback((listingId: string) => {
    showNotification('Tree purchased! (mock)');
  }, [showNotification]);
  
  const handlePlaceBid = useCallback((auctionId: string, amount: number) => {
    showNotification(`Bid placed: ${amount} eco-points! (mock)`);
  }, [showNotification]);
  
  const handleSelectSeedFromInventory = useCallback((seedId: string) => {
    if (!gameState || !gameState.seedPackState) return;
    
    const seed = gameState.seedPackState.ownedSeeds.find(s => s.id === seedId);
    if (!seed || seed.planted) {
      showNotification('Seed not available!');
      return;
    }
    
    // NEW: Set the selected seed, close inventory, and start placement system
    setSelectedSeedToPlant(seedId);
    setShowSeedInventory(false);
    
    // Start placement system for tree preview
    placementSystem.startTreePlacement(seedId, seed.tier as SeedTier);
    
    showNotification(`🌱 ${seed.tier} selected! Move cursor to see preview. Click to plant, R to rotate, ESC to cancel.`);
  }, [gameState, showNotification, placementSystem]);
  
  const handlePlantSeedAtPosition = useCallback((seedId: string, x: number, z: number): boolean => {
    try {
      if (!gameState?.seedPackState) {
        console.error('Game state or seed pack state missing');
        return false;
      }
      
      const seed = gameState.seedPackState.ownedSeeds.find(s => s.id === seedId);
      if (!seed || seed.planted) {
        showNotification('Seed not available!');
        return false;
      }
      
      // Validate tree limit
      if ((gameState.trees?.length || 0) >= MAX_TREES) {
        showNotification(`Maximum ${MAX_TREES} trees reached!`);
        return false;
      }
      
      // Get tier info
      const tierInfo = SEED_TIER_INFO[seed.tier as SeedTier];
      
      // Generate or use preview visual seed for consistent appearance
      const visualSeed = previewVisualSeed || Math.floor(Math.random() * 1000000);
      const treeSpecies = (previewSpecies || seed.species) as TreeSpecies;
      
      // Use seed species name for the tree (preserve rarity and identity)
      const newTree: TreeData = {
        id: 'tree_' + Date.now(),
        species: treeSpecies, // Use seed's species name or preview species
        position: { x, y: 0, z },
        plantedAt: Date.now(),
        lastWatered: null,
        growthStage: 'seed',
        wateringBonusPercent: 0,
        isMinted: false,
        mintedAt: null,
        seedId: seed.id,
        tier: seed.tier, // Preserve tier for rarity display and Building Log yields
        metadata: {
          visualSeed, // Store visual seed for consistent rendering
          tier: seed.tier,
        },
      };
      
      setGameState({
        ...gameState,
        trees: [...(Array.isArray(gameState.trees) ? gameState.trees : []), newTree],
        seedPackState: {
          ...gameState.seedPackState,
          ownedSeeds: gameState.seedPackState.ownedSeeds.map(s =>
            s.id === seedId ? { ...s, planted: true } : s
          ),
        },
        stats: {
          ...gameState.stats,
          treesPlanted: gameState.stats.treesPlanted + 1,
        },
        missions: Array.isArray(gameState.missions) ? gameState.missions.map(m =>
          m.type === 'plant' && !m.completed
            ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target }
            : m
        ) : [],
      });
      
      // Track planting animation
      setPlantingTreeIds(prev => new Set(prev).add(newTree.id));
      
      // Clear animation after it completes (1.2s)
      setTimeout(() => {
        setPlantingTreeIds(prev => {
          const next = new Set(prev);
          next.delete(newTree.id);
          return next;
        });
      }, 1200);
      
      // Clear plant mode state and preview tracking
      setPlantMode(false);
      setSelectedSeedToPlant(null);
      setPreviewVisualSeed(null);
      setPreviewSpecies(null);
      
      showNotification(`✅ Planting Successful! ${seed.tier} ${seed.species} planted!`);
      return true;
    } catch (err) {
      console.error('handlePlantSeedAtPosition error', err);
      return false;
    }
  }, [gameState, showNotification]);

  // Workshop handlers
  const handleBuyFurniturePack = useCallback((packType: FurniturePackType) => {
    if (!gameState || !gameState.furniturePackState) return;
    
    const pack = FURNITURE_PACK_DEFINITIONS[packType];
    
    if (gameState.buildingLogs < pack.cost) {
      showNotification(`Not enough building logs! Need ${pack.cost}.`);
      return;
    }
    
    // Open the pack
    const isLimited = pack.isLimited && pack.limitedUntil && Date.now() < pack.limitedUntil;
    const newFurniture = openFurniturePack(packType, isLimited);
    
    // ✅ VALIDATION: Check if pack opening succeeded
    if (!newFurniture || newFurniture.length === 0) {
      console.error('❌ Furniture pack failed to open or returned no items');
      showNotification('⚠️ Failed to open furniture pack. No logs deducted.');
      return;  // Exit early - no state changes!
    }
    
    // ✅ VALIDATION: Check if furniture items are valid
    const hasInvalidItems = newFurniture.some(f => !f.id || !f.name || !f.rarity);
    if (hasInvalidItems) {
      console.error('❌ Pack contains invalid furniture items:', newFurniture);
      showNotification('⚠️ Pack contained invalid items. No logs deducted.');
      return;
    }
    
    // Only proceed if validation passed
    setGameState({
      ...gameState,
      buildingLogs: gameState.buildingLogs - pack.cost,
      furniturePackState: {
        ownedFurniture: [...gameState.furniturePackState.ownedFurniture, ...newFurniture],
        packsOpened: gameState.furniturePackState.packsOpened + 1,
        totalFurnitureObtained: gameState.furniturePackState.totalFurnitureObtained + newFurniture.length,
        lastPackOpenedAt: Date.now(),
      },
    });
    
    // Show pack opening animation
    setPackOpening({
      packName: pack.name,
      packEmoji: pack.emoji,
      furniture: newFurniture,
    });
    
    setShowWorkshop(false);
  }, [gameState, showNotification]);

  const handlePlaceFurniture = useCallback((furnitureId: string) => {
    if (!gameState || !gameState.furniturePackState) return;
    
    const furniture = gameState.furniturePackState.ownedFurniture.find(f => f.id === furnitureId);
    if (!furniture || furniture.placed) {
      showNotification('Furniture not available!');
      return;
    }
    
    // Enter placement mode
    setSelectedFurnitureToPlace(furnitureId);
    setFurniturePlacementMode(true);
    setShowFurnitureInventory(false);
    showNotification('🏡 Click anywhere in the forest to place your furniture!');
  }, [gameState, showNotification]);

  const handleFurniturePlacement = useCallback((x: number, z: number) => {
    if (!gameState || !gameState.furniturePackState || !selectedFurnitureToPlace) return;
    
    const furniture = gameState.furniturePackState.ownedFurniture.find(f => f.id === selectedFurnitureToPlace);
    if (!furniture || furniture.placed) {
      showNotification('Furniture not available!');
      return;
    }
    
    // Update furniture state
    setGameState({
      ...gameState,
      furniturePackState: {
        ...gameState.furniturePackState,
        ownedFurniture: gameState.furniturePackState.ownedFurniture.map(f =>
          f.id === selectedFurnitureToPlace
            ? { ...f, placed: true, placedAt: Date.now(), position: { x, y: 0, z } }
            : f
        ),
      },
    });
    
    // Clear placement mode
    setFurniturePlacementMode(false);
    setSelectedFurnitureToPlace(null);
    
    showNotification(`✅ ${furniture.name} placed!`);
  }, [gameState, selectedFurnitureToPlace, showNotification]);

  const handleSellFurniture = useCallback((furnitureId: string) => {
    if (!gameState || !gameState.furniturePackState) return;
    
    const furniture = gameState.furniturePackState.ownedFurniture.find(f => f.id === furnitureId);
    if (!furniture || furniture.placed) {
      showNotification('Cannot sell placed furniture!');
      return;
    }
    
    // Remove furniture and add eco-points
    const rarityInfo = require('@/lib/furniture-system').FURNITURE_RARITY_INFO[furniture.rarity];
    const sellPrice = rarityInfo.marketValue;
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints + sellPrice,
      furniturePackState: {
        ...gameState.furniturePackState,
        ownedFurniture: gameState.furniturePackState.ownedFurniture.filter(f => f.id !== furnitureId),
      },
    });
    
    showNotification(`💰 Sold ${furniture.name} for ${sellPrice} eco-points!`);
  }, [gameState, showNotification]);

  const handleMoveTreeToPosition = useCallback((treeId: string, x: number, z: number) => {
    if (!gameState) return;
    
    const tree = gameState.trees.find(t => t.id === treeId);
    if (!tree) {
      showNotification('Tree not found!');
      return;
    }
    
    // Update tree position
    setGameState({
      ...gameState,
      trees: gameState.trees.map(t =>
        t.id === treeId
          ? { ...t, position: { x, y: 0, z } }
          : t
      ),
    });
    
    // Clear move mode
    setTreeMoveMode(false);
    setSelectedTreeToMove(null);
    
    showNotification(`✅ ${tree.species} tree moved to new location!`);
  }, [gameState, showNotification]);
  
  if (!gameState) {
    return (
      <div className="w-full h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-800 mb-2">Loading EcoForest...</div>
          <div className="text-green-600">Initializing forest scene</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 20, 20], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: false }} // Disable antialiasing for performance
      >
        <SceneContent
          gameState={gameState}
          onTerrainClick={handleTerrainClick}
          onTreeClick={handleTreeClick}
          onCleanTrash={handleCleanTrash}
          weather={weather}
          plantMode={plantMode}
          placementPreview={
            placementSystem.placementState.mode !== 'none'
              ? {
                  position: placementSystem.placementState.previewPosition,
                  rotation: placementSystem.placementState.previewRotation,
                  type: placementSystem.placementState.mode,
                  isValid: placementSystem.placementState.isValidPlacement,
                  treeType: placementSystem.placementState.selectedTreeType,
                  furnitureType: placementSystem.placementState.selectedFurnitureId,
                  terrainNormal: placementSystem.placementState.terrainNormal,
                }
              : undefined
          }
          selectedObjectId={placementSystem.placementState.selectedItemId}
          isEditMode={placementSystem.isEditMode}
          plantingTreeIds={plantingTreeIds}
          cuttingTreeIds={cuttingTreeIds}
          setPreviewVisualSeed={setPreviewVisualSeed}
          setPreviewSpecies={setPreviewSpecies}
          showCoordinateDebug={showCoordinateDebug}
          onDebugHover={(x, y, z) => setDebugCursorPosition({ x, y, z })}
          onDebugClick={(x, y, z) => {
            setDebugClickedPosition({ x, y, z });
            showNotification(`📍 Clicked: X=${x.toFixed(1)}, Z=${z.toFixed(1)}`);
          }}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <SelfContainedHUD
        gameState={gameState}
        weather={weather}
        onToggleWeather={() => {
          const weathers: Weather[] = ['sunny', 'cloudy', 'rain'];
          const currentIndex = weathers.indexOf(weather);
          setWeather(weathers[(currentIndex + 1) % weathers.length]);
        }}
        onOpenPlantMenu={() => {
          // NEW: Toggle plant mode and open seed inventory
          if (!plantMode) {
            setPlantMode(true);
            setShowSeedInventory(true);
            showNotification('🌱 Plant Mode Active! Select a seed, then click anywhere on the ground to plant.');
          } else {
            setPlantMode(false);
            setSelectedSeedToPlant(null);
            showNotification('Plant Mode Deactivated');
          }
        }}
        onToggleDebug={() => setShowDebug(!showDebug)}
        onOpenMissions={() => setShowMissions(true)}
        onOpenTreeInventory={() => setShowTreeInventory(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenVisitForests={() => setShowVisitForests(true)}
        onOpenSeedMarket={() => setShowSeedMarket(true)}
        onOpenSeedInventory={() => setShowSeedInventory(true)}
        onOpenMarketplace={() => setShowMarketplace(true)}
        onOpenBuildingLogs={() => setShowBuildingLogs(true)}
        onOpenWorkshop={() => setShowWorkshop(true)}
      />
      
      {/* Plant Menu */}
      {showPlantMenu && (
        <PlantMenu
          ecoPoints={gameState.ecoPoints}
          onPlant={handlePlantSeed}
          onClose={() => {
            setShowPlantMenu(false);
            setSelectedPosition(null);
          }}
        />
      )}
      
      {/* Tree Details Popup */}
      {selectedTree && (
        <TreeDetailsPopup
          tree={selectedTree}
          onMint={() => handleMintNFT(selectedTree.id)}
          onWater={() => handleWaterTree(selectedTree.id)}
          onCutDown={() => handleCutDownTree(selectedTree.id)}
          onMove={() => {
            setTreeMoveMode(true);
            setSelectedTreeToMove(selectedTree.id);
            showNotification('📍 Tree Move Mode Active! Click anywhere on the ground to move the tree.');
          }}
          onClose={() => setSelectedTree(null)}
        />
      )}
      
      {/* Tree Inventory */}
      {showTreeInventory && (
        <TreeInventory
          trees={gameState.trees}
          onClose={() => setShowTreeInventory(false)}
          onViewTree={handleTreeClick}
          onSellTree={(treeId) => {
            setShowTreeInventory(false);
            setShowMarketplace(true);
          }}
          onChopTree={handleCutDownTree}
        />
      )}
      
      {/* Debug Tree Growth */}
      {showDebugTreeGrowth && (
        <DebugTreeGrowth
          trees={gameState.trees}
          onGrowTree={(treeId, stage) => {
            setGameState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                trees: prev.trees.map((t) =>
                  t.id === treeId ? { ...t, growthStage: stage } : t
                ),
              };
            });
          }}
          onClose={() => setShowDebugTreeGrowth(false)}
        />
      )}
      
      {/* Visual Debug Panel */}
      {showVisualDebug && (
        <VisualDebugPanel
          trees={gameState.trees}
          onGrowTree={(treeId, stage) => {
            setGameState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                trees: prev.trees.map((t) =>
                  t.id === treeId ? { ...t, growthStage: stage } : t
                ),
              };
            });
          }}
          onRandomizeTreeVisual={(treeId, newSpecies, newTier) => {
            setGameState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                trees: prev.trees.map((t) =>
                  t.id === treeId
                    ? { ...t, species: newSpecies, tier: newTier }
                    : t
                ),
              };
            });
            showNotification(`🎨 Tree visual updated to ${newSpecies} (${newTier})`);
          }}
          onResetTree={(treeId) => {
            setGameState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                trees: prev.trees.map((t) =>
                  t.id === treeId
                    ? { ...t, growthStage: 'seed', plantedAt: Date.now() }
                    : t
                ),
              };
            });
            showNotification('🔄 Tree reset to seed stage');
          }}
          onClose={() => setShowVisualDebug(false)}
        />
      )}
      
      {/* Mission Board */}
      {showMissions && (
        <MissionBoard
          missions={gameState.missions}
          onClaim={handleClaimMission}
          onClose={() => setShowMissions(false)}
        />
      )}
      
      {/* Enhanced Leaderboard Panel */}
      {showLeaderboard && (
        <EnhancedLeaderboardPanel
          currentUser={gameState.username}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      
      {/* Visit Forests Panel */}
      {showVisitForests && (
        <VisitForestsPanel
          gameState={gameState}
          onClose={() => setShowVisitForests(false)}
          onVisit={(forestId) => {
            showNotification(`🌍 Visiting forest: ${forestId}`);
            // Note: In a full implementation, this would switch to a different scene
          }}
        />
      )}
      
      {/* Seed Market */}
      {showSeedMarket && (
        <SeedMarket
          ecoPoints={gameState.ecoPoints}
          onBuyPack={handleBuySeedPack}
          onClose={() => setShowSeedMarket(false)}
        />
      )}
      
      {/* Seed Inventory */}
      {showSeedInventory && gameState.seedPackState && (
        <SeedInventory
          seeds={gameState.seedPackState.ownedSeeds}
          onPlantSeed={handleSelectSeedFromInventory}
          onClose={() => {
            setShowSeedInventory(false);
            if (plantMode && !selectedSeedToPlant) {
              // User closed without selecting - exit plant mode
              setPlantMode(false);
              showNotification('🚫 Plant mode cancelled');
            }
          }}
          plantMode={plantMode}
        />
      )}
      
      {/* Marketplace */}
      {showMarketplace && (
        <Marketplace
          ecoPoints={gameState.ecoPoints}
          playerTrees={gameState.trees}
          playerName={gameState.username}
          onClose={() => setShowMarketplace(false)}
          onListTree={handleListTree}
          onStartAuction={handleStartAuction}
          onBuyTree={handleBuyTree}
          onPlaceBid={handlePlaceBid}
        />
      )}
      
      {/* Building Logs Panel */}
      {showBuildingLogs && (
        <BuildingLogsPanel
          buildingLogs={gameState.buildingLogs}
          onClose={() => setShowBuildingLogs(false)}
        />
      )}
      
      {/* Workshop (Merged with Decorations) */}
      {showWorkshop && gameState.furniturePackState && (
        <WorkshopMerged
          buildingLogs={gameState.buildingLogs}
          ownedFurniture={gameState.furniturePackState.ownedFurniture}
          onBuyPack={handleBuyFurniturePack}
          onPlaceFurniture={(furnitureId) => {
            setShowWorkshop(false);
            handlePlaceFurniture(furnitureId);
          }}
          onClose={() => setShowWorkshop(false)}
        />
      )}
      
      {/* Furniture Inventory */}
      {showFurnitureInventory && gameState.furniturePackState && (
        <FurnitureInventory
          furniture={gameState.furniturePackState.ownedFurniture}
          onPlace={handlePlaceFurniture}
          onSell={handleSellFurniture}
          onClose={() => setShowFurnitureInventory(false)}
        />
      )}
      
      {/* Pack Opening Modal */}
      {packOpening && (
        <PackOpeningModal
          packName={packOpening.packName}
          packEmoji={packOpening.packEmoji}
          obtainedFurniture={packOpening.furniture}
          onClose={() => setPackOpening(null)}
        />
      )}
      
      {/* Chopping Confirmation Modal */}
      {treeToChop && (
        <ChoppingConfirmationModal
          tree={treeToChop}
          expectedLogs={computeChopYield(treeToChop)}
          onConfirm={handleConfirmChop}
          onCancel={handleCancelChop}
        />
      )}
      
      {/* Chopping Animation */}
      {choppingTreeId && (
        <ChoppingAnimation
          treeId={choppingTreeId}
          onComplete={() => {
            console.log('🎬 Animation component called onComplete');
            // Animation completion is now handled in handleConfirmChop
          }}
        />
      )}
      
      {/* Placement Controls */}
      <PlacementControls
        isPlacing={plantMode || furniturePlacementMode}
        isEditMode={false}
        canPlace={true}
        onRotate={() => {
          // Rotation will be handled by keyboard (R key)
          showNotification('Press R to rotate preview');
        }}
        onConfirm={() => {
          if (plantMode && selectedSeedToPlant) {
            // Confirm will be handled by terrain click
            showNotification('Click on the ground to place');
          }
        }}
        onCancel={() => {
          if (plantMode) {
            setPlantMode(false);
            setSelectedSeedToPlant(null);
            showNotification('🚫 Plant mode cancelled');
          } else if (furniturePlacementMode) {
            setFurniturePlacementMode(false);
            setSelectedFurnitureToPlace(null);
            showNotification('🚫 Furniture placement cancelled');
          }
        }}
        onToggleEditMode={() => {
          showNotification('Edit mode coming soon!');
        }}
      />
      
      {/* Debug Panel */}
      {showDebug && (
        <DebugPanel
          gameState={gameState}
          onClose={() => setShowDebug(false)}
          onAddEcoPoints={(amount) => {
            setGameState({ ...gameState, ecoPoints: gameState.ecoPoints + amount });
          }}
          onSpawnTrash={() => {
            const newTrash = {
              id: 'trash_debug_' + Date.now(),
              position: {
                x: (Math.random() - 0.5) * 18,
                y: 0,
                z: (Math.random() - 0.5) * 18,
              },
            };
            setGameState({ ...gameState, trash: [...gameState.trash, newTrash] });
          }}
          onOpenTreeGrowth={() => {
            setShowDebug(false);
            setShowDebugTreeGrowth(true);
          }}
          onOpenVisualDebug={() => {
            setShowDebug(false);
            setShowVisualDebug(true);
          }}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-800 text-white px-6 py-3 rounded-full shadow-lg z-50">
          {notification}
        </div>
      )}
      
      {/* Coordinate Debug Display */}
      <DebugCoordinateDisplay
        enabled={showCoordinateDebug}
        cursorPosition={debugCursorPosition}
        clickedPosition={debugClickedPosition}
      />
      
      {/* Debug Grid Toggle Button */}
      <button
        onClick={() => setShowCoordinateDebug(!showCoordinateDebug)}
        className="absolute bottom-4 right-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-colors flex items-center gap-2"
      >
        <span>{showCoordinateDebug ? '🔍 Hide Grid' : '🔍 Show Grid'}</span>
      </button>
      
      {/* Object count indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Objects: {5 + gameState.trees.length + gameState.trash.length} / 25
      </div>
    </div>
  );
}
