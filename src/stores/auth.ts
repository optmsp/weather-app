import { defineStore } from 'pinia';
import { AuthService } from '@/services/auth';
import type { AuthState, LoginCredentials, RegisterData, User, UserProfile } from '@/types/user';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    token: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async register(data: RegisterData) {
      try {
        const user = await AuthService.register(data);
        this.user = user;
        this.isAuthenticated = true;
        return user;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        const { user, token } = await AuthService.login(credentials);
        this.user = user;
        this.token = token;
        this.isAuthenticated = true;
        localStorage.setItem('token', token);
        return user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async updateProfile(profile: UserProfile) {
      if (!this.user?.id) throw new Error('User not authenticated');
      
      try {
        const updatedUser = await AuthService.updateProfile(this.user.id, profile);
        this.user = updatedUser;
        return updatedUser;
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
    },

    async enable2FA() {
      if (!this.user?.id) throw new Error('User not authenticated');
      
      try {
        const { secret, qrCode } = await AuthService.enable2FA(this.user.id);
        return { secret, qrCode };
      } catch (error) {
        console.error('2FA setup failed:', error);
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});
