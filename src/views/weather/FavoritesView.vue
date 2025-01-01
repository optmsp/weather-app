<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import CitySearch from '@/components/weather/CitySearch.vue';
import WeatherCard from '@/components/weather/WeatherCard.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const { currentWeather, favorites, loading, error } = storeToRefs(appStore);

onMounted(async () => {
  await appStore.refreshFavorites();
});

const handleSearch = async (query: string) => {
  await appStore.searchLocation(query);
};

const handleUseCurrentLocation = async () => {
  await appStore.getCurrentLocationWeather();
};

const toggleFavorite = () => {
  if (currentWeather.value) {
    appStore.toggleFavorite(currentWeather.value);
  }
};
</script>

<template>
  <div>
    <h1 class="page-header">Weather Dashboard</h1>

    <CitySearch @search="handleSearch" @use-current-location="handleUseCurrentLocation" />

    <div class="search-results-grid">
      <div v-if="loading" class="loading-container">
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
      </template>
    </div>

    <template v-if="favorites.length > 0">
      <h2 class="section-header">Favorites</h2>
      <div class="favorites-grid">
        <WeatherCard
          v-for="weather in favorites"
          :key="weather.location"
          :weather="weather"
          @toggle-favorite="() => appStore.toggleFavorite(weather)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  @apply text-3xl font-bold mb-8;
}

.section-header {
  @apply text-2xl font-bold mt-8 mb-4;
}

.favorites-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.search-results-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.loading-container {
  @apply text-center py-8;
}
</style>
