
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClothingItem, EquippedItems } from '@/pages/FashionStudio';
import { Tag } from 'lucide-react';

interface WardrobeGridProps {
  items: ClothingItem[];
  onSelectItem: (item: ClothingItem) => void;
  equippedItems: EquippedItems;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({ 
  items, 
  onSelectItem,
  equippedItems 
}) => {
  const isMobile = useIsMobile();
  
  // Filter items by type
  const hats = items.filter(item => item.type === 'hat');
  const shoes = items.filter(item => item.type === 'shoes');
  const capes = items.filter(item => item.type === 'cape');
  
  const isEquipped = (item: ClothingItem) => {
    return equippedItems[item.type]?.id === item.id;
  };

  return (
    <div className="w-full md:w-1/2 bg-crt-background/80 p-2 overflow-y-auto">
      <div className="pixel-text text-white text-xs mb-2">WARDROBE</div>
      
      {/* Hats Section */}
      <div className="mb-3">
        <div className="pixel-text text-[10px] text-blob-secondary mb-1">HATS</div>
        <div className="grid grid-cols-3 gap-2">
          {hats.map(item => (
            <WardrobeItem 
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              isEquipped={isEquipped(item)}
            />
          ))}
        </div>
      </div>
      
      {/* Shoes Section */}
      <div className="mb-3">
        <div className="pixel-text text-[10px] text-blob-secondary mb-1">SHOES</div>
        <div className="grid grid-cols-3 gap-2">
          {shoes.map(item => (
            <WardrobeItem 
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              isEquipped={isEquipped(item)}
            />
          ))}
        </div>
      </div>
      
      {/* Capes Section */}
      <div>
        <div className="pixel-text text-[10px] text-blob-secondary mb-1">CAPES</div>
        <div className="grid grid-cols-3 gap-2">
          {capes.map(item => (
            <WardrobeItem 
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              isEquipped={isEquipped(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual wardrobe item component
const WardrobeItem: React.FC<{
  item: ClothingItem;
  onSelect: (item: ClothingItem) => void;
  isEquipped: boolean;
}> = ({ item, onSelect, isEquipped }) => {
  return (
    <div 
      className={`
        relative border-2 rounded p-1 cursor-pointer transition-all
        ${item.unlocked 
          ? 'border-gray-500 hover:border-blob-tertiary' 
          : 'border-gray-700 opacity-50 cursor-not-allowed'}
        ${isEquipped ? 'border-blob-happy bg-gray-800/50' : ''}
      `}
      onClick={() => item.unlocked && onSelect(item)}
    >
      {/* Item display (placeholder for now) */}
      <div className="aspect-square bg-gray-800 rounded flex items-center justify-center">
        <Tag className={`${item.unlocked ? 'text-white' : 'text-gray-500'}`} size={16} />
      </div>
      
      {/* Item name */}
      <div className="pixel-text text-[8px] mt-1 text-center truncate text-white">
        {item.name}
      </div>
      
      {/* Glow effect for unlocked items */}
      {item.unlocked && !isEquipped && (
        <div className="absolute inset-0 rounded animate-pulse opacity-30 pointer-events-none" 
          style={{ 
            boxShadow: `0 0 8px 2px ${
              item.type === 'hat' 
                ? '#ff9955' 
                : item.type === 'shoes' 
                  ? '#55ff55' 
                  : '#5599ff'
            }`
          }}
        />
      )}
      
      {/* Equipped indicator */}
      {isEquipped && (
        <div className="absolute -top-1 -right-1 bg-blob-happy w-3 h-3 rounded-full border border-white"></div>
      )}
      
      {/* Locked indicator */}
      {!item.unlocked && (
        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-white">
          <div className="pixel-text text-[8px]">LOCKED</div>
        </div>
      )}
    </div>
  );
};

export default WardrobeGrid;
