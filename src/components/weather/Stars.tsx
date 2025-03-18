import React from 'react';

interface StarsProps {
  density?: 'low' | 'medium' | 'high';
}

const Stars: React.FC<StarsProps> = ({ density = 'medium' }) => {
  // Number of stars based on density
  const getStarCount = () => {
    switch (density) {
      case 'low':
        return 30;
      case 'medium':
        return 60;
      case 'high':
        return 100;
      default:
        return 60;
    }
  };

  const starCount = getStarCount();
  const stars = Array.from({ length: starCount }).map((_, i) => {
    // Create randomized properties for each star
    const size = 1 + Math.random() * 2; // 1px to 3px
    const left = `${Math.random() * 100}%`;
    const top = `${Math.random() * 50}%`; // Only in the top half of the sky
    const animationDelay = `${Math.random() * 3}s`;
    const animationDuration = 2 + Math.random() * 4; // 2s to 6s
    
    return (
      <div
        key={i}
        className="absolute bg-white rounded-full animate-twinkle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left,
          top,
          animationDelay,
          animationDuration: `${animationDuration}s`,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {stars}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
          .animate-twinkle {
            animation-name: twinkle;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Stars; 