'use client';

/**
 * ChoppingConfirmationModal - Confirmation dialog for tree cutting
 * 
 * Shows warning about permanent removal and expected building log reward
 */

interface ChoppingConfirmationModalProps {
  tree: {
    id: string;
    species: string;
    tier?: string;
  };
  expectedLogs: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChoppingConfirmationModal({
  tree,
  expectedLogs,
  onConfirm,
  onCancel,
}: ChoppingConfirmationModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        {/* Warning Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Cut Down Tree?</h2>
        </div>
        
        {/* Tree Info */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
          <div className="text-center mb-2">
            <div className="text-lg font-bold text-gray-800">{tree.species}</div>
            {tree.tier && (
              <div className="text-sm text-gray-600">{tree.tier}</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-amber-700">
            <span className="text-2xl">🪵</span>
            <span className="font-bold text-lg">+{expectedLogs} Building Logs</span>
          </div>
        </div>
        
        {/* Warning Text */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 text-center">
            <strong>Warning:</strong> You will permanently remove this tree and lose any progress associated with it. 
            This action cannot be undone!
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            Yes, Cut Tree
          </button>
        </div>
      </div>
    </div>
  );
}
