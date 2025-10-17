'use client';

/**
 * ChoppingAnimation - Visual feedback when cutting down a tree
 * 
 * Shows a progress animation while the tree is being chopped
 */

import { useEffect, useState } from 'react';

interface ChoppingAnimationProps {
  treeId: string;
  onComplete: () => void;
}

export function ChoppingAnimation({ treeId, onComplete }: ChoppingAnimationProps): JSX.Element {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds chopping duration
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay before completing
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4 animate-bounce">🪓</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Chopping Tree...</h3>
        <p className="text-gray-600 mb-4">Please wait while the tree is being cut down</p>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}
