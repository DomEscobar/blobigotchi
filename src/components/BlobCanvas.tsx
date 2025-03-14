
import React, { useEffect, useState } from 'react';
import Blob from './Blob';
import { BlobMood } from './Blob';
import { EquippedItem } from '@/types/fashion';
import { cn } from '@/lib/utils';

interface BlobCanvasProps {
  mood: BlobMood;
  equippedItems: EquippedItem[];
  onClick: () => void;
  className?: string;
}

const BlobCanvas: React.FC<BlobCanvasProps> = ({
  mood,
  equippedItems,
  onClick,
  className
}) => {
  // Calculate scale based on blob size
  const [blobSize, setBlobSize] = useState({ width: 80, height: 80 }); // Default blob size (20rem = 80px)
  const [scaling, setScaling] = useState({
    factor: 1.75, // Default scaling factor
    offsets: {
      head: { x: 0, y: -25 },
      face: { x: 0, y: -5 },
      neck: { x: 0, y: 10 },
      body: { x: 0, y: 5 },
      feet: { x: 0, y: 30 },
      extras: { x: 0, y: 0 }
    }
  });

  // Measure the actual blob size after render
  useEffect(() => {
    const measureBlob = () => {
      const blobElement = document.querySelector('.blob-body');
      if (blobElement) {
        const rect = blobElement.getBoundingClientRect();
        setBlobSize({
          width: rect.width,
          height: rect.height
        });
        
        // Adjust scaling based on actual blob size
        const baseBlobSize = 80; // Expected base size
        const newScale = Math.max(rect.width, rect.height) / baseBlobSize;
        
        // Update scaling with size-appropriate factor
        setScaling(prev => ({
          ...prev,
          factor: newScale * 1.75 // Apply the base scaling plus adaptive adjustment
        }));
      }
    };

    // Initial measurement
    measureBlob();
    
    // Re-measure on window resize
    window.addEventListener('resize', measureBlob);
    return () => window.removeEventListener('resize', measureBlob);
  }, []);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <div className="relative">
        <Blob mood={mood} onClick={onClick} className="blob-body" />

        {/* Render equipped items */}
        {equippedItems.map((item) => {
          // Get category-specific offsets
          const categoryOffset = scaling.offsets[item.category] || { x: 0, y: 0 };
          
          return (
            <div
              key={item.id}
              className="absolute transition-all duration-300 animate-fade-in"
              style={{
                transform: `translate(${item.position.x + categoryOffset.x}px, ${item.position.y + categoryOffset.y}px)`,
                top: '50%',
                left: '50%',
                marginLeft: -(item.pixelSize.width * scaling.factor) / 2,
                marginTop: -(item.pixelSize.height * scaling.factor) / 2,
                width: item.pixelSize.width * scaling.factor,
                height: item.pixelSize.height * scaling.factor,
                zIndex: item.category === 'extras' ? 5 : (item.category === 'head' ? 10 : 0)
              }}
            >
              <div
                className="w-full h-full bg-center bg-no-repeat bg-contain"
                style={{
                  backgroundImage: `url("${item.image}")`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlobCanvas;
