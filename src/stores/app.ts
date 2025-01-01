/**
 * App store module for managing weather data and user preferences.
 * @module stores/app
 */

import { defineStore } from 'pinia';
import { WeatherService, type WeatherData } from '../services/weather';
import { ref } from 'vue';

/**
 * Interface representing the app store state.
 */
interface AppState {
  currentWeather: WeatherData | null;
  favorites: WeatherData[];
  searchHistory: Array<{
    query: string;
    timestamp: string;
  }>;
  favoriteHistory: Array<{
    action: 'add' | 'remove';
    location: string;
    timestamp: string;
  }>;
  error: string | null;
  loading: boolean;
}

const STORAGE_KEY = 'app-store';

const loadStateFromStorage = (): Partial<AppState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        favorites: data.favorites || [],
        searchHistory: data.searchHistory || [],
        favoriteHistory: data.favoriteHistory || [],
      };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return {};
};

export const useAppStore = defineStore('app', () => {
  type FavoriteHistoryEntry = {
    action: 'add' | 'remove';
    location: string;
    timestamp: string;
  };

  type SearchHistoryEntry = {
    query: string;
    timestamp: string;
  };
  const stored = loadStateFromStorage();

  const currentWeather = ref<WeatherData | null>(null);
  const favorites = ref<WeatherData[]>(stored.favorites || []);
  const searchHistory = ref<SearchHistoryEntry[]>(stored.searchHistory || []);
  const favoriteHistory = ref<FavoriteHistoryEntry[]>(stored.favoriteHistory || []);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          favorites: favorites.value,
          searchHistory: searchHistory.value,
          favoriteHistory: favoriteHistory.value,
        }),
      );
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  };

  const isFavorite = (location: string) =>
    favorites.value.some((fav: WeatherData) => fav.location === location);

  /** Store actions for weather operations */
  /**
   * Searches for weather data by location name.
   * Updates search history on successful search.
   * @param {string} query - Location name to search for
   * @throws {Error} If location search fails
   */
  const searchLocation = async (query: string) => {
    loading.value = true;
    error.value = null;

    try {
      const weather = await WeatherService.searchLocation(query);

      if (weather) {
        currentWeather.value = weather;
        searchHistory.value.unshift({
          query,
          timestamp: new Date().toISOString(),
        });
        // Save to localStorage after updating search history
        saveToStorage();
      } else {
        error.value = 'Location not found';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search location';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Gets weather data for the user's current location.
   * Uses browser geolocation API.
   * @throws {Error} If geolocation fails or weather data fetch fails
   */
  const getCurrentLocationWeather = async () => {
    loading.value = true;
    error.value = null;

    try {
      const weather = await WeatherService.getCurrentLocationWeather();

      if (weather) {
        currentWeather.value = weather;
      } else {
        error.value = 'Failed to get weather for current location';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get current location';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Toggles a location's favorite status.
   * Records the action in favorite history.
   * @param {WeatherData} weather - Weather data for the location to toggle
   */
  const toggleFavorite = (weather: WeatherData) => {
    const index = favorites.value.findIndex(
      (fav: WeatherData) => fav.location === weather.location,
    );

    if (index === -1) {
      favorites.value.push(weather);
      favoriteHistory.value.unshift({
        action: 'add',
        location: weather.location,
        timestamp: new Date().toISOString(),
      });
    } else {
      favorites.value.splice(index, 1);
      favoriteHistory.value.unshift({
        action: 'remove',
        location: weather.location,
        timestamp: new Date().toISOString(),
      });
    }

    // Save to localStorage
    saveToStorage();
  };

  /**
   * Refreshes weather data for all favorite locations.
   * Removes any locations that can no longer be found.
   * @returns {Promise<void>}
   */
  const refreshFavorites = async () => {
    const updatedFavorites = await Promise.all(
      favorites.value.map(async (favorite: WeatherData) => {
        const weather = await WeatherService.searchLocation(favorite.location);
        return weather || favorite;
      }),
    );

    favorites.value = updatedFavorites.filter(
      (weather: WeatherData | null): weather is WeatherData => weather !== null,
    );
    saveToStorage();
  };

  return {
    currentWeather,
    favorites,
    searchHistory,
    favoriteHistory,
    error,
    loading,
    isFavorite,
    searchLocation,
    getCurrentLocationWeather,
    toggleFavorite,
    refreshFavorites,
  };
});
