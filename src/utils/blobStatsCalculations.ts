import { WeatherType, TimeOfDay } from '@/hooks/useWeather';

// Define base decay rates for each stat
const BASE_DECAY_RATES = {
  hunger: 1,
  happiness: 0.5,
  hygiene: 0.3,
  energy: 0.7
};

// Weather impact factors on each stat
const WEATHER_IMPACT = {
  clear: {
    hunger: 1.2,    // Gets hungrier faster in clear weather (more active)
    happiness: 0.7, // Happiness decreases slower in nice weather
    hygiene: 1.0,   // Normal hygiene decay
    energy: 1.1     // Uses slightly more energy in clear weather
  },
  clouds: {
    hunger: 1.0,    // Normal hunger decay
    happiness: 1.1, // Happiness decreases slightly faster in cloudy weather
    hygiene: 1.0,   // Normal hygiene decay
    energy: 0.9     // Uses less energy in cloudy weather
  },
  rain: {
    hunger: 0.8,    // Gets hungrier slower in rainy weather (less active)
    happiness: 1.3, // Happiness decreases faster in rainy weather
    hygiene: 1.5,   // Gets dirty faster in rain
    energy: 0.7     // Uses less energy in rainy weather (less activity)
  },
  snow: {
    hunger: 1.3,    // Gets hungrier faster in snow (needs more energy to stay warm)
    happiness: 1.2, // Happiness decreases faster in snow
    hygiene: 1.3,   // Gets dirty faster in snow
    energy: 1.4     // Uses more energy in snow (staying warm)
  },
  thunderstorm: {
    hunger: 0.7,    // Less hungry during thunderstorms (scared to eat)
    happiness: 1.5, // Happiness decreases faster (scared of thunder)
    hygiene: 1.7,   // Gets dirty faster in stormy weather
    energy: 1.0     // Normal energy use
  },
  fog: {
    hunger: 0.9,    // Slightly less hungry in fog
    happiness: 1.2, // Happiness decreases faster in gloomy fog
    hygiene: 1.1,   // Gets slightly dirty faster in fog
    energy: 1.1     // Uses slightly more energy in fog (harder to navigate)
  },
  loading: {
    hunger: 1.0,    // Default rates when weather is loading
    happiness: 1.0,
    hygiene: 1.0,
    energy: 1.0
  }
};

// Time of day impact factors on each stat
const TIME_IMPACT = {
  sunrise: {
    hunger: 1.3,    // Waking up hungry
    happiness: 0.8, // Happy to see the sunrise
    hygiene: 1.0,   // Normal hygiene decay
    energy: 1.2     // Using energy to wake up
  },
  day: {
    hunger: 1.2,    // Active during day, gets hungrier
    happiness: 0.9, // Generally happier during day
    hygiene: 1.1,   // Gets dirty faster during active daytime
    energy: 1.3     // Uses more energy during day (more active)
  },
  sunset: {
    hunger: 1.1,    // Still active but slowing down
    happiness: 0.9, // Pleasant sunset time
    hygiene: 1.0,   // Normal hygiene decay
    energy: 1.0     // Normal energy use
  },
  night: {
    hunger: 0.6,    // Less hungry at night (resting)
    happiness: 1.1, // Can get a bit lonely/bored at night
    hygiene: 0.7,   // Gets dirty slower at night (less active)
    energy: 0.5     // Recovers energy at night
  }
};

// Calculate decay rates based on weather and time of day
export const calculateDecayRates = (
  weather: WeatherType,
  timeOfDay: TimeOfDay
) => {
  const weatherFactors = WEATHER_IMPACT[weather];
  const timeFactors = TIME_IMPACT[timeOfDay];

  return {
    hunger: BASE_DECAY_RATES.hunger * weatherFactors.hunger * timeFactors.hunger,
    happiness: BASE_DECAY_RATES.happiness * weatherFactors.happiness * timeFactors.happiness,
    hygiene: BASE_DECAY_RATES.hygiene * weatherFactors.hygiene * timeFactors.hygiene,
    energy: BASE_DECAY_RATES.energy * weatherFactors.energy * timeFactors.energy
  };
};

// Calculate special events based on weather and time
export const calculateSpecialEvents = (
  weather: WeatherType,
  timeOfDay: TimeOfDay
) => {
  // Define possible special events
  const events = {
    // Weather-specific events
    isRainyDay: weather === 'rain' || weather === 'thunderstorm',
    isSunnyDay: weather === 'clear' && (timeOfDay === 'day' || timeOfDay === 'sunrise'),
    isStormyNight: weather === 'thunderstorm' && timeOfDay === 'night',
    isSnowDay: weather === 'snow',
    isFoggyMorning: weather === 'fog' && (timeOfDay === 'sunrise' || timeOfDay === 'day'),
    
    // Time-specific events
    isNapTime: timeOfDay === 'day' && (weather === 'clouds' || weather === 'rain'),
    isPlayTime: timeOfDay === 'day' && weather === 'clear',
    isHungryTime: timeOfDay === 'sunrise' || (timeOfDay === 'day' && weather === 'clear'),
    isRelaxTime: timeOfDay === 'sunset',
    isSleepyTime: timeOfDay === 'night'
  };

  return events;
};

