<!--
  @component LoginForm
  @description Login form component with 2FA support.
  Handles user authentication and two-factor authentication flow.
  
  @emits {LoginCredentials} submit - Emits login credentials when form is submitted
  @emits {void} error - Emits when validation or login fails
  @emits {void} requires2fa - Emits when 2FA verification is required
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { LoginCredentials } from '@/types/user'
import { validateEmail, validateTOTP } from '@/utils/validation'

const router = useRouter()

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
    router.push('/favorites')
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
  <div class="login-container">
    <div class="login-header-container">
      <h2 class="login-title">
        Sign in to your account
      </h2>
    </div>

    <div class="login-form-container">
      <form class="login-form" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="form-label">Email address</label>
          <div class="input-container">
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="form-input"
            />
          </div>
        </div>

        <div>
          <label for="password" class="form-label">Password</label>
          <div class="input-container">
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="form-input"
            />
          </div>
        </div>

        <div v-if="requires2FA">
          <label for="totp" class="form-label">2FA Code</label>
          <div class="input-container">
            <input
              id="totp"
              v-model="totpCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              class="form-input"
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div>
          <button type="submit" :disabled="loading" class="submit-button">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  @apply flex min-h-full flex-col justify-center px-6 py-12 lg:px-8;
}

.login-header-container {
  @apply sm:mx-auto sm:w-full sm:max-w-sm;
}

.login-title {
  @apply mt-10 text-center text-2xl font-bold leading-9 tracking-tight;
}

.login-form-container {
  @apply mt-10 sm:mx-auto sm:w-full sm:max-w-sm;
}

.login-form {
  @apply space-y-6;
}

.form-label {
  @apply block text-sm font-medium leading-6;
}

.input-container {
  @apply mt-2;
}

.form-input {
  @apply input input-bordered w-full;
}

.submit-button {
  @apply btn btn-primary w-full;
}

.error-message {
  @apply alert alert-error;
}
</style>
