
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Blocks, Bell, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

interface ToyBoxProps {
  onToyInteraction: () => void;
}

const Toy: React.FC<{
  name: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ name, color, icon, onClick }) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-110 transition-transform"
      onClick={onClick}
    >
      <div 
        className={`p-2 rounded-lg ${color} shadow-md pixel-border`}
        style={{ 
          boxShadow: '0 0 0 1px #000, 2px 2px 0 1px #000',
        }}
      >
        {icon}
      </div>
      <span className={`pixel-text ${isMobile ? 'text-[8px]' : 'text-xs'} text-white`}>{name}</span>
    </div>
  );
};

const ToyBox: React.FC<ToyBoxProps> = ({ onToyInteraction }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToyClick = (toyName: string) => {
    toast(`Playing with ${toyName}!`, {
      description: "Your blob seems happier!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 2000,
    });
    onToyInteraction();
    if (!isMobile) setIsOpen(false);
  };

  const ToysContent = () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Toy 
        name="Blocks" 
        color="bg-[#FDE1D3]" 
        icon={<Blocks className="text-[#F97316]" size={isMobile ? 24 : 32} />} 
        onClick={() => handleToyClick("Blocks")} 
      />
      <Toy 
        name="Bell" 
        color="bg-[#E5DEFF]" 
        icon={<Bell className="text-[#8B5CF6]" size={isMobile ? 24 : 32} />} 
        onClick={() => handleToyClick("Bell")} 
      />
      <Toy 
        name="Sparkles" 
        color="bg-[#FFDEE2]" 
        icon={<Sparkles className="text-[#D946EF]" size={isMobile ? 24 : 32} />} 
        onClick={() => handleToyClick("Sparkles")} 
      />
    </div>
  );

  // Use Dialog on desktop, Drawer on mobile
  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div 
          className="absolute left-1/2 bottom-6 transform -translate-x-1/2 cursor-pointer"
          style={{ 
            width: isMobile ? '32px' : '40px', 
            height: isMobile ? '28px' : '36px',
            zIndex: 10
          }}
        >
          <div className="w-full h-full bg-yellow-800 rounded-t-lg border-2 border-black relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-2 bg-yellow-600 rounded-full border border-black"></div>
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-yellow-700 border-x-2 border-black"></div>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-crt-background border-t-2 border-blob-tertiary">
        <DrawerHeader className="text-center">
          <DrawerTitle className="pixel-text text-white">Toy Box</DrawerTitle>
          <DrawerDescription className="pixel-text text-gray-400">
            Pick a toy to play with your blob!
          </DrawerDescription>
        </DrawerHeader>
        <ToysContent />
        <DrawerFooter className="text-center">
          <span className="pixel-text text-[8px] text-gray-400">Tap a toy to play</span>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="absolute left-1/2 bottom-6 transform -translate-x-1/2 cursor-pointer"
          style={{ 
            width: '40px', 
            height: '36px',
            zIndex: 10
          }}
        >
          <div className="w-full h-full bg-yellow-800 rounded-t-lg border-2 border-black relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-2 bg-yellow-600 rounded-full border border-black"></div>
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-yellow-700 border-x-2 border-black"></div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-crt-background border-2 border-blob-tertiary rounded-lg p-6">
        <h2 className="pixel-text text-white text-lg mb-2 text-center">Toy Box</h2>
        <p className="pixel-text text-gray-400 text-sm mb-4 text-center">Pick a toy to play with your blob!</p>
        <ToysContent />
      </DialogContent>
    </Dialog>
  );
};

export default ToyBox;
