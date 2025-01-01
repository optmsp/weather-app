<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => {
  console.log('Auth state:', authStore.isAuthenticated)
  return authStore.isAuthenticated
})

const handleLogout = () => {
  console.log('Logging out user')
  authStore.logout()
  console.log('Navigation to login page')
  router.push('/login')
}
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
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
