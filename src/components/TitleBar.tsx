
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TitleBar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="absolute -top-6 left-0 right-0 flex justify-center">
      <div className="bg-crt-dark px-4 md:px-6 py-1 md:py-2 rounded-full border-2 border-blob-tertiary shadow-lg">
        <span className={`pixel-text ${isMobile ? 'text-sm' : 'text-lg'} bg-gradient-to-r from-blob-primary via-blob-secondary to-blob-tertiary bg-clip-text text-transparent`}>
          PixelBlob Life
        </span>
      </div>
    </div>
  );
};

export default TitleBar;
