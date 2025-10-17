'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { GameState, TreeSpecies, Vector3 } from '@/types/game';
import { Tree } from './Tree';
import { EnhancedTerrain } from './EnhancedTerrain';
import { InteractableItem } from './InteractableItem';
import { WeatherSystem, type WeatherType } from './WeatherSystem';
import { useTimeOfDay } from './TimeOfDay';
import { useState } from 'react';
import { plantTree, cleanTrash, removeWeed, waterTree } from '@/lib/mock_api';

interface ForestSceneProps {
  gameState: GameState;
  onStateChange: () => void;
  selectedSpecies: TreeSpecies | null;
  isPlantMode: boolean;
  onPlantComplete: () => void;
  weather: WeatherType;
}

export function ForestScene({
  gameState,
  onStateChange,
  selectedSpecies,
  isPlantMode,
  onPlantComplete,
  weather,
}: ForestSceneProps): JSX.Element {
  const [selectedTool, setSelectedTool] = useState<'water' | null>(null);
  const timeConfig = useTimeOfDay();

  const handleTerrainClick = (position: Vector3): void => {
    if (isPlantMode && selectedSpecies) {
      const success = plantTree(gameState, selectedSpecies, position);
      if (success) {
        onStateChange();
        onPlantComplete();
      }
    }
  };

  const handleTreeClick = (treeId: string): void => {
    if (selectedTool === 'water') {
      const success = waterTree(gameState, treeId);
      if (success) {
        onStateChange();
      }
    }
  };

  const handleTrashClick = (trashId: string): void => {
    const success = cleanTrash(gameState, trashId);
    if (success) {
      onStateChange();
    }
  };

  const handleWeedClick = (weedId: string): void => {
    const success = removeWeed(gameState, weedId);
    if (success) {
      onStateChange();
    }
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[30, 40, 30]} fov={50} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={80}
          maxPolarAngle={Math.PI / 2.5}
        />

        <WeatherSystem weather={weather} />

        <directionalLight
          position={[50, 80, 50]}
          intensity={timeConfig.lightIntensity}
          color={timeConfig.lightColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <EnhancedTerrain onTerrainClick={handleTerrainClick} />

        {gameState.trees.map((tree) => (
          <Tree
            key={tree.id}
            tree={tree}
            onClick={() => handleTreeClick(tree.id)}
          />
        ))}

        {gameState.interactables.trash.map((trash) => (
          <InteractableItem
            key={trash.id}
            item={trash}
            onClick={() => handleTrashClick(trash.id)}
          />
        ))}

        {gameState.interactables.weeds.map((weed) => (
          <InteractableItem
            key={weed.id}
            item={weed}
            onClick={() => handleWeedClick(weed.id)}
          />
        ))}
      </Canvas>

      {isPlantMode && selectedSpecies && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-4 rounded-full shadow-xl border-4 border-white z-40"
          style={{ boxShadow: '0 8px 30px rgba(34, 139, 34, 0.6)' }}
        >
          <p className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl animate-bounce">🌱</span>
            <span>Planting {selectedSpecies} tree - Click anywhere on the terrain</span>
          </p>
        </div>
      )}
      {selectedTool === 'water' && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-full shadow-xl border-4 border-white z-40">
          <p className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <span>Watering mode - Click a tree</span>
          </p>
        </div>
      )}
    </div>
  );
}
