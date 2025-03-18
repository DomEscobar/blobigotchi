import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  sound: boolean;
  notifications: boolean;
  enableWeatherEffects: boolean;
  darkMode: boolean;
  theme: 'default' | 'blue' | 'green' | 'pink';
  devMode?: boolean;
}

const initialState: SettingsState = {
  sound: true,
  notifications: true,
  enableWeatherEffects: true,
  darkMode: false,
  theme: 'default'
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.sound = !state.sound;
    },
    setSound: (state, action: PayloadAction<boolean>) => {
      state.sound = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    toggleWeatherEffects: (state) => {
      state.enableWeatherEffects = !state.enableWeatherEffects;
    },
    setWeatherEffects: (state, action: PayloadAction<boolean>) => {
      state.enableWeatherEffects = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setTheme: (state, action: PayloadAction<'default' | 'blue' | 'green' | 'pink'>) => {
      state.theme = action.payload;
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      state.devMode = action.payload;
    },
    setAllSettings: (state, action: PayloadAction<SettingsState>) => {
      return action.payload;
    }
  }
});

export const {
  toggleSound, setSound,
  toggleNotifications, setNotifications,
  toggleWeatherEffects, setWeatherEffects,
  toggleDarkMode, setDarkMode,
  setTheme, setDevMode, setAllSettings
} = settingsSlice.actions;

export default settingsSlice.reducer; 