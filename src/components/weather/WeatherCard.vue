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

const temperatureFormatted = computed(() => `${props.weather.temperature}°C`)
const windSpeedFormatted = computed(() => `${props.weather.windSpeed} km/h`)
const humidityFormatted = computed(() => `${props.weather.humidity}%`)
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start">
        <h2 class="card-title">{{ weather.location }}</h2>
        <button class="btn btn-ghost btn-circle" @click="emit('toggleFavorite', weather.location)">
          <span class="text-2xl">{{ weather.isFavorite ? '★' : '☆' }}</span>
        </button>
      </div>

      <p class="text-4xl font-bold my-4">{{ temperatureFormatted }}</p>
      <p class="text-lg">{{ weather.description }}</p>

      <div class="grid grid-cols-2 gap-4 mt-4">
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
