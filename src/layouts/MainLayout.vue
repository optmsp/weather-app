<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => {
  console.log('Auth state:', authStore.isAuthenticated);
  return authStore.isAuthenticated;
});

const handleLogout = () => {
  console.log('Logging out user');
  authStore.logout();
  console.log('Navigation to login page');
  router.push('/login');
};
</script>

<template>
  <div class="layout-container">
    <header class="layout-header">
      <div class="header-brand">
        <router-link to="/" class="brand-link">Weather App</router-link>
      </div>
      <div class="header-nav">
        <ul class="nav-list">
          <template v-if="isLoggedIn">
            <li>
              <router-link to="/favorites" class="nav-link">Favorites</router-link>
            </li>
            <li>
              <router-link to="/history" class="nav-link">History</router-link>
            </li>
            <li>
              <router-link to="/profile" class="nav-link">Profile</router-link>
            </li>
            <li>
              <button @click="handleLogout" class="nav-link">Logout</button>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
            <li>
              <router-link to="/register" class="nav-link">Register</router-link>
            </li>
          </template>
        </ul>
      </div>
    </header>
    <main class="layout-main">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  @apply min-h-screen flex flex-col;
}

.layout-header {
  @apply navbar bg-base-100 shadow-lg;
}

.header-brand {
  @apply flex-1;
}

.brand-link {
  @apply btn btn-ghost normal-case text-xl;
}

.header-nav {
  @apply flex-none;
}

.nav-list {
  @apply menu menu-horizontal px-1;
}

.nav-link {
  @apply hover:bg-base-200 rounded-lg transition-colors duration-200;
}

.layout-main {
  @apply flex-grow;
}
</style>
