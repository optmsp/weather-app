<script setup lang="ts">
import RegisterForm from '@/components/auth/RegisterForm.vue';
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-card-body">
        <h2 class="auth-title">Register</h2>
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  @apply flex justify-center items-center min-h-[calc(100vh-12rem)];
}

.auth-card {
  @apply card w-96 bg-base-100 shadow-xl;
}

.auth-card-body {
  @apply card-body;
}

.auth-title {
  @apply card-title justify-center mb-4;
}
</style>
