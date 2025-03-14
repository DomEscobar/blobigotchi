
import React from 'react';
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
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <div className="relative">
        <Blob mood={mood} onClick={onClick} />

        {/* Render equipped items */}
        {equippedItems.map((item) => (
          <div
            key={item.id}
            className="absolute transition-all duration-300 animate-fade-in"
            style={{
              transform: `translate(${item.position.x}px, ${item.position.y}px)`,
              top: '50%',
              left: '50%',
              marginLeft: -item.pixelSize.width / 2,
              marginTop: -item.pixelSize.height / 2,
              width: item.pixelSize.width,
              height: item.pixelSize.height,
            }}
          >
            <div
              className="w-full h-full bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage: `url("${item.image}")`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlobCanvas;
