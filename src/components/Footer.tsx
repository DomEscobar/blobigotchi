
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
        <a target="_blank" href="https://jam.pieter.com"
          style={{
            fontFamily: 'system-ui, sans-serif',
            position: 'fixed',
            bottom: '-1px',
            right: '-1px',
            padding: '7px',
            fontSize: '14px',
            fontWeight: 'bold',
            background: '#fff',
            color: '#000',
            textDecoration: 'none',
            zIndex: '10',
            borderTopLeftRadius: '12px',
            border: '1px solid #fff',
          }}>🕹️ Vibe Jam 2025</a>
      </p>
    </div>
  );
};

export default Footer;
