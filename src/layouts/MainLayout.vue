<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentUser = computed(() => authStore.currentUser);

const handleLogout = () => {
  authStore.logout();
  // TODO: Redirect to login page
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <router-link to="/" class="btn btn-ghost normal-case text-xl">Weather App</router-link>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <template v-if="isLoggedIn">
            <li>
              <router-link to="/favorites">Favorites</router-link>
            </li>
            <li>
              <router-link to="/history">History</router-link>
            </li>
            <li>
              <router-link to="/profile">Profile</router-link>
            </li>
            <li>
              <button @click="handleLogout">Logout</button>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link to="/login">Login</router-link>
            </li>
            <li>
              <router-link to="/register">Register</router-link>
            </li>
          </template>
        </ul>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>Copyright © 2024 - All rights reserved</p>
      </div>
    </footer>
  </div>
</template>
