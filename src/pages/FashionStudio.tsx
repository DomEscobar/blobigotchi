
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2 } from 'lucide-react';
import BlobCanvas from '@/components/BlobCanvas';
import WardrobeGrid from '@/components/WardrobeGrid';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBlobStats } from '@/hooks/useBlobStats';
import CRTOverlay from '@/components/CRTOverlay';
import TitleBar from '@/components/TitleBar';
import Footer from '@/components/Footer';
import { 
  WardrobeItem, 
  EquippedItem, 
  WARDROBE_DATA,
  ANCHOR_POINTS
} from '@/types/fashion';

const FashionStudio = () => {
  const isMobile = useIsMobile();
  const { stats } = useBlobStats();
  const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  // Reset tap count if not tapped frequently
  useEffect(() => {
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  // Check for secret item unlocks
  useEffect(() => {
    if (tapCount === 10) {
      const secretItem = WARDROBE_DATA
        .flatMap(category => category.items)
        .find(item => item.id === 'neon-glasses');
      
      if (secretItem && !secretItem.unlocked) {
        // This is a mock implementation - in a real app, you'd update your database
        secretItem.unlocked = true;
        toast('🎉 Secret Item Unlocked!', {
          description: '8-Bit Sunglasses are now available!',
          duration: 5000,
          className: `pixel-text bg-crt-background border border-blob-tertiary text-white ${isMobile ? 'text-xs' : ''}`,
        });
      }
      setTapCount(0);
    }
  }, [tapCount, isMobile]);

  // Handle Christmas hat feature
  useEffect(() => {
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() === 25) { // December 25
      const santaHat = WARDROBE_DATA
        .flatMap(category => category.items)
        .find(item => item.name === 'Baseball Cap'); // Substituting for Santa Hat
      
      if (santaHat && !equippedItems.some(item => item.id === santaHat.id)) {
        handleItemSelect(santaHat);
        toast('🎄 Merry Christmas!', {
          description: 'A festive hat has been equipped!',
          duration: 5000,
          className: `pixel-text bg-crt-background border border-blob-tertiary text-white ${isMobile ? 'text-xs' : ''}`,
        });
      }
    }
  }, []);

  const handleWardrobeClick = () => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      setTapCount(prev => prev + 1);
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  const handleItemSelect = (item: WardrobeItem) => {
    setEquippedItems(prev => {
      // Check if an item from the same category is already equipped
      const existingIndex = prev.findIndex(equipped => equipped.category === item.category);
      
      // If clicking the same item that's already equipped, remove it
      if (existingIndex >= 0 && prev[existingIndex].id === item.id) {
        toast(`Removed ${item.name}`, {
          description: '👕',
          duration: 2000,
          className: `pixel-text bg-crt-background border border-gray-700 text-white ${isMobile ? 'text-xs' : ''}`,
        });
        return prev.filter(equipped => equipped.id !== item.id);
      }
      
      // Position the item based on its category
      const anchorPoint = ANCHOR_POINTS[item.category];
      const position = { 
        x: anchorPoint.x, 
        y: anchorPoint.y 
      };
      
      const newItem: EquippedItem = {
        ...item,
        position
      };
      
      // Replace the existing item in the same category or add a new one
      let newEquipped = [...prev];
      if (existingIndex >= 0) {
        newEquipped[existingIndex] = newItem;
      } else {
        newEquipped.push(newItem);
      }
      
      toast(`Equipped ${item.name}`, {
        description: '✨',
        duration: 2000,
        className: `pixel-text bg-crt-background border border-gray-700 text-white ${isMobile ? 'text-xs' : ''}`,
      });
      
      return newEquipped;
    });
  };
  
  const handleRandomize = () => {
    // Clear all items first
    setEquippedItems([]);
    
    // Select one random unlocked item from each category
    const randomItems = WARDROBE_DATA.map(category => {
      const unlockedItems = category.items.filter(item => item.unlocked);
      if (unlockedItems.length > 0) {
        return unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
      }
      return null;
    }).filter(Boolean) as WardrobeItem[];
    
    // Equip selected random items
    randomItems.forEach(item => {
      handleItemSelect(item);
    });
    
    toast('✨ Random Style Applied!', {
      description: 'Looking fancy!',
      duration: 3000,
      className: `pixel-text bg-crt-background border border-blob-tertiary text-white ${isMobile ? 'text-xs' : ''}`,
    });
  };
  
  const handleClearAll = () => {
    if (equippedItems.length > 0) {
      setEquippedItems([]);
      toast('All items removed', {
        description: '🧹',
        duration: 2000,
        className: `pixel-text bg-crt-background border border-gray-700 text-white ${isMobile ? 'text-xs' : ''}`,
      });
    }
  };
  
  const handleBlobClick = () => {
    // Just for fun - add some interaction when clicking the blob
    toast(`${stats.mood === 'happy' ? 'Blob loves' : 'Blob appreciates'} the new look!`, {
      duration: 2000,
      className: `pixel-text bg-crt-background border border-gray-700 text-white ${isMobile ? 'text-xs' : ''}`,
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
              {/* Header with back button */}
              <div className="p-2 bg-gray-900/90 border-b border-gray-700 flex items-center justify-between">
                <Link to="/" className="text-white hover:text-blob-secondary transition-colors">
                  <ArrowLeft size={18} />
                </Link>
                <h2 className="text-white pixel-text text-sm">Fashion Studio</h2>
                <button 
                  onClick={handleRandomize}
                  className="text-white hover:text-blob-tertiary transition-colors"
                  aria-label="Randomize outfit"
                >
                  <Wand2 size={18} />
                </button>
              </div>
              
              {/* Blob display area */}
              <div className="flex-1 relative bg-crt-background p-4" onClick={handleWardrobeClick}>
                <BlobCanvas 
                  mood={stats.mood} 
                  equippedItems={equippedItems}
                  onClick={handleBlobClick}
                />
              </div>
              
              {/* Wardrobe grid */}
              <div className="h-[280px]">
                <WardrobeGrid 
                  wardrobeData={WARDROBE_DATA}
                  onItemSelect={handleItemSelect}
                  onClearAll={handleClearAll}
                  equippedItemIds={equippedItems.map(item => item.id)}
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
