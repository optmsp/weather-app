// Weather service types and implementation
import { useGeolocation } from '@vueuse/core'

interface WeatherResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
  }
}

interface GeocodingSuggestion {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface GeocodingResponse {
  results?: Array<GeocodingSuggestion>
  generationtime_ms?: number
}

export type { GeocodingSuggestion }

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  location: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  95: 'Thunderstorm',
}

/**
 * Service class for handling weather-related operations.
 * Provides methods for fetching weather data and managing location information.
 */
export class WeatherService {
  private static async fetchWeatherData(
    latitude: number,
    longitude: number,
  ): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`,
      )

      if (!response.ok) throw new Error('Weather data fetch failed')

      const data: WeatherResponse = await response.json()

      return {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        description: WEATHER_CODES[data.current.weather_code] || 'Unknown',
        location: '', // Will be filled by the calling function
        coordinates: {
          latitude,
          longitude,
        },
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return null
    }
  }

  static async searchLocation(query: string): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      )

      if (!response.ok) throw new Error('Location search failed')

      const data: GeocodingResponse = await response.json()

      if (!data.results?.[0]) return null

      const location = data.results[0]
      const weatherData = await this.fetchWeatherData(location.latitude, location.longitude)

      if (!weatherData) return null

      weatherData.location = `${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`
      return weatherData
    } catch (error) {
      console.error('Error searching location:', error)
      return null
    }
  }

  /**
   * Searches for locations matching the given query, returning multiple suggestions.
   * @param query - The location name to search for
   * @param count - Maximum number of suggestions to return (default: 5)
   * @returns Promise resolving to an array of location suggestions
   */
  static async searchLocations(query: string, count: number = 5): Promise<GeocodingSuggestion[]> {
    try {
      if (!query.trim()) return []

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`,
      )

      if (!response.ok) throw new Error('Location search failed')

      const data: GeocodingResponse = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error searching locations:', error)
      return []
    }
  }

  static async getCurrentLocationWeather(): Promise<WeatherData | null> {
    const { coords } = useGeolocation({ enableHighAccuracy: true })

    if (!coords.value?.latitude || !coords.value?.longitude) {
      throw new Error('Location not available')
    }

    const weatherData = await this.fetchWeatherData(coords.value.latitude, coords.value.longitude)

    if (!weatherData) return null

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.value.latitude}&longitude=${coords.value.longitude}&language=en&format=json`,
      )

      if (!response.ok) throw new Error('Reverse geocoding failed')

      const data: GeocodingResponse = await response.json()

      if (data.results?.[0]) {
        const location = data.results[0]
        weatherData.location = `${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`
      } else {
        weatherData.location = `${coords.value.latitude.toFixed(2)}, ${coords.value.longitude.toFixed(2)}`
      }

      return weatherData
    } catch (error) {
      console.error('Error getting location name:', error)
      weatherData.location = `${coords.value.latitude.toFixed(2)}, ${coords.value.longitude.toFixed(2)}`
      return weatherData
    }
  }
}
