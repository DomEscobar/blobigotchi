import React from 'react';
import { TimeOfDay } from '@/hooks/useWeather';

interface SunProps {
  timeOfDay: TimeOfDay;
}

const Sun: React.FC<SunProps> = ({ timeOfDay }) => {
  // Position and appearance based on time of day
  const getPositionAndAppearance = () => {
    switch (timeOfDay) {
      case 'sunrise':
        return {
          position: 'left-10 top-10',
          color: 'bg-amber-400',
          glow: '0 0 40px 20px rgba(251, 191, 36, 0.5)',
          size: 'w-14 h-14'
        };
      case 'day':
        return {
          position: 'left-1/2 -translate-x-1/2 top-8',
          color: 'bg-yellow-300',
          glow: '0 0 40px 20px rgba(252, 211, 77, 0.6)',
          size: 'w-16 h-16'
        };
      case 'sunset':
        return {
          position: 'right-10 top-10',
          color: 'bg-orange-400',
          glow: '0 0 40px 20px rgba(251, 146, 60, 0.5)',
          size: 'w-14 h-14'
        };
      default:
        return {
          position: 'left-1/2 -translate-x-1/2 top-8',
          color: 'bg-yellow-400',
          glow: '0 0 40px 20px rgba(250, 204, 21, 0.5)',
          size: 'w-16 h-16'
        };
    }
  };
  
  const { position, color, glow, size } = getPositionAndAppearance();
  
  // Only render for sunrise, day, and sunset
  if (timeOfDay === 'night') {
    return null;
  }
  
  return (
    <div className={`absolute ${position} ${size} rounded-full ${color} transform transition-all duration-[60000ms]`}
      style={{ boxShadow: glow }}>
      {/* Sun rays */}
      <div className="absolute inset-0 animate-spin-slow duration-30s opacity-80">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className={`absolute ${color} h-1.5 w-8 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80`}
            style={{ transform: `translateX(-50%) translateY(-50%) rotate(${i * 45}deg)` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Sun; 