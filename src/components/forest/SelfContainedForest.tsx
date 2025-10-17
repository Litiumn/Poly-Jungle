'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { GameStateData, TreeData, TreeSpecies, Weather, DecorationType, DecorationData, Mission } from '@/lib/self-contained-storage';
import {
  loadGameState,
  saveGameState,
  getSeedCost,
  canAffordSeed,
  calculateGrowthStage,
  mockAPI,
  getDecorationCost,
  canAffordDecoration,
  DECORATION_INFO,
  loadSampleForests,
} from '@/lib/self-contained-storage';
import { SelfContainedHUD } from '@/components/ui-game/SelfContainedHUD';
import { PlantMenu } from '@/components/ui-game/PlantMenu';
import { DebugPanel } from '@/components/ui-game/DebugPanel';
import { DecorationShop } from '@/components/ui-game/DecorationShop';
import { TreeDetailsPopup } from '@/components/ui-game/TreeDetailsPopup';
import { MissionBoard } from '@/components/ui-game/MissionBoard';
import { LeaderboardPanel } from '@/components/ui-game/LeaderboardPanel';
import { NFTGlowEffect } from '@/components/forest/NFTGlowEffect';
import { PlacedDecorations } from '@/components/forest/PlacedDecorations';

/**
 * SelfContainedForest — Main game component
 * 
 * Features:
 * - Direct-click planting on terrain
 * - Plant button for seed menu
 * - Timestamp-based growth
 * - Weather system
 * - Day/night lighting based on local time
 * - Debug controls
 */

interface PrimitiveTreeProps {
  tree: TreeData;
  onClick?: () => void;
}

