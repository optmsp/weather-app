<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { RegisterData } from '@/types/user';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';

const authStore = useAuthStore();
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const validateForm = (): boolean => {
  if (!validateName(name.value)) {
    error.value = 'Name must be between 2 and 50 characters';
    return false;
  }
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address';
    return false;
  }
  if (!validatePassword(password.value)) {
    error.value = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  error.value = '';
  if (!validateForm()) return;

  loading.value = true;
  try {
    const userData: RegisterData = {
      name: name.value,
      email: email.value,
      password: password.value,
    };
    await authStore.register(userData);
    // Redirect to setup 2FA or dashboard
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
        Create your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="block text-sm font-medium leading-6">Name</label>
          <div class="mt-2">
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium leading-6">Email address</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium leading-6">Password</label>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
