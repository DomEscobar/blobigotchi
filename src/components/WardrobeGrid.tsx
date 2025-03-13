
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClothingItem, EquippedItems, ItemCategory } from '@/types/fashion';
import { Lock, Star } from 'lucide-react';

interface WardrobeGridProps {
  items: ClothingItem[];
  categories: ItemCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onStartDrag: (item: ClothingItem) => void;
  equippedItems: EquippedItems;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({ 
  items, 
  categories,
  activeCategory,
  onCategoryChange,
  onStartDrag,
  equippedItems 
}) => {
  const isMobile = useIsMobile();
  
  const isEquipped = (item: ClothingItem) => {
    return equippedItems[item.position]?.id === item.id;
  };

  return (
    <div className="w-full md:w-1/2 bg-crt-background/80 p-2 overflow-y-auto flex flex-col">
      <div className="pixel-text text-white text-xs mb-2">WARDROBE</div>
      
      {/* Category tabs */}
      <div className="flex overflow-x-auto mb-2 pb-1 scrollbar-thin">
        {categories.map(category => (
          <button
            key={category.id}
            className={`pixel-text text-[9px] whitespace-nowrap px-2 py-1 mr-1 rounded-t ${
              activeCategory === category.id 
                ? 'bg-blob-tertiary text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1 overflow-y-auto p-1">
        {items.map(item => (
          <WardrobeItem 
            key={item.id}
            item={item}
            onStartDrag={() => onStartDrag(item)}
            isEquipped={isEquipped(item)}
          />
        ))}
        
        {items.length === 0 && (
          <div className="col-span-3 text-center py-8 text-gray-500 pixel-text text-xs">
            No items in this category yet!
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <div className="pixel-text text-[8px] text-gray-400">
          Drag items onto your blob to equip them!
        </div>
      </div>
    </div>
  );
};

// Individual wardrobe item component
const WardrobeItem: React.FC<{
  item: ClothingItem;
  onStartDrag: () => void;
  isEquipped: boolean;
}> = ({ item, onStartDrag, isEquipped }) => {
  // Get the main color for the glow effect
  const mainColor = item.colors[0] || '#ffffff';
  
  const handleDragStart = (e: React.DragEvent) => {
    if (!item.unlocked) return;
    
    // Set transfer data (for HTML5 drag and drop)
    e.dataTransfer.setData('text/plain', item.id);
    
    // Custom function to handle mobile and desktop
    onStartDrag();
  };
  
  return (
    <div 
      className={`
        relative border-2 rounded p-2 cursor-pointer transition-all
        ${item.unlocked 
          ? 'border-gray-500 hover:border-blob-tertiary' 
          : 'border-gray-700 opacity-50 cursor-not-allowed'}
        ${isEquipped ? 'border-blob-happy bg-gray-800/50' : ''}
      `}
      draggable={item.unlocked}
      onDragStart={handleDragStart}
      onClick={onStartDrag}
    >
      {/* Item display (32x32 pixel art) */}
      <div className="pixel-border aspect-square bg-gray-800 rounded flex items-center justify-center">
        <div 
          className={`w-10 h-10 flex items-center justify-center ${
            item.specialEffect === 'glow' ? 'animate-pulse' : ''
          }`}
          style={{
            imageRendering: 'pixelated'
          }}
        >
          {item.unlocked ? (
            <div className="w-8 h-8 bg-gray-700 flex items-center justify-center">
              {/* This would be the actual pixel art image */}
              <Star 
                className="text-white" 
                size={16} 
                fill={mainColor} 
                strokeWidth={1}
              />
            </div>
          ) : (
            <Lock className="text-gray-500" size={16} />
          )}
        </div>
      </div>
      
      {/* Item name */}
      <div className="pixel-text text-[8px] mt-1 text-center truncate text-white">
        {item.name}
      </div>
      
      {/* Color dots */}
      <div className="flex justify-center mt-1 gap-1">
        {item.colors.slice(0, 4).map((color, idx) => (
          <div 
            key={idx} 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {/* Glow effect for unlocked items */}
      {item.unlocked && !isEquipped && (
        <div 
          className="absolute inset-0 rounded animate-pulse opacity-30 pointer-events-none" 
          style={{ 
            boxShadow: `0 0 8px 2px ${mainColor}`
          }}
        />
      )}
      
      {/* Equipped indicator */}
      {isEquipped && (
        <div className="absolute -top-1 -right-1 bg-blob-happy w-3 h-3 rounded-full border border-white"></div>
      )}
      
      {/* Locked indicator */}
      {!item.unlocked && (
        <div className="absolute inset-0 bg-black/50 rounded flex flex-col items-center justify-center text-white">
          <div className="pixel-text text-[8px]">LOCKED</div>
          {item.requiresLevel && (
            <div className="pixel-text text-[6px] text-gray-400 mt-1">
              Level {item.requiresLevel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WardrobeGrid;
