import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useWeather } from '@/hooks/useWeather';

const WeatherSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { weather } = useWeather();

  const toggleWeatherEffects = () => {
    updateSettings({ enableWeatherEffects: !settings.enableWeatherEffects });
  };

  return (
    <div className="p-3 bg-crt-dark/80 rounded-lg border border-white/10 backdrop-blur-sm">
      <h3 className="pixel-text text-white text-sm mb-2">Weather Settings</h3>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="pixel-text text-xs text-white/80">
            Show Real-World Weather Effects
          </label>
          <div 
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
              settings.enableWeatherEffects ? 'bg-blob-happy' : 'bg-gray-600'
            }`}
            onClick={toggleWeatherEffects}
          >
            <div 
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.enableWeatherEffects ? 'transform translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>
        
        {/* Current weather info */}
        <div className="mt-2 text-xs pixel-text text-white/70">
          <div>Current weather: <span className="text-white">{weather.description}</span></div>
          <div>Location: <span className="text-white">{weather.location || 'Unknown'}</span></div>
          <div>Temperature: <span className="text-white">{weather.temp}°C</span></div>
        </div>
        
        <div className="mt-1 text-xs pixel-text text-white/60 italic">
          Weather data updates every 30 minutes.
        </div>
      </div>
    </div>
  );
};

export default WeatherSettings; 