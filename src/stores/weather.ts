import { defineStore } from 'pinia'
import { WeatherService, type WeatherData } from '../services/weather'

interface WeatherState {
  currentWeather: WeatherData | null
  favorites: WeatherData[]
  searchHistory: Array<{
    query: string
    timestamp: string
  }>
  favoriteHistory: Array<{
    action: 'add' | 'remove'
    location: string
    timestamp: string
  }>
  error: string | null
  loading: boolean
}

export const useWeatherStore = defineStore('weather', {
  state: (): WeatherState => ({
    currentWeather: null,
    favorites: [],
    searchHistory: [],
    favoriteHistory: [],
    error: null,
    loading: false,
  }),

  getters: {
    isFavorite: (state) => (location: string) =>
      state.favorites.some((fav) => fav.location === location),
  },

  actions: {
    async searchLocation(query: string) {
      this.loading = true
      this.error = null

      try {
        const weather = await WeatherService.searchLocation(query)

        if (weather) {
          this.currentWeather = weather
          this.searchHistory.unshift({
            query,
            timestamp: new Date().toISOString(),
          })
        } else {
          this.error = 'Location not found'
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to search location'
      } finally {
        this.loading = false
      }
    },

    async getCurrentLocationWeather() {
      this.loading = true
      this.error = null

      try {
        const weather = await WeatherService.getCurrentLocationWeather()

        if (weather) {
          this.currentWeather = weather
        } else {
          this.error = 'Failed to get weather for current location'
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to get current location'
      } finally {
        this.loading = false
      }
    },

    toggleFavorite(weather: WeatherData) {
      const index = this.favorites.findIndex((fav) => fav.location === weather.location)

      if (index === -1) {
        this.favorites.push(weather)
        this.favoriteHistory.unshift({
          action: 'add',
          location: weather.location,
          timestamp: new Date().toISOString(),
        })
      } else {
        this.favorites.splice(index, 1)
        this.favoriteHistory.unshift({
          action: 'remove',
          location: weather.location,
          timestamp: new Date().toISOString(),
        })
      }
    },

    async refreshFavorites() {
      const updatedFavorites = await Promise.all(
        this.favorites.map(async (favorite) => {
          const weather = await WeatherService.searchLocation(favorite.location)
          return weather || favorite
        }),
      )

      this.favorites = updatedFavorites.filter(
        (weather): weather is WeatherData => weather !== null,
      )
    },
  },
})
