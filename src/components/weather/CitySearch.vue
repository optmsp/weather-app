<!--
  @component CitySearch
  @description Search component for finding cities and getting their weather.
  Supports both city name search and current location detection using browser geolocation.
  
  @emits {string} search - Emits the search query when form is submitted
  @emits {void} useCurrentLocation - Emits when user requests to use their current location
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeolocation } from '@vueuse/core'
import { WeatherService, type GeocodingSuggestion } from '@/services/weather'
import { useDebounceFn } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'useCurrentLocation'): void
}>()

const suggestions = ref<GeocodingSuggestion[]>([])
const isSearching = ref(false)

const searchLocations = useDebounceFn(async (query: string) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }

  isSearching.value = true
  try {
    suggestions.value = await WeatherService.searchLocations(query)
  } catch (error) {
    console.error('Error fetching location suggestions:', error)
    suggestions.value = []
  } finally {
    isSearching.value = false
  }
}, 500)

watch(() => searchQuery.value, (newQuery) => {
  searchLocations(newQuery)
})

const searchQuery = ref('')
const { coords, isSupported } = useGeolocation()

const handleSuggestionClick = (suggestion: GeocodingSuggestion) => {
  searchQuery.value = suggestion.name
  emit('search', suggestion.name)
  suggestions.value = []
}

const handleSubmit = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    searchQuery.value = ''
    suggestions.value = []
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
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for a city..."
          class="input input-bordered w-full"
          autocomplete="off"
        />
        <!-- Suggestions Dropdown -->
        <ul
          v-if="suggestions.length && !isSearching"
          class="absolute z-10 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          <li
            v-for="suggestion in suggestions"
            :key="suggestion.latitude + '-' + suggestion.longitude"
            @click="handleSuggestionClick(suggestion)"
            class="px-4 py-2 hover:bg-base-200 cursor-pointer"
          >
            {{ suggestion.name }}{{ suggestion.admin1 ? ', ' + suggestion.admin1 : '' }}, {{ suggestion.country }}
          </li>
        </ul>
        <!-- Loading Indicator -->
        <div v-if="isSearching" class="absolute z-10 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 p-4 text-center">
          <span class="loading loading-dots loading-md"></span>
        </div>
      </div>
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
