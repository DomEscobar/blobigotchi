
import React from 'react';
import Blob, { BlobMood } from './Blob';
import { ClothingItem, EquippedItems } from '@/pages/FashionStudio';
import { X } from 'lucide-react';

interface BlobCanvasProps {
  mood: BlobMood;
  equippedItems: EquippedItems;
  onRemoveItem: (type: 'hat' | 'shoes' | 'cape') => void;
}

const BlobCanvas: React.FC<BlobCanvasProps> = ({ 
  mood, 
  equippedItems,
  onRemoveItem
}) => {
  return (
    <div className="w-full md:w-1/2 h-[250px] md:h-auto relative bg-gradient-to-b from-crt-background to-crt-dark rounded-lg overflow-hidden p-2">
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
          <Blob mood={mood} onClick={() => {}} />
          
          {/* Hat positioning (above blob) */}
          {equippedItems.hat && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-16 h-16 bg-blob-happy rounded-t-full flex items-center justify-center">
                  <span className="pixel-text text-white text-xs">HAT</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('hat');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {/* Shoes positioning (below blob) */}
          {equippedItems.shoes && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-16 h-6 bg-blob-tertiary rounded-md flex items-center justify-center">
                  <span className="pixel-text text-white text-xs">SHOES</span>
                </div>
                <button 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('shoes');
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {/* Cape positioning (behind blob) */}
          {equippedItems.cape && (
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-24 h-24 bg-blob-secondary rounded-full flex items-center justify-center">
                  <span className="pixel-text text-white text-xs">CAPE</span>
                </div>
                <button 
                  className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem('cape');
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
        Click an item to remove
      </div>
    </div>
  );
};

export default BlobCanvas;
