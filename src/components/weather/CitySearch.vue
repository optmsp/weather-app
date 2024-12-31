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

const searchQuery = ref('')
const { coords, isSupported } = useGeolocation()

const handleSubmit = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    searchQuery.value = ''
  }
}

const useCurrentLocation = () => {
  if (coords.value) {
    emit('useCurrentLocation')
  }
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
    <form @submit.prevent="handleSubmit" class="flex-grow flex gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a city..."
        class="input input-bordered w-full"
      />
      <button type="submit" class="btn btn-primary">Search</button>
    </form>

    <button
      v-if="isSupported"
      @click="useCurrentLocation"
      class="btn btn-secondary"
      :disabled="!coords"
    >
      Use My Location
    </button>
  </div>
</template>
