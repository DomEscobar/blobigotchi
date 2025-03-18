import React from 'react';
import { WeatherType, TimeOfDay } from '@/hooks/useWeather';
import Rain from './Rain';
import Snow from './Snow';
import Clouds from './Clouds';
import Sun from './Sun';
import Moon from './Moon';
import Stars from './Stars';

interface WeatherEffectsProps {
  weatherType: WeatherType;
  timeOfDay: TimeOfDay;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weatherType, timeOfDay }) => {
  if (weatherType === 'loading') {
    return null;
  }

  // Render the time-of-day elements (sun, moon, stars)
  const renderTimeOfDayElements = () => {
    if (timeOfDay === 'night') {
      return (
        <>
          <Stars density="medium" />
          <Moon />
        </>
      );
    }
    return <Sun timeOfDay={timeOfDay} />;
  };

  // Render different weather effects based on weather type
  const renderWeatherEffects = () => {
    switch (weatherType) {
      case 'rain':
        return <Rain intensity="moderate" />;
      case 'thunderstorm':
        return (
          <>
            <Rain intensity="heavy" />
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="thunder-flash" />
              <style>
                {`
                  .thunder-flash {
                    position: absolute;
                    inset: 0;
                    background-color: rgba(255, 255, 255, 0);
                    animation: thunder 8s linear infinite;
                  }
                  
                  @keyframes thunder {
                    0%, 96%, 98% {
                      background-color: rgba(255, 255, 255, 0);
                    }
                    97%, 97.5% {
                      background-color: rgba(255, 255, 255, 0.7);
                    }
                  }
                `}
              </style>
            </div>
          </>
        );
      case 'snow':
        return <Snow intensity="moderate" />;
      case 'clouds':
        return <Clouds density="moderate" />;
      case 'fog':
        return (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 bg-gray-200 opacity-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white opacity-20"
                style={{
                  width: '100%',
                  height: `${20 + i * 10}px`,
                  top: `${10 + i * 20}%`,
                  animation: `fog-drift ${30 + i * 10}s linear infinite ${i * -5}s`,
                }}
              />
            ))}
            <style>
              {`
                @keyframes fog-drift {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
              `}
            </style>
          </div>
        );
      case 'clear':
      default:
        // No weather effects for clear weather
        return null;
    }
  };

  return (
    <>
      {renderTimeOfDayElements()}
      {renderWeatherEffects()}
    </>
  );
};

export default WeatherEffects; 