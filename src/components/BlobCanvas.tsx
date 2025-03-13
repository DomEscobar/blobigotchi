
import React, { useState } from 'react';
import Blob, { BlobMood } from './Blob';
import { EquippedItems, ItemPosition } from '@/types/fashion';
import { X, ShieldAlert } from 'lucide-react';

interface BlobCanvasProps {
  mood: BlobMood;
  equippedItems: EquippedItems;
  onRemoveItem: (type: ItemPosition) => void;
  onDrop: (position: ItemPosition) => void;
}

const BlobCanvas: React.FC<BlobCanvasProps> = ({ 
  mood, 
  equippedItems,
  onRemoveItem,
  onDrop
}) => {
  const [hoverZone, setHoverZone] = useState<ItemPosition | null>(null);

  const handleDragOver = (e: React.DragEvent, zone: ItemPosition) => {
    e.preventDefault();
    setHoverZone(zone);
  };
  
  const handleDragLeave = () => {
    setHoverZone(null);
  };
  
  const handleDrop = (e: React.DragEvent, zone: ItemPosition) => {
    e.preventDefault();
    setHoverZone(null);
    onDrop(zone);
  };

  return (
    <div className="w-full md:w-1/2 h-[300px] md:h-auto relative bg-gradient-to-b from-crt-background to-crt-dark rounded-lg overflow-hidden p-2">
      {/* Checkerboard floor pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-24 w-full overflow-hidden">
        <div className="w-full h-full" style={{ 
          backgroundImage: `repeating-conic-gradient(#333 0% 25%, #444 0% 50%)`, 
          backgroundSize: '32px 32px',
          transform: 'perspective(300px) rotateX(45deg)',
          transformOrigin: 'bottom'
        }}></div>
      </div>
      
      {/* Blob positioning */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Drop zones */}
          <div 
            className={`absolute -top-16 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full ${
              hoverZone === 'head' ? 'bg-blob-tertiary/30' : 'bg-transparent'
            } border-2 border-dashed ${
              hoverZone === 'head' ? 'border-blob-tertiary' : 'border-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, 'head')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'head')}
          />
          
          <div 
            className={`absolute -bottom-1 -left-12 w-10 h-10 rounded-full ${
              hoverZone === 'neck' ? 'bg-blob-tertiary/30' : 'bg-transparent'
            } border-2 border-dashed ${
              hoverZone === 'neck' ? 'border-blob-tertiary' : 'border-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, 'neck')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'neck')}
          />
          
          <div 
            className={`absolute -top-4 -left-16 w-12 h-16 rounded-full ${
              hoverZone === 'back' ? 'bg-blob-tertiary/30' : 'bg-transparent'
            } border-2 border-dashed ${
              hoverZone === 'back' ? 'border-blob-tertiary' : 'border-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, 'back')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'back')}
          />
          
          <div 
            className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-16 h-8 rounded-full ${
              hoverZone === 'feet' ? 'bg-blob-tertiary/30' : 'bg-transparent'
            } border-2 border-dashed ${
              hoverZone === 'feet' ? 'border-blob-tertiary' : 'border-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, 'feet')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'feet')}
          />
          
          <div 
            className={`absolute -top-20 -right-12 w-14 h-14 rounded-full ${
              hoverZone === 'effect' ? 'bg-blob-tertiary/30' : 'bg-transparent'
            } border-2 border-dashed ${
              hoverZone === 'effect' ? 'border-blob-tertiary' : 'border-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, 'effect')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'effect')}
          />
          
          <Blob mood={mood} onClick={() => {}} />
          
          {/* Render equipped items */}
          {equippedItems.head && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-blob-happy rounded-t-full flex items-center justify-center">
                    <span className="pixel-text text-white text-[8px]">HAT</span>
                  </div>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('head');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {equippedItems.neck && (
            <div className="absolute -bottom-1 -left-12">
              <div className="relative">
                <div className="w-10 h-10 bg-blob-secondary rounded-md flex items-center justify-center">
                  <span className="pixel-text text-white text-[8px]">NECK</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('neck');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {equippedItems.back && (
            <div className="absolute -top-4 -left-16">
              <div className="relative">
                <div className="w-12 h-16 bg-blob-tertiary rounded-md flex items-center justify-center">
                  <span className="pixel-text text-white text-[8px]">BACK</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('back');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {equippedItems.feet && (
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-16 h-8 bg-blob-happy rounded-md flex items-center justify-center">
                  <span className="pixel-text text-white text-[8px]">FEET</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('feet');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {equippedItems.effect && (
            <div className="absolute -top-20 -right-12">
              <div className="relative">
                <div className="w-14 h-14 bg-blob-tertiary/50 rounded-full flex items-center justify-center animate-pulse">
                  <span className="pixel-text text-white text-[8px]">EFFECT</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('effect');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 pixel-text text-[10px] text-blob-tertiary/70">
        Drag items here from the wardrobe
      </div>
      
      <div className="absolute top-2 right-2 flex">
        <div className="pixel-text text-[8px] bg-crt-glow/10 text-crt-glow p-1 rounded border border-crt-glow/30 flex items-center gap-1">
          <ShieldAlert size={10} />
          <span>32x32 GRID</span>
        </div>
      </div>
    </div>
  );
};

export default BlobCanvas;
