
import React from 'react';
import Blob, { BlobMood } from './Blob';

interface HabitatProps {
  mood: BlobMood;
  onBlobClick: () => void;
  className?: string;
}

const Habitat: React.FC<HabitatProps> = ({ mood, onBlobClick, className = '' }) => {
  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
      {/* Habitat background */}
      <div className="absolute inset-0 bg-gradient-to-b from-crt-background to-crt-dark">
        {/* Checkerboard floor pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-24 w-full overflow-hidden">
          <div className="w-full h-full" style={{ 
            backgroundImage: `repeating-conic-gradient(#333 0% 25%, #444 0% 50%)`, 
            backgroundSize: '32px 32px',
            transform: 'perspective(300px) rotateX(45deg)',
            transformOrigin: 'bottom'
          }}></div>
        </div>
        
        {/* TV in the background */}
        <div className="absolute right-4 top-12 w-16 h-12 bg-gray-800 rounded-lg border-2 border-gray-700">
          <div className="w-full h-8 bg-gray-600/50 rounded-t-sm overflow-hidden">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-70 ml-2 mt-2"></div>
          </div>
          <div className="flex justify-center mt-1 space-x-1">
            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Mini fridge */}
        <div className="absolute left-4 top-12 w-10 h-14 bg-gray-300 rounded-sm border border-gray-500">
          <div className="w-full h-1 bg-gray-500 rounded-full mt-8"></div>
          <div className="w-1 h-2 bg-gray-500 rounded-full ml-1 mt-2"></div>
        </div>
        
        {/* Neon clock */}
        <div className="absolute right-6 top-4 w-8 h-8 rounded-full border-2 border-blob-tertiary" style={{
          boxShadow: '0 0 5px rgba(170, 85, 255, 0.5)'
        }}>
          <div className="w-4 h-1 bg-blob-tertiary absolute top-4 left-2 rounded-full transform origin-right rotate-45"></div>
          <div className="w-3 h-1 bg-blob-tertiary absolute top-4 left-3 rounded-full transform origin-left -rotate-45"></div>
          <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-3.5"></div>
        </div>
      </div>
      
      {/* Blob positioning */}
      <div className="absolute left-1/2 bottom-16 transform -translate-x-1/2">
        <Blob mood={mood} onClick={onBlobClick} />
      </div>
    </div>
  );
};

export default Habitat;
