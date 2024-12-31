<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CitySearch from '@/components/weather/CitySearch.vue';
import WeatherCard from '@/components/weather/WeatherCard.vue';

const favorites = ref<string[]>([]);
const weatherData = ref<any[]>([]);

onMounted(() => {
  // TODO: Load favorites from store/API
});

const handleSearch = async (query: string) => {
  // TODO: Implement weather search
};

const handleUseCurrentLocation = async () => {
  // TODO: Implement geolocation weather search
};

const toggleFavorite = (location: string) => {
  // TODO: Implement favorite toggling
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Weather Dashboard</h1>
    
    <CitySearch
      @search="handleSearch"
      @use-current-location="handleUseCurrentLocation"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WeatherCard
        v-for="weather in weatherData"
        :key="weather.location"
        :weather="weather"
        @toggle-favorite="toggleFavorite"
      />
    </div>
  </div>
</template>
