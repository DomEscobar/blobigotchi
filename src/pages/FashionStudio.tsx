
import React, { useState, useRef } from 'react';
import CRTOverlay from '@/components/CRTOverlay';
import TitleBar from '@/components/TitleBar';
import Footer from '@/components/Footer';
import WardrobeGrid from '@/components/WardrobeGrid';
import BlobCanvas from '@/components/BlobCanvas';
import { useBlobStats } from '@/hooks/useBlobStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClothingItem, EquippedItems, ItemCategory } from '@/types/fashion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const FashionStudio = () => {
  const isMobile = useIsMobile();
  const { stats } = useBlobStats();
  const navigate = useNavigate();
  const dragItemRef = useRef<ClothingItem | null>(null);
  
  // Categories
  const categories: ItemCategory[] = [
    { id: 'headwear', name: 'Headwear', position: 'head' },
    { id: 'accessory', name: 'Accessories', position: 'neck' },
    { id: 'body', name: 'Body Items', position: 'back' },
    { id: 'footwear', name: 'Footwear', position: 'feet' },
    { id: 'effect', name: 'Effects', position: 'effect' }
  ];
  
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);
  
  // Available clothing items
  const [clothingItems] = useState<ClothingItem[]>([
    // Headwear
    { 
      id: 'baseball-cap', 
      name: 'Baseball Cap', 
      type: 'headwear', 
      position: 'head',
      imageUrl: '/hat1.png', 
      colors: ['#ff5555', '#ffffff'],
      unlocked: true,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'crown', 
      name: 'Royal Crown', 
      type: 'headwear', 
      position: 'head',
      imageUrl: '/hat2.png', 
      colors: ['#ffdd00', '#ff5555', '#5599ff', '#55ff55'],
      unlocked: stats.evolutionLevel > 1,
      requiresLevel: 2,
      specialEffect: 'glow',
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'wizard-hat', 
      name: 'Wizard Hat', 
      type: 'headwear', 
      position: 'head',
      imageUrl: '/hat3.png', 
      colors: ['#5599ff', '#ffffff'],
      unlocked: stats.evolutionLevel > 2,
      requiresLevel: 3,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'headphones', 
      name: 'Headphones', 
      type: 'headwear', 
      position: 'head',
      imageUrl: '/headphones.png', 
      colors: ['#ff55aa', '#55ffee'],
      unlocked: stats.evolutionLevel > 1,
      requiresLevel: 2,
      gridSize: { width: 32, height: 32 }
    },
    
    // Accessories
    { 
      id: 'scarf', 
      name: 'Warm Scarf', 
      type: 'accessory', 
      position: 'neck',
      imageUrl: '/scarf.png', 
      colors: ['#ff5555', '#ffffff'],
      unlocked: true,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'necklace', 
      name: 'Pixel Necklace', 
      type: 'accessory', 
      position: 'neck',
      imageUrl: '/necklace.png', 
      colors: ['#ffdd00', '#ff55aa'],
      unlocked: stats.evolutionLevel > 1,
      requiresLevel: 2,
      gridSize: { width: 32, height: 32 }
    },
    
    // Body items
    { 
      id: 'cape1', 
      name: 'Red Cape', 
      type: 'body',
      position: 'back',
      imageUrl: '/cape1.png', 
      colors: ['#ff5555', '#aa0000'],
      unlocked: true,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'cape2', 
      name: 'Blue Cape', 
      type: 'body',
      position: 'back',
      imageUrl: '/cape2.png', 
      colors: ['#5599ff', '#0055aa'],
      unlocked: stats.evolutionLevel > 1,
      requiresLevel: 2,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'fairy-wings', 
      name: 'Fairy Wings', 
      type: 'body',
      position: 'back',
      imageUrl: '/fairy-wings.png', 
      colors: ['#ffffff', '#ddffff', '#aaccff'],
      unlocked: stats.evolutionLevel > 2,
      requiresLevel: 3,
      specialEffect: 'animate',
      gridSize: { width: 32, height: 32 }
    },
    
    // Footwear
    { 
      id: 'boots', 
      name: 'Pixel Boots', 
      type: 'footwear',
      position: 'feet',
      imageUrl: '/shoes1.png', 
      colors: ['#663311', '#442200'],
      unlocked: true,
      gridSize: { width: 32, height: 32 }
    },
    { 
      id: 'sandals', 
      name: 'Beach Sandals', 
      type: 'footwear',
      position: 'feet',
      imageUrl: '/shoes2.png', 
      colors: ['#ddaa77', '#996633'],
      unlocked: stats.evolutionLevel > 1,
      requiresLevel: 2,
      gridSize: { width: 32, height: 32 }
    },
    
    // Special effects
    { 
      id: 'halo', 
      name: 'Angelic Halo', 
      type: 'effect',
      position: 'effect',
      imageUrl: '/halo.png', 
      colors: ['#ffff99', '#ffdd00'],
      unlocked: stats.evolutionLevel > 2,
      requiresLevel: 3,
      specialEffect: 'pulse',
      gridSize: { width: 32, height: 32 }
    },
  ]);

  // Currently equipped items
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});

  // Handle selecting an item for drag
  const handleStartDrag = (item: ClothingItem) => {
    if (!item.unlocked) {
      toast.error(`This item is locked until level ${item.requiresLevel}!`);
      return;
    }
    
    dragItemRef.current = item;
  };
  
  // Handle dropping an item onto the blob
  const handleDrop = (position: ItemPosition) => {
    const draggedItem = dragItemRef.current;
    
    if (!draggedItem) return;
    
    // Validate position
    if (draggedItem.position !== position) {
      toast.error(`Can't put ${draggedItem.name} there!`);
      // Visual error shake would be implemented here
      return;
    }
    
    // Equip the item
    setEquippedItems(prev => ({
      ...prev,
      [position]: draggedItem
    }));
    
    toast.success(`${draggedItem.name} equipped!`);
    dragItemRef.current = null;
  };

  // Handle removing an item
  const handleRemoveItem = (position: ItemPosition) => {
    setEquippedItems(prev => {
      const updated = { ...prev };
      delete updated[position];
      return updated;
    });
    toast(`Item removed!`);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };
  
  const filteredItems = clothingItems.filter(item => item.type === activeCategory);

  return (
    <div className="flex items-center justify-center min-h-screen p-2 md:p-4 bg-gray-900">
      <div className="w-full max-w-4xl">
        <div className="relative">
          <CRTOverlay 
            className="rounded-xl overflow-hidden border-4 border-gray-800"
            mood={stats.mood}
          >
            <div className="flex flex-col h-[600px] md:h-[650px]">
              <div className="p-3 bg-crt-dark text-white pixel-text flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/')}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <ArrowLeft size={16} className="text-blob-tertiary" />
                  </button>
                  <div className="text-xs md:text-sm text-blob-tertiary">FASHION STUDIO</div>
                </div>
                <div className="text-[10px] md:text-xs text-blob-secondary">LEVEL {stats.evolutionLevel}</div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row">
                {/* Blob display area for drag-and-drop */}
                <BlobCanvas 
                  mood={stats.mood} 
                  equippedItems={equippedItems} 
                  onRemoveItem={handleRemoveItem}
                  onDrop={handleDrop}
                />
                
                {/* Wardrobe grid with categories */}
                <WardrobeGrid 
                  items={filteredItems}
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                  onStartDrag={handleStartDrag}
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
