<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface HistoryEntry {
  type: 'search' | 'favorite' | 'login';
  timestamp: string;
  details: string;
}

const history = ref<HistoryEntry[]>([]);

onMounted(() => {
  // TODO: Load history from store/API
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Activity History</h1>

    <div class="space-y-4">
      <div v-for="entry in history" :key="entry.timestamp" class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <div>
              <span class="badge" :class="{
                'badge-info': entry.type === 'search',
                'badge-success': entry.type === 'favorite',
                'badge-warning': entry.type === 'login'
              }">
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
