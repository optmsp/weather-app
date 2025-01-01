<!--
  @component WeatherCard
  @description Displays detailed weather information for a location.
  Shows temperature, humidity, wind speed, and allows favoriting.

  @prop {WeatherData} weather - Weather data to display
  @emits {string} toggleFavorite - Emits location string when favorite status is toggled
-->
<script setup lang="ts">
import { computed } from 'vue'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  location: string
  isFavorite?: boolean
}

const props = defineProps<{
  weather: WeatherData
}>()

const emit = defineEmits<{
  (e: 'toggleFavorite', location: string): void
}>()

const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;
const temperatureFormatted = computed(() => {
  const celsius = props.weather.temperature.toFixed(1);
  const fahrenheit = celsiusToFahrenheit(props.weather.temperature).toFixed(1);
  return `${celsius}°C / ${fahrenheit}°F`;
});
const windSpeedFormatted = computed(() => `${props.weather.windSpeed} km/h`);
const humidityFormatted = computed(() => `${props.weather.humidity}%`);
</script>

<template>
  <div class="weather-card">
    <div class="weather-card-body">
      <div class="weather-header">
        <h2 class="location-title">{{ weather.location }}</h2>
        <button class="favorite-button" @click="emit('toggleFavorite', weather.location)">
          <span class="favorite-icon">{{ weather.isFavorite ? '★' : '☆' }}</span>
        </button>
      </div>

      <p class="temperature">{{ temperatureFormatted }}</p>
      <p class="description">{{ weather.description }}</p>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">Wind Speed</div>
          <div class="stat-value">{{ windSpeedFormatted }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Humidity</div>
          <div class="stat-value">{{ humidityFormatted }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  @apply card bg-base-100 shadow-xl;
}

.weather-card-body {
  @apply card-body;
}

.weather-header {
  @apply flex justify-between items-start;
}

.location-title {
  @apply card-title;
}

.favorite-button {
  @apply btn btn-ghost btn-circle ring-0 hover:ring-2 ring-primary transition-all duration-200 active:ring-2;
}

.favorite-icon {
  @apply text-2xl transition-transform duration-200 hover:scale-110 inline-block;
}

.temperature {
  @apply text-4xl font-bold my-4;
}

.description {
  @apply text-lg;
}

.stats-grid {
  @apply grid grid-cols-2 gap-4 mt-4;
}

.stat-box {
  @apply p-4 bg-base-200 rounded-lg;
}

.stat-label {
  @apply text-sm opacity-75;
}

.stat-value {
  @apply text-lg font-semibold;
}
</style>
