import React, { useState } from 'react';
import Blob, { BlobMood } from './Blob';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import ToyBox from './ToyBox';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';
import BabyRoom from './environments/BabyRoom';
import AdultRoom from './environments/AdultRoom';
import BattleArcade from './BattleArcade';
import BlobBattlegroundsWithProvider from './BlobBattlegrounds';
import AppearanceTreasure from './AppearanceTreasure';
import { useBlobAppearance } from '@/hooks/useBlobAppearance';
import { useWeather } from '@/hooks/useWeather';
import WeatherEffects from './weather/WeatherEffects';

interface HabitatProps {
  mood: BlobMood;
  onBlobClick: () => void;
  className?: string;
  evolutionLevel?: number;
  isBattlegroundsOpen: boolean;
  setIsBattlegroundsOpen: (open: boolean) => void;
}

const Habitat: React.FC<HabitatProps> = ({ mood, onBlobClick, className = '', evolutionLevel = 1, isBattlegroundsOpen, setIsBattlegroundsOpen }) => {
  const isMobile = useIsMobile();
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);
  const [isTvOn, setIsTvOn] = useState(false);
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();
  const { appearance, unlockedOptions, setType, setEyes, setMouth, setAttack, resetAppearance } = useBlobAppearance(evolutionLevel);
  const { weather, locationSource } = useWeather();

  const handleFridgeClick = () => {
    setIsFridgeOpen(prev => !prev);

    if (settings.sound) {
      playSoundEffect('click');
    }

    if (!isFridgeOpen) {
      toast("Opening fridge...", {
        description: "Found: Glow Berries, Mystery Meat",
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 3000,
      });
    } else {
      toast("Closing fridge...", {
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 1500,
      });
    }
  };

  const handleTvClick = () => {
    setIsTvOn(prev => !prev);

    if (settings.sound) {
      playSoundEffect('click');
    }

    if (isTvOn) {
      toast("TV powered off", {
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 1500,
      });
    } else {
      toast("Channel surfing...", {
        description: "Mini-games coming soon!",
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 3000,
      });
    }
  };

  const handleBlobClickWithSound = () => {
    if (settings.sound) {
      playSoundEffect('play');
    }
    onBlobClick();
  };

  const handleToyInteraction = () => {
    onBlobClick();
    onBlobClick();
  };

  const handleBattleArcadeClick = () => {
    if (settings.sound) {
      playSoundEffect('click');
    }

    // Open battle arcade dialog
    setIsBattlegroundsOpen(true);
  };

  const getBgClass = () => {
    // First adjust based on time of day
    if (weather.timeOfDay === 'night') {
      // Night backgrounds
      if (weather.type === 'thunderstorm') {
        return 'from-indigo-950/95 to-gray-950/98'; 
      } else if (weather.type === 'rain') {
        return 'from-blue-950/90 to-gray-950/95';
      } else if (weather.type === 'snow') {
        return 'from-blue-950/70 to-gray-800/80';
      } else if (weather.type === 'fog') {
        return 'from-gray-700/80 to-gray-900/90';
      } else if (weather.type === 'clouds') {
        return 'from-indigo-900/80 to-gray-900/90';
      } else {
        // Clear night sky
        return 'from-indigo-900/70 to-gray-950/90';
      }
    } else if (weather.timeOfDay === 'sunrise') {
      // Sunrise backgrounds
      if (weather.type === 'thunderstorm') {
        return 'from-purple-700/80 to-gray-800/90'; 
      } else if (weather.type === 'rain') {
        return 'from-blue-600/70 to-gray-700/85';
      } else if (weather.type === 'snow') {
        return 'from-blue-300/60 to-gray-400/70';
      } else if (weather.type === 'fog') {
        return 'from-gray-400/80 to-orange-200/50';
      } else if (weather.type === 'clouds') {
        return 'from-orange-300/60 to-blue-400/70';
      } else {
        // Clear sunrise
        return 'from-orange-400/50 to-blue-600/70';
      }
    } else if (weather.timeOfDay === 'sunset') {
      // Sunset backgrounds
      if (weather.type === 'thunderstorm') {
        return 'from-red-800/70 to-gray-800/90'; 
      } else if (weather.type === 'rain') {
        return 'from-red-600/60 to-gray-700/85';
      } else if (weather.type === 'snow') {
        return 'from-orange-200/60 to-gray-400/70';
      } else if (weather.type === 'fog') {
        return 'from-orange-300/70 to-gray-500/80';
      } else if (weather.type === 'clouds') {
        return 'from-orange-500/60 to-gray-600/70';
      } else {
        // Clear sunset
        return 'from-orange-500/60 to-indigo-800/70';
      }
    } else {
      // Daytime backgrounds
      if (weather.type === 'thunderstorm') {
        return 'from-indigo-600/80 to-gray-800/90'; 
      } else if (weather.type === 'rain') {
        return 'from-blue-600/70 to-gray-700/80';
      } else if (weather.type === 'snow') {
        return 'from-blue-100/60 to-gray-300/70';
      } else if (weather.type === 'fog') {
        return 'from-gray-300/80 to-gray-500/90';
      } else if (weather.type === 'clouds') {
        return 'from-blue-400/70 to-gray-500/80';
      } else {
        // Clear day - adjust based on mood
        if (['sad', 'hungry', 'tired', 'sick'].includes(mood)) {
          return 'from-crt-background/90 to-crt-dark/95';
        } else if (mood === 'happy') {
          return 'from-crt-background to-crt-dark/80';
        }
        return 'from-crt-background to-crt-dark';
      }
    }
  };

  return (
    <>
      <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${getBgClass()} transition-all duration-1000`}>
          {/* Show weather effects based on current weather */}
          {settings.enableWeatherEffects !== false && 
            <WeatherEffects 
              weatherType={weather.type} 
              timeOfDay={weather.timeOfDay} 
            />
          }

          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-24 w-full overflow-hidden">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-conic-gradient(${weather.timeOfDay === 'night' ? '#222 0% 25%, #333' : '#333 0% 25%, #444'} 0% 50%)`,
              backgroundSize: '32px 32px',
              transform: 'perspective(300px) rotateX(45deg)',
              transformOrigin: 'bottom'
            }}></div>
          </div>

          {/* Render environment based on evolution level */}
          {evolutionLevel <= 1 && (
            <div className="absolute top-8 left-0 right-0 flex justify-center">
              <div className="p-2 bg-gray-500/20 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="pixel-text text-[10px] text-white/70">Egg Incubation Chamber</span>
              </div>
            </div>
          )}

          {/* Battle Arcade - available at all evolution levels */}
          <div className="absolute bottom-4 left-4 z-50">
            <BattleArcade onClick={handleBattleArcadeClick} isMobile={isMobile} />
          </div>

          {/* Appearance Treasure - available at evolution level 2+ */}
          {evolutionLevel >= 2 && (
            <AppearanceTreasure 
              appearance={appearance}
              unlockedOptions={unlockedOptions}
              onColorChange={setType}
              onEyesChange={setEyes}
              onMouthChange={setMouth}
              onAccessoryChange={setAttack}
              onReset={resetAppearance}
              evolutionLevel={evolutionLevel}
            />
          )}

          {evolutionLevel >= 2 && evolutionLevel <= 10 && (
            <>
              {/* Basic environment for blob phase */}
              <div
                className={`absolute right-4 top-12 w-16 h-12 bg-gray-800 rounded-lg border-2 border-gray-700 cursor-pointer transition-all duration-300 ${isTvOn ? 'shadow-[0_0_8px_rgba(0,150,255,0.7)]' : ''}`}
                onClick={handleTvClick}
              >
                <div className={`w-full h-8 rounded-t-sm overflow-hidden transition-colors duration-300 ${isTvOn ? 'bg-blue-400/80' : 'bg-gray-600/50'}`}>
                  {isTvOn ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-4 bg-yellow-400 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-70 ml-2 mt-2"></div>
                  )}
                </div>
                <div className="flex justify-center mt-1 space-x-1">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>

              <div
                className={`absolute left-4 top-12 w-10 h-14 bg-gray-300 rounded-sm border border-gray-500 cursor-pointer transition-transform duration-300 ${isFridgeOpen ? 'transform -translate-y-1' : ''}`}
                onClick={handleFridgeClick}
              >
                <div className={`w-full h-8 bg-gray-200 rounded-t-sm border-b border-gray-500 transition-all duration-300 origin-left ${isFridgeOpen ? 'transform rotate-[60deg] shadow-md' : ''}`}>
                  <div className="w-1 h-2 bg-gray-500 rounded-full ml-auto mr-1 mt-2"></div>
                </div>

                {isFridgeOpen && (
                  <div className="absolute top-1 left-1 w-8 h-6 bg-cyan-50 rounded-sm p-0.5">
                    <div className="w-2 h-1.5 bg-blob-happy rounded-sm absolute top-1 left-1"></div>
                    <div className="w-3 h-1.5 bg-blob-hungry rounded-sm absolute bottom-1 right-1"></div>
                  </div>
                )}

                <div className="w-full h-1 bg-gray-500 rounded-full mt-8"></div>
                <div className="w-1 h-2 bg-gray-500 rounded-full ml-1 mt-2"></div>
              </div>

              <div className="absolute right-6 top-4 w-8 h-8 rounded-full border-2 border-blob-tertiary" style={{
                boxShadow: '0 0 5px rgba(170, 85, 255, 0.5)'
              }}>
                <div className="w-4 h-1 bg-blob-tertiary absolute top-4 left-2 rounded-full transform origin-right rotate-45"></div>
                <div className="w-3 h-1 bg-blob-tertiary absolute top-4 left-3 rounded-full transform origin-left -rotate-45"></div>
                <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-3.5"></div>
              </div>
            </>
          )}

          {evolutionLevel >= 6 && evolutionLevel <= 10 && (
            <BabyRoom onInteraction={handleToyInteraction} />
          )}

          {evolutionLevel >= 11 && (
            <AdultRoom onInteraction={handleToyInteraction} mood={mood} />
          )}

          {/* Weather Info Indicator - shows current weather and time info */}
          {weather.type !== 'loading' && (
            <div className="absolute top-2 left-2 p-1.5 bg-crt-dark/70 backdrop-blur-sm rounded-md border border-white/10 z-30">
              <div className="flex flex-col space-y-0.5">
                <div className="flex items-center space-x-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      weather.type === 'clear' ? 'bg-yellow-400' : 
                      weather.type === 'clouds' ? 'bg-gray-300' : 
                      weather.type === 'rain' ? 'bg-blue-400' : 
                      weather.type === 'snow' ? 'bg-white' : 
                      weather.type === 'thunderstorm' ? 'bg-purple-500' : 
                      'bg-gray-400'
                    }`}
                  />
                  <span className="pixel-text text-[8px] text-white">
                    {weather.description} • {weather.timeOfDay}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="pixel-text text-[7px] text-white/70">
                    {weather.location} 
                    <span className="text-[6px] ml-1 text-white/50">
                      {locationSource === 'browser' ? '(GPS)' : 
                       locationSource === 'ip' ? '(IP)' : 
                       '(default)'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {mood === 'happy' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 bottom-24 transform -translate-x-1/2 w-24 h-24 opacity-50">
                <div className="absolute w-3 h-3 rounded-full bg-blob-happy animate-blob-idle"
                  style={{ left: '40%', top: '30%', animationDelay: '0.5s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-blob-tertiary animate-blob-idle"
                  style={{ left: '60%', top: '40%', animationDelay: '1s' }}></div>
                <div className="absolute w-2 h-2 rounded-full bg-blob-secondary animate-blob-idle"
                  style={{ left: '30%', top: '50%', animationDelay: '1.5s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute left-1/2 bottom-16 transform -translate-x-1/2">
          <Blob mood={mood} onClick={handleBlobClickWithSound} evolutionLevel={evolutionLevel} appearance={appearance} />
        </div>

        {/* Show toy box only for certain evolution levels */}
        {evolutionLevel >= 3 && evolutionLevel < 7 && (
          <ToyBox onToyInteraction={handleToyInteraction} />
        )}
      </div>
    </>
  );
};

export default Habitat;
