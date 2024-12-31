<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { UserProfile } from '@/types/user';
import { validateEmail, validateName } from '@/utils/validation';

const authStore = useAuthStore();
const name = ref('');
const email = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const showTwoFactorSetup = ref(false);
const twoFactorQRCode = ref('');
const twoFactorSecret = ref('');

onMounted(() => {
  if (authStore.currentUser) {
    name.value = authStore.currentUser.name;
    email.value = authStore.currentUser.email;
  }
});

const validateForm = (): boolean => {
  if (!validateName(name.value)) {
    error.value = 'Name must be between 2 and 50 characters';
    return false;
  }
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  error.value = '';
  success.value = '';
  if (!validateForm()) return;

  loading.value = true;
  try {
    const profileData: UserProfile = {
      name: name.value,
      email: email.value,
    };
    await authStore.updateProfile(profileData);
    success.value = 'Profile updated successfully';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update profile';
  } finally {
    loading.value = false;
  }
};

const setupTwoFactor = async () => {
  error.value = '';
  loading.value = true;
  try {
    const { secret, qrCode } = await authStore.enable2FA();
    twoFactorSecret.value = secret;
    twoFactorQRCode.value = qrCode;
    showTwoFactorSetup.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to setup 2FA';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Profile Settings</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="input input-bordered w-full mt-1"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="input input-bordered w-full mt-1"
        />
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>

        <button
          type="button"
          :disabled="loading"
          class="btn btn-secondary"
          @click="setupTwoFactor"
        >
          Setup Two-Factor Authentication
        </button>
      </div>
    </form>

    <div v-if="showTwoFactorSetup" class="mt-8 p-6 border rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Two-Factor Authentication Setup</h3>
      <p class="mb-4">Scan this QR code with your authenticator app:</p>
      <div class="mb-4">
        <img :src="twoFactorQRCode" alt="2FA QR Code" class="mx-auto" />
      </div>
      <p class="text-sm">
        Or manually enter this code: <code class="bg-gray-100 p-1 rounded">{{ twoFactorSecret }}</code>
      </p>
    </div>
  </div>
</template>
