<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-12rem)]">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">Login</h2>
        <LoginForm />
      </div>
    </div>
  </div>
</template>
