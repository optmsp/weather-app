<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'
import { useAuthStore } from '@/stores/auth'

const weatherStore = useWeatherStore()
const authStore = useAuthStore()

const { searchHistory, favoriteHistory } = storeToRefs(weatherStore)
const { loginHistory } = storeToRefs(authStore)

const allHistory = computed(() => {
  const combined = [
    ...searchHistory.value.map((entry) => ({
      type: 'search' as const,
      timestamp: entry.timestamp,
      details: `Searched for "${entry.query}"`,
    })),
    ...favoriteHistory.value.map((entry) => ({
      type: 'favorite' as const,
      timestamp: entry.timestamp,
      details: `${entry.action === 'add' ? 'Added' : 'Removed'} ${entry.location} ${entry.action === 'add' ? 'to' : 'from'} favorites`,
    })),
    ...loginHistory.value.map((entry) => ({
      type: 'login' as const,
      timestamp: entry.timestamp,
      details: entry.details,
    })),
  ]

  return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})
</script>

<template>
  <div>
    <h1 class="page-header">Activity History</h1>

    <div class="history-list">
      <div v-for="entry in allHistory" :key="entry.timestamp" class="history-card">
        <div class="history-card-body">
          <div class="history-item">
            <div>
              <span
                class="history-badge"
                :class="{
                  'badge-info': entry.type === 'search',
                  'badge-success': entry.type === 'favorite',
                  'badge-warning': entry.type === 'login',
                }"
              >
                {{ entry.type }}
              </span>
              <p class="history-details">{{ entry.details }}</p>
            </div>
            <time class="history-timestamp">{{ new Date(entry.timestamp).toLocaleString() }}</time>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  @apply text-3xl font-bold mb-8;
}

.history-list {
  @apply space-y-4;
}

.history-card {
  @apply card bg-base-100 shadow;
}

.history-card-body {
  @apply card-body;
}

.history-item {
  @apply flex justify-between items-center;
}

.history-badge {
  @apply badge;
}

.history-details {
  @apply mt-2;
}

.history-timestamp {
  @apply text-sm opacity-70;
}
</style>