function PrimitiveTree({ tree, onClick }: PrimitiveTreeProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation: gentle sway
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime + tree.position.x) * 0.02;
    }
  });
  
  // Size based on growth stage
  const sizeMap: Record<string, number> = {
    seed: 0.3,
    sprout: 0.6,
    young: 1.0,
    mature: 1.5,
  };
  const size = sizeMap[tree.growthStage] || 1.0;
  
  // Color based on species
  const colorMap: Record<TreeSpecies, string> = {
    Oak: '#7cb342',
    Pine: '#558b2f',
    Cherry: '#f48fb1',
    Baobab: '#8d6e63',
    Mangrove: '#4db6ac',
  };
  const color = colorMap[tree.species];
  
  return (
    <group
      ref={groupRef}
      position={[tree.position.x, 0, tree.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Trunk */}
      <mesh position={[0, size * 0.5, 0]}>
        <cylinderGeometry args={[0.1 * size, 0.15 * size, size, 8]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      
      {/* Foliage */}
      <mesh position={[0, size * 1.2, 0]}>
        <sphereGeometry args={[0.5 * size, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {tree.growthStage !== 'seed' && (
        <mesh position={[0, size * 1.5, 0]}>
          <coneGeometry args={[0.4 * size, 0.6 * size, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      
      {/* NFT Glow */}
      {tree.isMinted && (
        <NFTGlowEffect position={[0, size * 0.3, 0]} size={size} />
      )}
    </group>
  );
}

function Terrain({ onTerrainClick }: { onTerrainClick: (x: number, z: number) => void }): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const { raycaster, camera } = useThree();
  
  // Create heightmap terrain with hills
  const geometry = new THREE.PlaneGeometry(20, 20, 20, 20);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getY(i);
    const height = Math.sin(x * 0.5) * 0.3 + Math.cos(z * 0.5) * 0.3;
    positions.setZ(i, height);
  }
  
  geometry.computeVertexNormals();
  
  const handleClick = useCallback((event: THREE.Event) => {
    if (!meshRef.current) return;
    
    const intersect = event.intersections[0];
    if (intersect && intersect.point) {
      const x = Math.round(intersect.point.x);
      const z = Math.round(intersect.point.z);
      onTerrainClick(x, z);
    }
  }, [onTerrainClick]);
  
  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      geometry={geometry}
    >
      <meshStandardMaterial color="#8bc34a" side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
}

function Lake(): JSX.Element {
  const shimmerRef = useRef<THREE.Mesh>(null);
  
  // Animated shimmer effect
  useFrame((state) => {
    if (shimmerRef.current) {
      shimmerRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <group position={[6, 0.1, 6]}>
      {/* Base lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 16]} />
        <meshStandardMaterial color="#4fc3f7" transparent opacity={0.7} />
      </mesh>
      
      {/* Shimmer layer */}
      <mesh ref={shimmerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.5, 16]} />
        <meshStandardMaterial color="#e1f5fe" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Rocks(): JSX.Element {
  const positions: [number, number, number][] = [
    [-7, 0.3, -7],
    [-5, 0.3, 8],
    [8, 0.3, -6],
    [7, 0.3, 4],
    [-8, 0.25, -3],
    [9, 0.35, 2],
  ];
  
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

function Flowers(): JSX.Element {
  const flowerPositions: Array<{ pos: [number, number, number]; color: string }> = [
    { pos: [-3, 0.2, -3], color: '#ff6b9d' },
    { pos: [-4, 0.2, -2], color: '#ffd93d' },
    { pos: [-2, 0.2, -4], color: '#95e1d3' },
    { pos: [3, 0.2, 3], color: '#c44569' },
    { pos: [4, 0.2, 2], color: '#f8b500' },
    { pos: [2, 0.2, 4], color: '#6c5ce7' },
    { pos: [-6, 0.2, 2], color: '#fd79a8' },
    { pos: [1, 0.2, -6], color: '#fdcb6e' },
    { pos: [-1, 0.2, 6], color: '#ff7675' },
    { pos: [5, 0.2, -4], color: '#74b9ff' },
  ];
  
  return (
    <>
      {flowerPositions.map((flower, i) => (
        <group key={i} position={flower.pos}>
          {/* Stem */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
            <meshStandardMaterial color="#7cb342" />
          </mesh>
          {/* Petals (5 small spheres) */}
          {[0, 1, 2, 3, 4].map((j) => {
            const angle = (j / 5) * Math.PI * 2;
            return (
              <mesh
                key={j}
                position={[
                  Math.cos(angle) * 0.08,
                  0.22,
                  Math.sin(angle) * 0.08,
                ]}
              >
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color={flower.color} />
              </mesh>
            );
          })}
          {/* Center */}
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffd93d" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Benches(): JSX.Element {
  const benchPositions: [number, number, number, number][] = [
    [-8, 0.2, 6, 0],
    [8, 0.2, -8, Math.PI / 4],
  ];
  
  return (
    <>
      {benchPositions.map((data, i) => {
        const [x, y, z, rotation] = data;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[1.2, 0.1, 0.4]} />
              <meshStandardMaterial color="#8d6e63" />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.5, -0.15]}>
              <boxGeometry args={[1.2, 0.4, 0.1]} />
              <meshStandardMaterial color="#8d6e63" />
            </mesh>
            {/* Left leg */}
            <mesh position={[-0.4, 0.15, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#6d4c41" />
            </mesh>
            {/* Right leg */}
            <mesh position={[0.4, 0.15, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#6d4c41" />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Signposts(): JSX.Element {
  const signPositions: Array<{ pos: [number, number, number]; rotation: number }> = [
    { pos: [-9, 0.5, -9], rotation: Math.PI / 4 },
    { pos: [9, 0.5, 9], rotation: -Math.PI / 4 },
  ];
  
  return (
    <>
      {signPositions.map((sign, i) => (
        <group key={i} position={sign.pos} rotation={[0, sign.rotation, 0]}>
          {/* Post */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1, 6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* Sign board */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.05]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Fences(): JSX.Element {
  const fencePosts: [number, number, number][] = [];
  
  // Create fence along left edge
  for (let i = 0; i < 5; i++) {
    fencePosts.push([-9.5, 0.3, -8 + i * 4]);
  }
  
  // Create fence along top edge
  for (let i = 0; i < 5; i++) {
    fencePosts.push([-8 + i * 4, 0.3, -9.5]);
  }
  
  return (
    <>
      {fencePosts.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Post */}
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.6, 6]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* Crossbar (only connect to next post if not last in row) */}
          {i % 5 !== 4 && (
            <mesh position={[i < 5 ? 0 : 2, 0.2, i < 5 ? 2 : 0]} rotation={i < 5 ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.05, 0.05, 1.8]} />
              <meshStandardMaterial color="#8d6e63" />
            </mesh>
          )}
        </group>
      ))}
    </>
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
          <meshStandardMaterial color="#c62828" />
        </mesh>
      ))}
    </>
  );
}

function WeatherEffects({ weather }: { weather: Weather }): JSX.Element | null {
  if (weather !== 'rain') return null;
  
  // Simple rain particles
  const rainCount = 100;
  const positions = new Float32Array(rainCount * 3);
  
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  useFrame(() => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < rainCount; i++) {
        let y = positions.getY(i);
        y -= 0.2;
        if (y < 0) y = 20;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }
  });
  
  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={rainCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#aaaaff" size={0.1} />
    </points>
  );
}

function DynamicLighting({ weather }: { weather: Weather }): JSX.Element {
  // Get time of day
  const hour = new Date().getHours();
  
  // Calculate light intensity based on time (brighter)
  let intensity = 1.2;
  let ambientIntensity = 0.8;
  let directionalColor = '#fff5e6'; // Warm sunlight
  
  if (hour >= 6 && hour < 18) {
    intensity = 1.2; // Bright day
    ambientIntensity = 0.8;
    directionalColor = '#fff5e6';
  } else {
    intensity = 0.6; // Dim night
    ambientIntensity = 0.4;
    directionalColor = '#b3d4fc'; // Cool moonlight
  }
  
  // Adjust for weather (less dramatic reduction)
  if (weather === 'cloudy') {
    intensity *= 0.85;
    ambientIntensity *= 0.9;
  }
  if (weather === 'rain') {
    intensity *= 0.75;
    ambientIntensity *= 0.85;
  }
  
  return (
    <>
      {/* Brighter ambient light */}
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      
      {/* Warm directional sunlight */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={intensity * 0.8}
        color={directionalColor}
        castShadow={false}
      />
      
      {/* Secondary fill light */}
      <directionalLight
        position={[-8, 10, -8]}
        intensity={intensity * 0.3}
        color="#e3f2fd"
      />
      
      {/* Hemisphere light for sky gradient effect */}
      <hemisphereLight
        args={['#87ceeb', '#7cb342', 0.4]}
      />
    </>
  );
}

function SceneContent({
  gameState,
  onTerrainClick,
  onTreeClick,
  onCleanTrash,
  weather,
}: {
  gameState: GameStateData;
  onTerrainClick: (x: number, z: number) => void;
  onTreeClick: (treeId: string) => void;
  onCleanTrash: (id: string) => void;
  weather: Weather;
}): JSX.Element {
  const { scene } = useThree();
  
  // Apply fog for atmospheric depth
  useEffect(() => {
    scene.fog = new THREE.Fog('#e8f5e9', 20, 50);
    scene.background = new THREE.Color('#e3f2fd'); // Light blue sky
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);
  
  return (
    <>
      <DynamicLighting weather={weather} />
      
      {/* Environment */}
      <Terrain onTerrainClick={onTerrainClick} />
      <Lake />
      <Rocks />
      <Flowers />
      <Benches />
      <Signposts />
      <Fences />
      
      {/* Trees */}
      {gameState.trees.map((tree: TreeData) => (
        <PrimitiveTree
          key={tree.id}
          tree={tree}
          onClick={() => onTreeClick(tree.id)}
        />
      ))}
      
      {/* Decorations */}
      <PlacedDecorations decorations={gameState.decorations} />
      
      {/* Interactive elements */}
      <TrashObjects trash={gameState.trash} onCleanTrash={onCleanTrash} />
      <WeatherEffects weather={weather} />
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export function SelfContainedForest(): JSX.Element {
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [showPlantMenu, setShowPlantMenu] = useState<boolean>(false);
  const [showDecorationShop, setShowDecorationShop] = useState<boolean>(false);
  const [showMissionBoard, setShowMissionBoard] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showTreeDetails, setShowTreeDetails] = useState<boolean>(false);
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; z: number } | null>(null);
  const [weather, setWeather] = useState<Weather>('sunny');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');
  
  // Load game state on mount
  useEffect(() => {
    const state = loadGameState();
    if (state) {
      setGameState(state);
    }
  }, []);
  
  // Save game state whenever it changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
    }
  }, [gameState]);
  
  // Auto-refresh growth every 10 seconds
  useEffect(() => {
    if (!gameState) return;
    
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        
        return {
          ...prev,
          trees: prev.trees.map((tree: TreeData) => ({
            ...tree,
            growthStage: calculateGrowthStage(tree.plantedAt, tree.species, tree.wateringBonusPercent),
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
    // Check if position is valid (not too close to existing trees or lake)
    if (!gameState) return;
    
    // Check distance from lake
    const distFromLake = Math.sqrt((x - 6) ** 2 + (z - 6) ** 2);
    if (distFromLake < 4) {
      showNotification('Cannot plant in the lake!');
      return;
    }
    
    // Check distance from other trees
    const tooClose = gameState.trees.some((tree: TreeData) => {
      const dist = Math.sqrt((tree.position.x - x) ** 2 + (tree.position.z - z) ** 2);
      return dist < 2;
    });
    
    if (tooClose) {
      showNotification('Too close to another tree!');
      return;
    }
    
    setSelectedPosition({ x, z });
    setShowPlantMenu(true);
  }, [gameState, showNotification]);
  
  const handlePlantSeed = useCallback((species: TreeSpecies) => {
    if (!gameState || !selectedPosition) return;
    
    const cost = getSeedCost(species);
    
    if (!canAffordSeed(gameState.ecoPoints, species)) {
      showNotification(`Not enough eco-points! Need ${cost}.`);
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
    };
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints - cost,
      trees: [...gameState.trees, newTree],
      stats: {
        ...gameState.stats,
        treesPlanted: gameState.stats.treesPlanted + 1,
      },
    });
    
    setShowPlantMenu(false);
    setSelectedPosition(null);
    showNotification(`🌱 Planted ${species} tree!`);
  }, [gameState, selectedPosition, showNotification]);
  
  const handleTreeClick = useCallback((treeId: string) => {
    if (!gameState) return;
    
    const tree = gameState.trees.find((t: TreeData) => t.id === treeId);
    if (!tree) return;
    
    // Open tree details popup
    setSelectedTree(tree);
    setShowTreeDetails(true);
  }, [gameState]);
  
  const handleMintTree = useCallback(() => {
    if (!gameState || !selectedTree) return;
    
    const result = mockAPI.mintNFT(selectedTree.id);
    
    setGameState({
      ...gameState,
      trees: gameState.trees.map(t =>
        t.id === selectedTree.id
          ? { ...t, isMinted: true, mintedAt: Date.now() }
          : t
      ),
      nfts: [
        ...gameState.nfts,
        {
          treeId: selectedTree.id,
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
    
    setShowTreeDetails(false);
    setSelectedTree(null);
    showNotification('✨ Tree minted as NFT!');
  }, [gameState, selectedTree, showNotification]);
  
  const handleBuyDecoration = useCallback((type: DecorationType) => {
    if (!gameState) return;
    
    const cost = getDecorationCost(type);
    
    if (!canAffordDecoration(gameState.ecoPoints, type)) {
      showNotification(`Not enough eco-points! Need ${cost}.`);
      return;
    }
    
    // Place at random valid position
    const randomPos = {
      x: (Math.random() - 0.5) * 16,
      y: 0,
      z: (Math.random() - 0.5) * 16,
    };
    
    const newDecoration: DecorationData = {
      id: 'deco_' + Date.now(),
      type,
      position: randomPos,
      placedAt: Date.now(),
    };
    
    setGameState({
      ...gameState,
      ecoPoints: gameState.ecoPoints - cost,
      decorations: [...gameState.decorations, newDecoration],
    });
    
    setShowDecorationShop(false);
    showNotification(`🎨 Placed ${DECORATION_INFO[type].name}!`);
  }, [gameState, showNotification]);
  
  const updateMissionProgress = useCallback((missionType: 'plant' | 'water' | 'clean') => {
    if (!gameState) return;
    
    const updatedMissions = gameState.missions.map(m => {
      if (m.type === missionType && !m.completed) {
        const newCurrent = m.current + 1;
        return {
          ...m,
          current: newCurrent,
          completed: newCurrent >= m.target,
        };
      }
      return m;
    });
    
    setGameState({
      ...gameState,
      missions: updatedMissions,
    });
  }, [gameState]);
  
  const handleClaimMission = useCallback((missionId: string) => {
    if (!gameState) return;
    
    const mission = gameState.missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;
    
    const updatedMissions = gameState.missions.map(m =>
      m.id === missionId ? { ...m, claimed: true } : m
    );
    
    const newGameState: GameStateData = {
      ...gameState,
      ecoPoints: gameState.ecoPoints + mission.reward.ecoPoints,
      missions: updatedMissions,
    };
    
    // Add decoration reward if present
    if (mission.reward.decoration) {
      const newDecoration: DecorationData = {
        id: 'deco_reward_' + Date.now(),
        type: mission.reward.decoration,
        position: {
          x: (Math.random() - 0.5) * 16,
          y: 0,
          z: (Math.random() - 0.5) * 16,
        },
        placedAt: Date.now(),
      };
      newGameState.decorations = [...newGameState.decorations, newDecoration];
    }
    
    setGameState(newGameState);
    showNotification(`✅ Mission claimed! +${mission.reward.ecoPoints} eco-points`);
  }, [gameState, showNotification]);
  
  const computeLeaderboard = useCallback(() => {
    if (!gameState) return [];
    
    const sampleForests = loadSampleForests();
    const allForests = [
      { username: gameState.username, state: gameState },
      ...sampleForests.map(f => ({
        username: f.username,
        state: {
          ...gameState,
          username: f.username,
          trees: f.trees,
          decorations: f.decorations,
          ecoPoints: f.ecoPoints,
        } as GameStateData,
      })),
    ];
    
    return mockAPI.computeLeaderboard(allForests);
  }, [gameState]);
  
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
    });
    
    showNotification('🗑️ Trash cleaned! +5 eco-points');
  }, [gameState, showNotification]);
  
  if (!gameState) {
    return <div className="w-full h-screen bg-green-100 flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="w-full h-screen relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 20, 20], fov: 50 }}
        className="w-full h-full"
      >
        <SceneContent
          gameState={gameState}
          onTerrainClick={handleTerrainClick}
          onTreeClick={handleTreeClick}
          onCleanTrash={handleCleanTrash}
          weather={weather}
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
          setSelectedPosition({ x: 0, z: 0 });
          setShowPlantMenu(true);
        }}
        onToggleDebug={() => setShowDebug(!showDebug)}
        onOpenDecorations={() => setShowDecorationShop(true)}
        onOpenMissions={() => setShowMissionBoard(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
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
      
      {/* Decoration Shop */}
      {showDecorationShop && (
        <DecorationShop
          ecoPoints={gameState.ecoPoints}
          onBuy={handleBuyDecoration}
          onClose={() => setShowDecorationShop(false)}
        />
      )}
      
      {/* Mission Board */}
      {showMissionBoard && (
        <MissionBoard
          missions={gameState.missions}
          onClaim={handleClaimMission}
          onClose={() => setShowMissionBoard(false)}
        />
      )}
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <LeaderboardPanel
          leaderboard={computeLeaderboard()}
          currentUser={gameState.username}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      
      {/* Tree Details */}
      {showTreeDetails && selectedTree && (
        <TreeDetailsPopup
          tree={selectedTree}
          onMint={handleMintTree}
          onClose={() => {
            setShowTreeDetails(false);
            setSelectedTree(null);
          }}
        />
      )}
      
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
        />
      )}
      
      {/* Notification */}
      {notification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-800 text-white px-6 py-3 rounded-full shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
}
