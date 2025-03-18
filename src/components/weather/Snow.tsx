import React from 'react';

interface SnowProps {
  intensity?: 'light' | 'moderate' | 'heavy';
}

const Snow: React.FC<SnowProps> = ({ intensity = 'moderate' }) => {
  // Number of snowflakes based on intensity
  const getFlakeCount = () => {
    switch (intensity) {
      case 'light':
        return 40;
      case 'moderate':
        return 80;
      case 'heavy':
        return 120;
      default:
        return 80;
    }
  };

  const flakeCount = getFlakeCount();
  const flakes = Array.from({ length: flakeCount }).map((_, i) => {
    // Create randomized properties for each snowflake
    const size = 2 + Math.random() * 4; // 2px to 6px
    const animationDuration = 5 + Math.random() * 10; // 5s to 15s
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 5}s`;
    const opacity = 0.4 + Math.random() * 0.6; // 0.4 to 1.0
    
    return (
      <div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left,
          top: '-10px',
          opacity,
          animation: `snowfall ${animationDuration}s linear infinite ${animationDelay}, snowWiggle 3s ease-in-out infinite ${Math.random() * 3}s`,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {flakes}
      <style>
        {`
          @keyframes snowfall {
            0% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(100vh);
            }
          }
          
          @keyframes snowWiggle {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(20px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Snow; 