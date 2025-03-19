import { useState, useEffect } from 'react';

export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'fog' | 'loading';
export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night';

export interface WeatherData {
  type: WeatherType;
  description: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  location: string;
  time: string;
  timeOfDay: TimeOfDay;
  isDay: boolean;
}

// Default to 'loading' weather state
const defaultWeather: WeatherData = {
  type: 'loading',
  description: 'Loading weather data...',
  temp: 0,
  humidity: 0,
  windSpeed: 0,
  location: '',
  time: '',
  timeOfDay: 'day',
  isDay: true,
};

// Map WMO weather codes to our weather types
// https://open-meteo.com/en/docs#weathervariables
const getWeatherTypeFromWMO = (code: number): WeatherType => {
  // Clear: 0
  if (code === 0) {
    return 'clear';
  }
  // Cloudy: 1-3, partly cloudy
  else if (code >= 1 && code <= 3) {
    return 'clouds';
  }
  // Fog: 45, 48
  else if (code === 45 || code === 48) {
    return 'fog';
  }
  // Rain: 51-67, 80-82 (drizzle, rain)
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'rain';
  }
  // Snow: 71-77, 85-86 (snow)
  else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return 'snow';
  }
  // Thunderstorm: 95-99
  else if (code >= 95 && code <= 99) {
    return 'thunderstorm';
  }
  // Default to clouds
  return 'clouds';
};

// Get weather description from WMO code
const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Depositing rime fog';
    case 51: return 'Light drizzle';
    case 53: return 'Moderate drizzle';
    case 55: return 'Dense drizzle';
    case 56: return 'Light freezing drizzle';
    case 57: return 'Dense freezing drizzle';
    case 61: return 'Slight rain';
    case 63: return 'Moderate rain';
    case 65: return 'Heavy rain';
    case 66: return 'Light freezing rain';
    case 67: return 'Heavy freezing rain';
    case 71: return 'Slight snow fall';
    case 73: return 'Moderate snow fall';
    case 75: return 'Heavy snow fall';
    case 77: return 'Snow grains';
    case 80: return 'Slight rain showers';
    case 81: return 'Moderate rain showers';
    case 82: return 'Violent rain showers';
    case 85: return 'Slight snow showers';
    case 86: return 'Heavy snow showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with slight hail';
    case 99: return 'Thunderstorm with heavy hail';
    default: return 'Unknown weather';
  }
};

// Determine time of day based on hour
const getTimeOfDay = (dateTime: string): TimeOfDay => {
  const hour = new Date(dateTime).getHours();

  if (hour >= 5 && hour < 8) {
    return 'sunrise';
  } else if (hour >= 8 && hour < 18) {
    return 'day';
  } else if (hour >= 18 && hour < 21) {
    return 'sunset';
  } else {
    return 'night';
  }
};

// Check if it's daytime
const isDay = (timeOfDay: TimeOfDay): boolean => {
  return timeOfDay === 'day' || timeOfDay === 'sunrise';
};

// Reverse geocoding to get location name from coordinates
const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown location';
  }
};

// Get location from IP address
const getLocationFromIP = async (): Promise<{ latitude: number; longitude: number }> => {
  // First try geojs.io (reliable, no API key needed)
  try {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');

    if (!response.ok) {
      throw new Error(`geojs.io error: ${response.status}`);
    }

    const data = await response.json();

    if (data[0] && data[0].latitude && data[0].longitude) {
      console.log('Using geojs.io geolocation');
      return {
        latitude: parseFloat(data[0].latitude),
        longitude: parseFloat(data[0].longitude)
      };
    }
    throw new Error('geojs.io did not return valid coordinates');
  } catch (error) {
    console.warn('First IP geolocation service failed, trying second service', error);

    // Try second IP geolocation service
    try {
      // Using ipwhois.io (free tier, no API key required)
      const response = await fetch('https://ipwho.is/');

      if (!response.ok) {
        throw new Error(`ipwho.is error: ${response.status}`);
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        console.log('Using ipwho.is geolocation');
        return {
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
      throw new Error('ipwho.is did not return valid coordinates');
    } catch (secondError) {
      console.warn('Second IP geolocation service failed, trying third service', secondError);

      // Try third IP geolocation service as final fallback
      try {
        // Using Abstract API's free geolocation service with no key required
        const response = await fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=9b2b40e093f24aa5ae6726eb12bae165');

        if (!response.ok) {
          throw new Error(`Abstract API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.latitude && data.longitude) {
          console.log('Using Abstract API geolocation');
          return {
            latitude: data.latitude,
            longitude: data.longitude
          };
        }
        throw new Error('Abstract API did not return valid coordinates');
      } catch (thirdError) {
        console.error('All IP geolocation services failed:', thirdError);
        throw thirdError;
      }
    }
  }
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationSource, setLocationSource] = useState<string>('unknown');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);

        // Default coordinates (New York) as final fallback
        let latitude = 40.7128;
        let longitude = -74.0060;
        let locSource = 'default';

        try {
          try {
            const ipLocation = await getLocationFromIP();
            latitude = ipLocation.latitude;
            longitude = ipLocation.longitude;
            locSource = 'ip';
          } catch (ipError) {
            console.warn('IP geolocation failed, using default coordinates', ipError);
            // Use default coordinates
          }
        } catch (locationError) {
          console.warn('Location detection failed completely, using default', locationError);
        }

        setLocationSource(locSource);

        // Using Open-Meteo API which doesn't require an API key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        // Get current weather data
        const currentWeather = data.current;

        // Get weather type from WMO code
        const weatherCode = currentWeather.weather_code;
        const weatherType = getWeatherTypeFromWMO(weatherCode);
        const weatherDescription = getWeatherDescription(weatherCode);

        // Get location name
        const locationName = await getLocationName(latitude, longitude);

        // Determine time of day
        const currentDateTime = currentWeather.time;
        const timeOfDay = getTimeOfDay(currentDateTime);
        const dayStatus = isDay(timeOfDay);

        setWeather({
          type: weatherType,
          description: weatherDescription,
          temp: currentWeather.temperature_2m,
          humidity: currentWeather.relative_humidity_2m,
          windSpeed: currentWeather.wind_speed_10m,
          location: locationName,
          time: currentDateTime,
          timeOfDay: timeOfDay,
          isDay: dayStatus
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Failed to fetch weather data');
        // Keep current weather state if there was an error
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return { weather, error, loading, locationSource };
}; 