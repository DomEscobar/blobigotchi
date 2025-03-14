
import React, { useState } from 'react';
import { BlobMood } from '../Blob';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';
import { Computer, Book, Dumbbell } from 'lucide-react';

interface AdultRoomProps {
  onInteraction: () => void;
  mood: BlobMood;
}

const AdultRoom: React.FC<AdultRoomProps> = ({ onInteraction, mood }) => {
  const isMobile = useIsMobile();
  const [isComputerOn, setIsComputerOn] = useState(false);
  const [isReadingBook, setIsReadingBook] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();

  const playSound = (sound: 'click' | 'play') => {
    if (settings.sound) {
      playSoundEffect(sound);
    }
  };

  const handleComputerClick = () => {
    setIsComputerOn(prev => !prev);
    playSound('click');
    
    toast(isComputerOn ? "Logging off..." : "Working hard!", {
      description: isComputerOn ? undefined : "Earning those Blob Bucks!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 2000,
    });
    
    onInteraction();
  };

  const handleBookClick = () => {
    setIsReadingBook(prev => !prev);
    playSound('click');
    
    toast("Reading time!", {
      description: "Knowledge is power!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 2000,
    });
    
    onInteraction();
  };

  const handleDumbbellClick = () => {
    setIsExercising(true);
    playSound('play');
    
    toast("Working out!", {
      description: "Getting stronger!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 1500,
    });
    
    onInteraction();
    
    setTimeout(() => setIsExercising(false), 1000);
  };

  return (
    <div className="absolute inset-0">
      {/* Computer Desk */}
      <div className="absolute top-8 right-8">
        <div 
          className={`w-16 h-12 bg-gray-700 rounded-lg cursor-pointer ${isComputerOn ? 'ring-2 ring-blue-400' : ''}`}
          onClick={handleComputerClick}
        >
          <div className={`w-14 h-8 mx-auto mt-1 rounded border border-gray-600 ${isComputerOn ? 'bg-blue-400' : 'bg-gray-800'}`}>
            {isComputerOn && (
              <Computer className="w-4 h-4 mx-auto mt-2 text-white animate-pulse" />
            )}
          </div>
          <div className="w-8 h-2 mx-auto mt-1 bg-gray-600"></div>
        </div>
      </div>

      {/* Book Shelf */}
      <div 
        className={`absolute top-8 left-8 cursor-pointer transition-transform ${isReadingBook ? 'scale-95' : ''}`}
        onClick={handleBookClick}
      >
        <div className="w-12 h-16 bg-amber-800 rounded-sm flex flex-col justify-end p-1">
          <Book className={`w-4 h-4 text-amber-100 mx-auto ${isReadingBook ? 'animate-bounce' : ''}`} />
          <div className="w-full h-1 bg-amber-900 mt-1"></div>
          <div className="w-full h-1 bg-amber-900 mt-1"></div>
        </div>
      </div>

      {/* Exercise Area */}
      <div 
        className={`absolute bottom-24 right-12 cursor-pointer transition-transform ${isExercising ? 'animate-bounce' : ''}`}
        onClick={handleDumbbellClick}
      >
        <Dumbbell className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );
};

export default AdultRoom;
