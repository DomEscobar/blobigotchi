import React from 'react';

interface CloudsProps {
  density?: 'light' | 'moderate' | 'heavy';
}

const Clouds: React.FC<CloudsProps> = ({ density = 'moderate' }) => {
  // Number of clouds based on density
  const getCloudCount = () => {
    switch (density) {
      case 'light':
        return 3;
      case 'moderate':
        return 5;
      case 'heavy':
        return 8;
      default:
        return 5;
    }
  };

  const cloudCount = getCloudCount();
  const clouds = Array.from({ length: cloudCount }).map((_, i) => {
    // Create randomized properties for each cloud
    const width = 70 + Math.random() * 130; // 70px to 200px
    const top = `${5 + (Math.random() * 40)}%`;
    const left = `${(i * 100 / cloudCount) + (Math.random() * 20 - 10)}%`;
    const opacity = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
    const animationDuration = 80 + Math.random() * 40; // 80s to 120s
    const animationDelay = `${Math.random() * -40}s`; // Stagger the starting positions
    const brightness = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    return (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${width}px`,
          height: `${width * 0.6}px`,
          top,
          left,
          opacity,
          animation: `cloud-drift ${animationDuration}s linear infinite ${animationDelay}`,
          filter: `brightness(${brightness})`,
          boxShadow: '0 0 30px 10px rgba(255, 255, 255, 0.3)',
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {clouds}
      <style>
        {`
          @keyframes cloud-drift {
            0% {
              transform: translateX(0%);
            }
            50% {
              transform: translateX(100%);
            }
            50.01% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(0%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Clouds; 