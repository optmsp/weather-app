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
  <div class="profile-container">
    <h2 class="profile-title">Profile Settings</h2>

    <form @submit.prevent="handleSubmit" class="profile-form">
      <div>
        <label for="name" class="form-label">Name</label>
        <div class="input-container">
          <input id="name" v-model="name" type="text" required class="form-input" />
        </div>
      </div>

      <div>
        <label for="email" class="form-label">Email</label>
        <div class="input-container">
          <input id="email" v-model="email" type="email" required class="form-input" />
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <div class="button-container">
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>

        <button type="button" :disabled="loading" class="setup-2fa-button" @click="setupTwoFactor">
          Setup Two-Factor Authentication
        </button>
      </div>
    </form>

    <div v-if="showTwoFactorSetup" class="two-factor-container">
      <h3 class="two-factor-title">Two-Factor Authentication Setup</h3>
      <p class="two-factor-text">Scan this QR code with your authenticator app:</p>
      <div class="two-factor-text">
        <img :src="twoFactorQRCode" alt="2FA QR Code" class="qr-code-image" />
      </div>
      <p class="two-factor-small-text">
        Or manually enter this code:
        <code class="secret-code">{{ twoFactorSecret }}</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  @apply max-w-2xl mx-auto p-6;
}

.profile-title {
  @apply text-2xl font-bold mb-6;
}

.profile-form {
  @apply space-y-6;
}

.form-label {
  @apply block text-sm font-medium;
}

.form-input {
  @apply input input-bordered w-full mt-1;
}

.button-container {
  @apply flex space-x-4;
}

.submit-button {
  @apply btn btn-primary;
}

.setup-2fa-button {
  @apply btn btn-secondary;
}

.success-message {
  @apply alert alert-success;
}

.error-message {
  @apply alert alert-error;
}

.two-factor-container {
  @apply mt-8 p-6 border rounded-lg;
}

.two-factor-title {
  @apply text-lg font-semibold mb-4;
}

.two-factor-text {
  @apply mb-4;
}

.two-factor-small-text {
  @apply text-sm;
}

.qr-code-image {
  @apply mx-auto;
}

.secret-code {
  @apply bg-gray-100 p-1 rounded;
}
</style>