// Apply weather and time effects to blob stats change
export const calculateStatsChange = (
  currentStats: {
    hunger: number;
    happiness: number;
    hygiene: number;
    energy: number;
  },
  weather: WeatherType,
  timeOfDay: TimeOfDay,
  timeSinceLastUpdate: number // in milliseconds
) => {
  // Get decay rates
  const decayRates = calculateDecayRates(weather, timeOfDay);
  
  // Calculate how much time has passed in seconds
  const timeFactorInSeconds = timeSinceLastUpdate / 1000;
  
  // Convert to 5-second equivalent (since original was 5-second intervals)
  const timeFactor = timeFactorInSeconds / 5;
  
  // Calculate new stats
  return {
    hunger: Math.max(0, currentStats.hunger - (decayRates.hunger * timeFactor)),
    happiness: Math.max(0, currentStats.happiness - (decayRates.happiness * timeFactor)),
    hygiene: Math.max(0, currentStats.hygiene - (decayRates.hygiene * timeFactor)),
    energy: Math.max(0, currentStats.energy - (decayRates.energy * timeFactor)),
  };
};

// Generate mood messages based on weather and time
export const getMoodMessage = (
  weather: WeatherType,
  timeOfDay: TimeOfDay,
  stats: {
    hunger: number;
    happiness: number;
    hygiene: number;
    energy: number;
  }
) => {
  // Check lowest stat to determine primary need
  let lowestStat = 'happiness';
  let lowestValue = stats.happiness;

  if (stats.hunger < lowestValue) {
    lowestStat = 'hunger';
    lowestValue = stats.hunger;
  }
  if (stats.hygiene < lowestValue) {
    lowestStat = 'hygiene';
    lowestValue = stats.hygiene;
  }
  if (stats.energy < lowestValue) {
    lowestStat = 'energy';
    lowestValue = stats.energy;
  }

  // Special messages based on weather, time, and needs
  const events = calculateSpecialEvents(weather, timeOfDay);

  // Generate appropriate message
  if (lowestValue < 20) {
    switch (lowestStat) {
      case 'hunger':
        return events.isRainyDay 
          ? "I'm hungry but don't want to go out in the rain!"
          : "I'm starving! Need food!";
      case 'happiness':
        return events.isStormyNight
          ? "I'm scared of the thunder and feeling sad!"
          : "I need some playtime to cheer up!";
      case 'hygiene':
        return events.isSnowDay
          ? "I'm all muddy from playing in the snow!"
          : "I need a bath, I'm feeling icky!";
      case 'energy':
        return events.isSunnyDay
          ? "So sleepy even though it's sunny out..."
          : "I need a nap, I'm exhausted!";
      default:
        return "I need some attention!";
    }
  } else if (events.isPlayTime && stats.energy > 40) {
    return "It's such nice weather, let's play outside!";
  } else if (events.isNapTime && stats.energy < 50) {
    return "Perfect weather for a cozy nap...";
  } else if (events.isStormyNight) {
    return "The storm is scary, can you stay with me?";
  } else if (events.isSleepyTime && stats.energy < 70) {
    return "It's getting late, I'm getting sleepy...";
  }

  return "I'm feeling okay right now.";
};

// Generate evolution messages based on new level
export const getEvolutionMessage = (newLevel: number) => {
  switch (newLevel) {
    case 2:
      return "Your blob has evolved to level 2! It's growing bigger!";
    case 3:
      return "Level 3 already! Your blob is becoming more expressive!";
    case 4:
      return "Your blob reached level 4! It's learned new tricks!";
    case 5:
      return "Level 5! Your blob is now a teenager!";
    case 6:
      return "Your blob evolved to level 6! It's becoming an adult!";
    case 7:
      return "Level 7! Your blob has mastered advanced skills!";
    case 8:
      return "Your blob reached level 8! It's now a wise companion!";
    case 9:
      return "Level 9! Your blob is reaching its final form!";
    case 10:
      return "Maximum level 10! Your blob has fully evolved into its ultimate form!";
    default:
      if (newLevel > 10) {
        return "Your blob has transcended normal evolution! It's reached cosmic awareness!";
      }
      return `Your blob has evolved to level ${newLevel}!`;
  }
}; 