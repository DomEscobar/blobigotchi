
import React, { useState } from 'react';
import CRTOverlay from '@/components/CRTOverlay';
import TitleBar from '@/components/TitleBar';
import Footer from '@/components/Footer';
import WardrobeGrid from '@/components/WardrobeGrid';
import BlobCanvas from '@/components/BlobCanvas';
import { useBlobStats } from '@/hooks/useBlobStats';
import { useIsMobile } from '@/hooks/use-mobile';

export type ClothingItem = {
  id: string;
  name: string;
  type: 'hat' | 'shoes' | 'cape';
  imageUrl: string;
  unlocked: boolean;
};

export type EquippedItems = {
  hat?: ClothingItem;
  shoes?: ClothingItem;
  cape?: ClothingItem;
};

const FashionStudio = () => {
  const isMobile = useIsMobile();
  const { stats } = useBlobStats();
  
  // Available clothing items
  const [clothingItems] = useState<ClothingItem[]>([
    { id: 'hat1', name: 'Party Hat', type: 'hat', imageUrl: '/hat1.png', unlocked: true },
    { id: 'hat2', name: 'Crown', type: 'hat', imageUrl: '/hat2.png', unlocked: stats.evolutionLevel > 1 },
    { id: 'hat3', name: 'Wizard Hat', type: 'hat', imageUrl: '/hat3.png', unlocked: stats.evolutionLevel > 2 },
    { id: 'shoes1', name: 'Sneakers', type: 'shoes', imageUrl: '/shoes1.png', unlocked: true },
    { id: 'shoes2', name: 'Boots', type: 'shoes', imageUrl: '/shoes2.png', unlocked: stats.evolutionLevel > 1 },
    { id: 'cape1', name: 'Red Cape', type: 'cape', imageUrl: '/cape1.png', unlocked: true },
    { id: 'cape2', name: 'Blue Cape', type: 'cape', imageUrl: '/cape2.png', unlocked: stats.evolutionLevel > 1 },
    { id: 'cape3', name: 'Starry Cape', type: 'cape', imageUrl: '/cape3.png', unlocked: stats.evolutionLevel > 2 },
  ]);

  // Currently equipped items
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});

  // Handle equipping an item
  const handleEquipItem = (item: ClothingItem) => {
    if (!item.unlocked) return;
    
    setEquippedItems(prev => ({
      ...prev,
      [item.type]: item
    }));
  };

  // Handle removing an item
  const handleRemoveItem = (type: 'hat' | 'shoes' | 'cape') => {
    setEquippedItems(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 md:p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="relative">
          <CRTOverlay 
            className="rounded-xl overflow-hidden border-4 border-gray-800"
            mood={stats.mood}
          >
            <div className="flex flex-col h-[600px] md:h-[650px]">
              <div className="p-3 bg-crt-dark text-white pixel-text flex justify-between items-center">
                <div className="text-xs md:text-sm text-blob-tertiary">FASHION STUDIO</div>
                <div className="text-[10px] md:text-xs text-blob-secondary">LEVEL {stats.evolutionLevel}</div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row">
                {/* Blob display area */}
                <BlobCanvas 
                  mood={stats.mood} 
                  equippedItems={equippedItems} 
                  onRemoveItem={handleRemoveItem}
                />
                
                {/* Wardrobe grid */}
                <WardrobeGrid 
                  items={clothingItems} 
                  onSelectItem={handleEquipItem}
                  equippedItems={equippedItems}
                />
              </div>
            </div>
          </CRTOverlay>
          
          <TitleBar />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default FashionStudio;
