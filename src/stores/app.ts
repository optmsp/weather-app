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
  type SearchHistoryEntry = {
    query: string;
    timestamp: string;
  };
  const currentWeather = ref<WeatherData | null>(null);
  const favorites = ref<WeatherData[]>([]);
  const searchHistory = ref<SearchHistoryEntry[]>([]);
  const favoriteHistory = ref<
    Array<{ action: 'add' | 'remove'; location: string; timestamp: string }>
  >([]);
  const error = ref<string | null>(null);
  const loading = ref(false);

  // Load initial data from backend
  const loadFavorites = async (skipRefresh: boolean = false) => {
    const data = await getFavorites();
    favorites.value = data.map((favorite) => ({
      id: favorite.id,
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      description: '',
      location: favorite.city,
      coordinates: {
        latitude: favorite.coordinates.lat,
        longitude: favorite.coordinates.lon,
      },
    }));

    // Refresh weather data for all favorites unless explicitly skipped
    if (!skipRefresh) {
      const updatedFavorites = await Promise.all(
        favorites.value.map(async (favorite) => {
          const weatherResults = await WeatherService.searchLocation(favorite.location);
          // Use first exact match or keep existing favorite
          return (weatherResults && weatherResults.length > 0) ? weatherResults[0] : favorite;
        }),
      );
      favorites.value = updatedFavorites.filter(
        (weather): weather is WeatherData => weather !== null,
      );
    }
  };

  const loadHistory = async () => {
    const data = await getHistory();

    // Load search history
    searchHistory.value = data
      .filter((entry) => entry.type === 'search')
      .map((entry) => ({
        query: entry.details.query || '',
        timestamp: entry.timestamp,
      }));

    // Load favorite history
    favoriteHistory.value = data
      .filter((entry) => entry.type === 'favorite')
      .map((entry) => ({
        action: entry.details.action as 'add' | 'remove',
        location: entry.details.location || '',
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
      const weatherResults = await WeatherService.searchLocation(query);

      if (weatherResults && weatherResults.length > 0) {
        // For now, use the first result until UI is updated to handle multiple results
        currentWeather.value = weatherResults[0];
        await addHistoryToApi({
          type: 'search',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            query,
            success: true,
            resultCount: weatherResults.length
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
            resultCount: 0
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
        // Update favorites array directly instead of reloading
        favorites.value = [
          ...favorites.value,
          {
            ...weather,
            id: added.id,
          },
        ];

        await addHistoryToApi({
          type: 'favorite',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            action: 'add',
            location: weather.location,
          },
        });
      }
    } else {
      const removed = await removeFavoriteFromApi(favorites.value[index].id || '');
      if (removed) {
        // Update favorites array directly instead of reloading
        favorites.value = favorites.value.filter((_, i) => i !== index);

        await addHistoryToApi({
          type: 'favorite',
          userId: '', // Will be set by API service
          timestamp: new Date().toISOString(),
          details: {
            action: 'remove',
            location: weather.location,
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
    // Load favorites with skipRefresh=true to avoid recursive refresh
    await loadFavorites(true);
    const updatedFavorites = await Promise.all(
      favorites.value.map(async (favorite: WeatherData) => {
        const weatherResults = await WeatherService.searchLocation(favorite.location);
        if (weatherResults && weatherResults.length > 0) {
          // Don't re-add to API, just update the weather data with first match
          return {
            ...weatherResults[0],
            id: favorite.id, // Preserve the existing favorite ID
          };
        }
        return weatherResults?.[0] || favorite;
      }),
    );

    favorites.value = updatedFavorites.filter(
      (weather: WeatherData | null): weather is WeatherData => weather !== null,
    );
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
    loadFavorites,
    loadHistory,
  };
});
