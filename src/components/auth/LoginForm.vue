<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types/user'
import { validateEmail, validateTOTP } from '@/utils/validation'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const totpCode = ref('')
const error = ref('')
const loading = ref(false)
const requires2FA = ref(false)

const validateForm = (): boolean => {
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  if (requires2FA.value && !validateTOTP(totpCode.value)) {
    error.value = 'Please enter a valid 2FA code'
    return false
  }
  return true
}

const handleSubmit = async () => {
  error.value = ''
  if (!validateForm()) return

  loading.value = true
  try {
    const credentials: LoginCredentials = {
      email: email.value,
      password: password.value,
      ...(requires2FA.value && { totpCode: totpCode.value }),
    }
    await authStore.login(credentials)
    // Redirect to dashboard
  } catch (e) {
    const err = e as Error
    if (err.message === '2FA code required') {
      requires2FA.value = true
      error.value = 'Please enter your 2FA code'
    } else {
      error.value = err.message || 'Login failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleSubmit">
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

        <div v-if="requires2FA">
          <label for="totp" class="block text-sm font-medium leading-6">2FA Code</label>
          <div class="mt-2">
            <input
              id="totp"
              v-model="totpCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
