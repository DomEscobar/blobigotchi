import React from 'react';
import { BlobType } from '@/hooks/useBlobAppearance';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';
import { getAttacksByType } from '@/data/attacks';

interface AttackOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (attackId: string) => void;
  onDecline: () => void;
  blobType: BlobType;
  evolutionLevel: number;
}

const AttackOfferModal: React.FC<AttackOfferModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  blobType,
  evolutionLevel,
}) => {
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();
  
  // Get attacks appropriate for the blob's type
  const typeAttacks = getAttacksByType(blobType);
  
  // Filter attacks to only include those appropriate for the current evolution level
  const availableAttacks = typeAttacks.filter(attack => attack.minLevel <= evolutionLevel);
  
  // Select a random attack from the available ones
  const randomAttack = availableAttacks.length > 0 
    ? availableAttacks[Math.floor(Math.random() * availableAttacks.length)]
    : null;
  
  if (!isOpen || !randomAttack) return null;
  
  const handleAccept = () => {
    if (settings.sound) {
      playSoundEffect('levelUp');
    }
    onAccept(randomAttack.id);
  };
  
  const handleDecline = () => {
    if (settings.sound) {
      playSoundEffect('click');
    }
    onDecline();
  };
  
  // Handle the close button click (X) - treat it the same as declining
  const handleCloseClick = () => {
    if (settings.sound) {
      playSoundEffect('click');
    }
    onDecline(); // We use onDecline instead of onClose to ensure the level is properly updated
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-crt-background rounded-lg border-2 border-blob-tertiary shadow-lg w-96 max-w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-3 border-b border-blob-tertiary flex justify-between items-center">
          <h3 className="text-white pixel-text text-lg">Level {evolutionLevel} Attack Offer!</h3>
          <button
            className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
            onClick={handleCloseClick}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-3">
              {randomAttack.icon}
            </div>
            <h2 className="text-xl text-white font-bold mb-1">{randomAttack.name}</h2>
            <p className="text-gray-300 text-sm">{randomAttack.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="px-2 py-1 bg-gray-800 rounded text-gray-200 text-xs">
              <span className="block">Type: {randomAttack.type.charAt(0).toUpperCase() + randomAttack.type.slice(1)}</span>
            </div>
            <div className="px-2 py-1 bg-gray-800 rounded text-gray-200 text-xs">
              <span className="block">Category: {randomAttack.category.charAt(0).toUpperCase() + randomAttack.category.slice(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mt-4 text-center">
            Your blob can learn this new attack after reaching level {evolutionLevel}!
          </p>
          
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-700 rounded text-white pixel-text hover:bg-gray-600 transition-colors"
              onClick={handleDecline}
            >
              Decline
            </button>
            <button
              className="px-4 py-2 bg-blob-tertiary rounded text-white pixel-text hover:bg-blob-secondary transition-colors"
              onClick={handleAccept}
            >
              Learn Attack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackOfferModal; 