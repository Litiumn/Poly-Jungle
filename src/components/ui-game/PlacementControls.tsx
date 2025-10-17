'use client';

/**
 * PlacementControls - UI controls for placement and edit modes
 * 
 * Features:
 * - Rotate object preview
 * - Confirm placement
 * - Cancel placement
 * - Toggle edit mode
 */

interface PlacementControlsProps {
  isPlacing: boolean;
  isEditMode: boolean;
  canPlace: boolean;
  onRotate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToggleEditMode: () => void;
}

export function PlacementControls({
  isPlacing,
  isEditMode,
  canPlace,
  onRotate,
  onConfirm,
  onCancel,
  onToggleEditMode,
}: PlacementControlsProps): JSX.Element | null {
  // Only show controls when placing or in edit mode
  if (!isPlacing && !isEditMode) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 z-40">
      <div className="flex items-center gap-3">
        {isPlacing && (
          <>
            <div className="text-sm font-bold text-gray-700 border-r-2 border-gray-300 pr-3">
              Placement Mode
            </div>
            
            <button
              onClick={onRotate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
              title="Press R to rotate"
            >
              <span>🔄</span>
              <span>Rotate (R)</span>
            </button>
            
            <button
              onClick={onConfirm}
              disabled={!canPlace}
              className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                canPlace
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Click on ground to place"
            >
              <span>✅</span>
              <span>Place</span>
            </button>
            
            <button
              onClick={onCancel}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
              title="Press ESC to cancel"
            >
              <span>❌</span>
              <span>Cancel (ESC)</span>
            </button>
          </>
        )}
        
        {isEditMode && (
          <>
            <div className="text-sm font-bold text-gray-700 border-r-2 border-gray-300 pr-3">
              Edit Mode
            </div>
            
            <button
              onClick={onToggleEditMode}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Exit Edit Mode</span>
            </button>
          </>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-600 text-center">
        {isPlacing && 'Click on the forest ground to place • R to rotate • ESC to cancel'}
        {isEditMode && 'Click on an object to move it • ESC to exit edit mode'}
      </div>
    </div>
  );
}
