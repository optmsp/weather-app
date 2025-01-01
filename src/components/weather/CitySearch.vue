<!--
  @component CitySearch
  @description Search component for finding cities and getting their weather.
  Supports both city name search and current location detection using browser geolocation.

  @emits {string} search - Emits the search query when form is submitted
  @emits {void} useCurrentLocation - Emits when user requests to use their current location
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useGeolocation } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'useCurrentLocation'): void
}>()

const searchQuery = ref('');
const { coords, isSupported } = useGeolocation();

const handleSubmit = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
    searchQuery.value = '';
  }
};

const useCurrentLocation = () => {
  if (coords.value) {
    emit('useCurrentLocation');
  }
};
</script>

<template>
  <div class="city-search-bar">
    <form @submit.prevent="handleSubmit" class="city-search-form">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a city..."
        class="city-search-input"
      />
      <button type="submit" class="city-search-button">Search</button>
    </form>

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

.city-search-form {
  @apply flex-grow flex gap-2;
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
</style>
