/**
 * App store module for managing weather data and user preferences.
 * @module stores/app
 */

import { defineStore } from 'pinia';
import { WeatherService, type WeatherData } from '../services/weather';
import { ref } from 'vue';
import {
  getFavorites,
  addFavorite as addFavoriteToApi,
  removeFavorite as removeFavoriteFromApi,
  getHistory,
  addHistory as addHistoryToApi,
} from '../services/appData';

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
  const currentWeather = ref<WeatherData | null>(null);
  const favorites = ref<WeatherData[]>([]);
  const searchHistory = ref<SearchHistoryEntry[]>([]);
  const error = ref<string | null>(null);
  const loading = ref(false);

  // Load initial data from backend
  const loadFavorites = async () => {
    const data = await getFavorites();
    favorites.value = data.map((favorite) => ({
      id: favorite.id,
      temperature: 0, // Will be updated by refreshFavorites
      humidity: 0,
      windSpeed: 0,
      description: '',
      location: favorite.city,
      coordinates: {
        latitude: favorite.coordinates.lat,
        longitude: favorite.coordinates.lon,
      },
    }));
  };

  const loadHistory = async () => {
    const data = await getHistory();
    searchHistory.value = data
      .filter((entry) => entry.type === 'search')
      .map((entry) => ({
        query: entry.details.query || '',
        timestamp: entry.timestamp,
      }));
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
        await addHistoryToApi({
          type: 'search',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            query,
            success: true,
          },
        });
        await loadHistory();
      } else {
        error.value = 'Location not found';
        await addHistoryToApi({
          type: 'search',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            query,
            success: false,
          },
        });
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
  const toggleFavorite = async (weather: WeatherData) => {
    const index = favorites.value.findIndex(
      (fav: WeatherData) => fav.location === weather.location,
    );

    if (index === -1) {
      const added = await addFavoriteToApi(weather);
      if (added) {
        await loadFavorites();
        await addHistoryToApi({
          type: 'search',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            query: weather.location,
            success: true,
          },
        });
      }
    } else {
      const removed = await removeFavoriteFromApi(favorites.value[index].id || '');
      if (removed) {
        await loadFavorites();
        await addHistoryToApi({
          type: 'search',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            query: weather.location,
            success: true,
          },
        });
      }
    }
  };

  /**
   * Refreshes weather data for all favorite locations.
   * Removes any locations that can no longer be found.
   * @returns {Promise<void>}
   */
  const refreshFavorites = async () => {
    await loadFavorites(); // Reload favorites from backend
    const updatedFavorites = await Promise.all(
      favorites.value.map(async (favorite: WeatherData) => {
        const weather = await WeatherService.searchLocation(favorite.location);
        if (weather) {
          await addFavoriteToApi({
            ...weather,
            id: favorite.id,
          });
        }
        return weather || favorite;
      }),
    );

    favorites.value = updatedFavorites.filter(
      (weather: WeatherData | null): weather is WeatherData => weather !== null,
    );
    await loadFavorites(); // Reload to get updated data
  };

  return {
    currentWeather,
    favorites,
    searchHistory,
    error,
    loading,
    isFavorite,
    searchLocation,
    getCurrentLocationWeather,
    toggleFavorite,
    refreshFavorites,
    loadFavorites,
    loadHistory,
  };
});
