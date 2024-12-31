<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import CitySearch from '../components/weather/CitySearch.vue';
import WeatherCard from '../components/weather/WeatherCard.vue';
import { useWeatherStore } from '../stores/weather';

const weatherStore = useWeatherStore();
const { currentWeather, favorites, loading, error } = storeToRefs(weatherStore);

onMounted(async () => {
  await weatherStore.refreshFavorites();
});

const handleSearch = async (query: string) => {
  await weatherStore.searchLocation(query);
};

const handleUseCurrentLocation = async () => {
  await weatherStore.getCurrentLocationWeather();
};

const toggleFavorite = () => {
  if (currentWeather.value) {
    weatherStore.toggleFavorite(currentWeather.value);
  }
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
      <div v-if="loading" class="text-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <template v-else>
        <WeatherCard
          v-if="currentWeather"
          :weather="currentWeather"
          @toggle-favorite="toggleFavorite"
        />
        
        <template v-if="favorites.length > 0">
          <h2 class="text-2xl font-bold mt-8 mb-4">Favorites</h2>
          <WeatherCard
            v-for="weather in favorites"
            :key="weather.location"
            :weather="weather"
            @toggle-favorite="() => weatherStore.toggleFavorite(weather)"
          />
        </template>
      </template>
    </div>
  </div>
</template>
