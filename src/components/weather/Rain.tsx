import React from 'react';

interface RainProps {
  intensity?: 'light' | 'moderate' | 'heavy';
}

const Rain: React.FC<RainProps> = ({ intensity = 'moderate' }) => {
  // Number of raindrops based on intensity
  const getDropCount = () => {
    switch (intensity) {
      case 'light':
        return 50;
      case 'moderate':
        return 100;
      case 'heavy':
        return 150;
      default:
        return 100;
    }
  };

  const dropCount = getDropCount();
  const drops = Array.from({ length: dropCount }).map((_, i) => {
    // Create randomized properties for each raindrop
    const animationDuration = 0.5 + Math.random() * 0.5; // 0.5 to 1s
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 2}s`;
    const opacity = 0.2 + Math.random() * 0.6; // 0.2 to 0.8
    
    return (
      <div
        key={i}
        className="absolute bg-blue-100 rounded-full"
        style={{
          width: '1px',
          height: `${5 + Math.random() * 10}px`, // 5px to 15px
          left,
          top: '-20px',
          opacity,
          animation: `rainfall ${animationDuration}s linear infinite ${animationDelay}`,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {drops}
      <style>
        {`
          @keyframes rainfall {
            0% {
              transform: translateY(-20px);
            }
            100% {
              transform: translateY(100vh);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Rain; 