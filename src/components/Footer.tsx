
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`mt-3 md:mt-4 text-center ${className}`}>
      <p className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-400`}>
        Take good care of your virtual pet! Interact regularly to help it evolve.
      </p>
    </div>
  );
};

export default Footer;
