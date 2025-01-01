<!--
  @component RegisterForm
  @description Registration form component that handles user sign-up.
  Includes email validation, password strength checking, and form submission.
  
  @emits {RegisterData} submit - Emits registration data when form is submitted successfully
  @emits {void} error - Emits when validation or registration fails
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { RegisterData } from '@/types/user'
import { validateEmail, validatePassword, validateName } from '@/utils/validation'

const router = useRouter()

const authStore = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const validateForm = (): boolean => {
  if (!validateName(name.value)) {
    error.value = 'Name must be between 2 and 50 characters'
    return false
  }
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  if (!validatePassword(password.value)) {
    error.value = 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
    return false
  }
  return true
}

const handleSubmit = async () => {
  error.value = ''
  if (!validateForm()) return

  loading.value = true
  try {
    const userData: RegisterData = {
      name: name.value,
      email: email.value,
      password: password.value,
    }
    await authStore.register(userData)
    router.push('/favorites')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-header-container">
      <h2 class="register-title">
        Create your account
      </h2>
    </div>

    <div class="register-form-container">
      <form class="register-form" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="form-label">Name</label>
          <div class="input-container">
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="form-input"
            />
          </div>
        </div>

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

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div>
          <button type="submit" :disabled="loading" class="submit-button">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  @apply flex min-h-full flex-col justify-center px-6 py-12 lg:px-8;
}

.register-header-container {
  @apply sm:mx-auto sm:w-full sm:max-w-sm;
}

.register-title {
  @apply mt-10 text-center text-2xl font-bold leading-9 tracking-tight;
}

.register-form-container {
  @apply mt-10 sm:mx-auto sm:w-full sm:max-w-sm;
}

.register-form {
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
