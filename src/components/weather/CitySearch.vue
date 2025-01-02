<!--
  @component CitySearch
  @description Search component for finding cities and getting their weather.
  Supports both city name search and current location detection using browser geolocation.

  @emits {string} search - Emits the search query when form is submitted
  @emits {void} useCurrentLocation - Emits when user requests to use their current location
-->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGeolocation } from '@vueuse/core';
import { useAppStore } from '@/stores/app';
import type { WeatherData } from '@/types';

const emit = defineEmits<{
  (e: 'search', query: string): void;
  (e: 'useCurrentLocation'): void;
}>();

const appStore = useAppStore();
const searchQuery = ref('');
const showResults = ref(false);
const searchResults = ref<WeatherData[]>([]);
const { coords, isSupported } = useGeolocation();

// Debounced search function
let searchTimeout: NodeJS.Timeout;
const performSearch = async () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim();
    const results = await appStore.searchLocation(query);
    if (results) {
      searchResults.value = results;
      showResults.value = true;
    } else {
      searchResults.value = [];
      showResults.value = false;
    }
  } else {
    searchResults.value = [];
    showResults.value = false;
  }
};

// Watch for changes in search query
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(performSearch, 300);
});

const handleSubmit = () => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    emit('search', searchResults.value[0].location);
    searchQuery.value = '';
    showResults.value = false;
  }
};

const selectResult = (location: string) => {
  emit('search', location);
  searchQuery.value = '';
  showResults.value = false;
};

const useCurrentLocation = () => {
  if (coords.value) {
    emit('useCurrentLocation');
  }
};
</script>

<template>
  <div class="city-search-bar">
    <div class="search-container">
      <form @submit.prevent="handleSubmit" class="city-search-form">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for a city..."
          class="city-search-input"
          @focus="showResults = true"
          @blur="setTimeout(() => (showResults = false), 200)"
        />
        <button type="submit" class="city-search-button">Search</button>
      </form>

      <!-- Results dropdown -->
      <div v-if="showResults && searchResults.length > 0" class="search-results">
        <div
          v-for="result in searchResults"
          :key="result.location"
          class="search-result-item"
          @mousedown.prevent="selectResult(result.location)"
        >
          {{ result.location }}
        </div>
      </div>
    </div>

    <button
      v-if="isSupported"
      @click="useCurrentLocation"
      class="location-button"
      :disabled="!coords"
    >
      Use My Location
    </button>
  </div>
</template>

<!-- place the search bar at the top-right in the content area -->
<style scoped>
.city-search-bar {
  @apply flex gap-4 justify-end;
  margin-bottom: 1rem;
}

.search-container {
  @apply flex-grow relative;
}

.city-search-form {
  @apply flex gap-2;
}

.city-search-input {
  @apply input input-bordered w-full;
}

.city-search-button {
  @apply btn btn-primary;
}

.location-button {
  @apply btn btn-secondary;
}

.search-results {
  @apply absolute w-full mt-1 bg-base-100 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto;
  border: 1px solid hsl(var(--bc) / 0.2);
}

.search-result-item {
  @apply px-4 py-2 hover:bg-base-200 cursor-pointer;
}

.search-result-item:not(:last-child) {
  @apply border-b border-base-200;
}
</style>
