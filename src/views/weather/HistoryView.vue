<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const appStore = useAppStore()
const authStore = useAuthStore()

const { searchHistory, favoriteHistory } = storeToRefs(appStore)
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
    <h1 class="text-3xl font-bold mb-8">Activity History</h1>

    <div class="space-y-4">
      <div v-for="entry in allHistory" :key="entry.timestamp" class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <div>
              <span
                class="badge"
                :class="{
                  'badge-info': entry.type === 'search',
                  'badge-success': entry.type === 'favorite',
                  'badge-warning': entry.type === 'login',
                }"
              >
                {{ entry.type }}
              </span>
              <p class="mt-2">{{ entry.details }}</p>
            </div>
            <time class="text-sm opacity-70">{{ new Date(entry.timestamp).toLocaleString() }}</time>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
