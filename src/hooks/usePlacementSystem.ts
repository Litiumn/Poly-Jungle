/**
 * Unified Placement System Hook
 * 
 * Modern React hook for managing object placement in the 3D forest scene.
 * Handles preview, validation, rotation, and confirmation for both trees and furniture.
 * 
 * Features:
 * - Real-time placement preview with terrain height detection
 * - Collision detection with existing objects
 * - Grid snapping (optional)
 * - Keyboard controls (R to rotate, ESC to cancel, Enter to confirm)
 * - Slope alignment for natural object placement
 * - Edit mode for moving existing objects
 * 
 * @example
 * ```tsx
 * const placementSystem = usePlacementSystem({
 *   onPlaceTree: (position, rotation, seedId) => { ... },
 *   onPlaceFurniture: (position, rotation, furnitureId) => { ... },
 *   terrainMeshRef: terrainRef,
 *   existingTrees: [...],
 *   existingFurniture: [...]
 * });
 * 
 * // Start placement
 * placementSystem.startTreePlacement(seedId, treeType);
 * 
 * // Update preview on mouse move
 * placementSystem.updatePreview(position);
 * 
 * // Confirm placement on click
 * placementSystem.confirmPlacement();
 * ```
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Vector3 } from '@/types/game';
import type { SeedTier } from '@/lib/seed-system';
import * as THREE from 'three';
import {
  createPlacementState,
  updatePreviewPosition,
  rotatePreview,
  findClosestObject,
  type PlacementState,
  type PlacedObject,
} from '@/lib/placement-manager';

interface UsePlacementSystemOptions {
  onPlaceTree?: (position: Vector3, rotation: number, seedId: string, visualSeed?: number, species?: string) => void;
  onPlaceFurniture?: (position: Vector3, rotation: number, furnitureId: string) => void;
  onMoveObject?: (objectId: string, newPosition: Vector3, rotation: number) => void;
  terrainMeshRef?: React.RefObject<THREE.Mesh>;
  existingTrees?: PlacedObject[];
  existingFurniture?: PlacedObject[];
}

interface PlacementSystemState extends PlacementState {
  selectedTreeType?: SeedTier;
  selectedFurnitureId?: string;
  terrainNormal: THREE.Vector3;
  previewVisualSeed?: number;
  previewSpecies?: string;
  validationReason?: string;
}

export function usePlacementSystem({
  onPlaceTree,
  onPlaceFurniture,
  onMoveObject,
  terrainMeshRef,
  existingTrees = [],
  existingFurniture = [],
}: UsePlacementSystemOptions) {
  const [placementState, setPlacementState] = useState<PlacementSystemState>({
    ...createPlacementState(),
    terrainNormal: new THREE.Vector3(0, 1, 0),
  });

  const allObjects = [...existingTrees, ...existingFurniture];

  // Start tree placement
  const startTreePlacement = useCallback((seedId: string, treeType: SeedTier): void => {
    setPlacementState({
      ...createPlacementState(),
      mode: 'tree',
      selectedItemId: seedId,
      selectedTreeType: treeType,
      snapToGrid: true,
      gridSize: 1,
      terrainNormal: new THREE.Vector3(0, 1, 0),
    });
  }, []);

  // Start furniture placement
  const startFurniturePlacement = useCallback((furnitureId: string): void => {
    setPlacementState({
      ...createPlacementState(),
      mode: 'furniture',
      selectedItemId: furnitureId,
      selectedFurnitureId: furnitureId,
      snapToGrid: true,
      gridSize: 1,
      terrainNormal: new THREE.Vector3(0, 1, 0),
    });
  }, []);

  // Enter edit mode
  const enterEditMode = useCallback((): void => {
    setPlacementState((prev) => ({
      ...prev,
      mode: 'none',
      editMode: 'move',
    }));
  }, []);

  // Exit edit mode
  const exitEditMode = useCallback((): void => {
    setPlacementState((prev) => ({
      ...prev,
      editMode: 'none',
      selectedItemId: null,
    }));
  }, []);

  // Update preview position
  const updatePreview = useCallback(
    (position: Vector3): void => {
      if (placementState.mode === 'none') return;

      const terrainMesh = terrainMeshRef?.current || null;

      // Calculate terrain height and normal
      let terrainNormal = new THREE.Vector3(0, 1, 0);
      let height = 0;

      if (terrainMesh) {
        const raycaster = new THREE.Raycaster();
        const origin = new THREE.Vector3(position.x, 50, position.z);
        const direction = new THREE.Vector3(0, -1, 0);

        raycaster.set(origin, direction);
        const intersects = raycaster.intersectObject(terrainMesh, true);

        if (intersects.length > 0) {
          height = intersects[0].point.y;
          if (intersects[0].face) {
            terrainNormal = intersects[0].face.normal.clone();
          }
        }
      }

      // Get validation result with reason
      const { validatePlacement } = require('@/lib/placement-validation');
      const validationResult = validatePlacement(
        { ...position, y: height },
        terrainNormal,
        allObjects,
        { minSpacing: 2.5 }
      );

      const newState = updatePreviewPosition(
        placementState,
        { ...position, y: height },
        allObjects,
        terrainMesh
      );

      setPlacementState({
        ...newState,
        terrainNormal,
        selectedTreeType: placementState.selectedTreeType,
        selectedFurnitureId: placementState.selectedFurnitureId,
        previewVisualSeed: placementState.previewVisualSeed,
        previewSpecies: placementState.previewSpecies,
        isValidPlacement: validationResult.valid,
        validationReason: validationResult.reason,
      });
    },
    [placementState, terrainMeshRef, allObjects]
  );

  // Rotate preview
  const rotate = useCallback((): void => {
    setPlacementState((prev) => ({
      ...prev,
      previewRotation: rotatePreview(prev.previewRotation, 45),
    }));
  }, []);

  // Store visual seed when preview is generated
  const storePreviewVisualSeed = useCallback((visualSeed: number, species: string): void => {
    setPlacementState((prev) => ({
      ...prev,
      previewVisualSeed: visualSeed,
      previewSpecies: species,
    }));
  }, []);

  // Confirm placement
  const confirmPlacement = useCallback((): void => {
    if (!placementState.isValidPlacement || !placementState.previewPosition) return;

    if (placementState.mode === 'tree' && placementState.selectedItemId && onPlaceTree) {
      onPlaceTree(
        placementState.previewPosition,
        placementState.previewRotation,
        placementState.selectedItemId,
        placementState.previewVisualSeed,
        placementState.previewSpecies
      );
    } else if (
      placementState.mode === 'furniture' &&
      placementState.selectedItemId &&
      onPlaceFurniture
    ) {
      onPlaceFurniture(
        placementState.previewPosition,
        placementState.previewRotation,
        placementState.selectedItemId
      );
    }

    // Reset placement state
    setPlacementState({
      ...createPlacementState(),
      terrainNormal: new THREE.Vector3(0, 1, 0),
    });
  }, [placementState, onPlaceTree, onPlaceFurniture]);

  // Cancel placement
  const cancelPlacement = useCallback((): void => {
    setPlacementState({
      ...createPlacementState(),
      terrainNormal: new THREE.Vector3(0, 1, 0),
    });
  }, []);

  // Select object for moving
  const selectObject = useCallback(
    (position: Vector3): void => {
      if (placementState.editMode !== 'move') return;

      const closest = findClosestObject(position, allObjects, 2);
      if (closest) {
        setPlacementState((prev) => ({
          ...prev,
          selectedItemId: closest.id,
          previewPosition: closest.position,
          previewRotation: closest.rotation,
        }));
      }
    },
    [placementState.editMode, allObjects]
  );

  // Move selected object
  const moveSelectedObject = useCallback(
    (position: Vector3): void => {
      if (!placementState.selectedItemId || placementState.editMode !== 'move') return;

      const terrainMesh = terrainMeshRef?.current || null;
      const newState = updatePreviewPosition(placementState, position, allObjects, terrainMesh);

      setPlacementState((prev) => ({
        ...prev,
        previewPosition: newState.previewPosition,
        isValidPlacement: newState.isValidPlacement,
      }));
    },
    [placementState, terrainMeshRef, allObjects]
  );

  // Confirm object move
  const confirmMove = useCallback((): void => {
    if (!placementState.selectedItemId || !placementState.previewPosition || !onMoveObject) return;

    onMoveObject(
      placementState.selectedItemId,
      placementState.previewPosition,
      placementState.previewRotation
    );

    setPlacementState((prev) => ({
      ...prev,
      selectedItemId: null,
      previewPosition: null,
    }));
  }, [placementState, onMoveObject]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Rotation
      if (e.key === 'r' || e.key === 'R') {
        rotate();
      }

      // Cancel placement / exit edit mode
      if (e.key === 'Escape') {
        if (placementState.editMode === 'move') {
          exitEditMode();
        } else if (placementState.mode !== 'none') {
          cancelPlacement();
        }
      }

      // Confirm placement
      if (e.key === 'Enter' && placementState.isValidPlacement) {
        if (placementState.editMode === 'move') {
          confirmMove();
        } else {
          confirmPlacement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    placementState,
    rotate,
    cancelPlacement,
    confirmPlacement,
    confirmMove,
    exitEditMode,
  ]);

  return {
    placementState,
    startTreePlacement,
    startFurniturePlacement,
    enterEditMode,
    exitEditMode,
    updatePreview,
    rotate,
    confirmPlacement,
    cancelPlacement,
    selectObject,
    moveSelectedObject,
    confirmMove,
    storePreviewVisualSeed,
    isPlacing: placementState.mode !== 'none',
    isEditMode: placementState.editMode === 'move',
  };
}
