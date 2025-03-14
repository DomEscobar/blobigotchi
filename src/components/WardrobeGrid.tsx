
import React from 'react';
import { WardrobeCategory, WardrobeItem } from '@/types/fashion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash } from 'lucide-react';

interface WardrobeGridProps {
  wardrobeData: WardrobeCategory[];
  onItemSelect: (item: WardrobeItem) => void;
  onClearAll: () => void;
  equippedItemIds: string[];
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({
  wardrobeData,
  onItemSelect,
  onClearAll,
  equippedItemIds
}) => {
  return (
    <div className="w-full h-full bg-gray-900/70 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <h3 className="text-white pixel-text text-sm">Fashion Wardrobe</h3>
        <button 
          onClick={onClearAll}
          className="flex items-center text-white hover:text-red-400 transition-colors"
          aria-label="Clear all items"
        >
          <Trash size={16} />
        </button>
      </div>
      
      <Tabs defaultValue={wardrobeData[0].id} className="w-full">
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${wardrobeData.length}, 1fr)` }}>
          {wardrobeData.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="pixel-text text-xs p-1 h-auto"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {wardrobeData.map(category => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="p-2 h-[200px] overflow-y-auto"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {category.items.map(item => {
                const isEquipped = equippedItemIds.includes(item.id);
                
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "p-2 flex flex-col items-center justify-center rounded-md transition-all",
                      item.unlocked 
                        ? "bg-gray-800 hover:bg-gray-700 cursor-pointer" 
                        : "bg-gray-800/50 cursor-not-allowed opacity-50",
                      isEquipped && "ring-2 ring-blob-tertiary"
                    )}
                    onClick={() => item.unlocked && onItemSelect(item)}
                    disabled={!item.unlocked}
                  >
                    <div 
                      className={cn(
                        "w-12 h-12 flex items-center justify-center",
                        item.unlocked && !isEquipped && "animate-pulse"
                      )}
                    >
                      <div
                        className="w-full h-full bg-center bg-no-repeat bg-contain"
                        style={{ backgroundImage: `url("${item.image}")` }}
                      />
                    </div>
                    <span className="text-xs text-white mt-1 text-center truncate w-full">
                      {item.name}
                    </span>
                    {isEquipped && (
                      <span className="text-[10px] text-blob-tertiary mt-1">
                        Equipped
                      </span>
                    )}
                    {!item.unlocked && (
                      <span className="text-[10px] text-gray-400 mt-1">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WardrobeGrid;
