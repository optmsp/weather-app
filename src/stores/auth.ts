/**
 * Authentication store module for managing user authentication state and operations.
 * @module stores/auth
 */

import { defineStore } from 'pinia'
import { AuthService } from '../services/auth'
import { TwoFactorAuthService } from '../services/2fa'
import type { AuthState, LoginCredentials, RegisterData, UserProfile } from '../types/user'

/**
 * Pinia store for managing authentication state and operations.
 * Handles user registration, login, profile updates, and 2FA operations.
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = localStorage.getItem('token')
    const persistedUser = localStorage.getItem('user')
    return {
      user: persistedUser ? JSON.parse(persistedUser) : null,
      isAuthenticated: !!token,
      token: token,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      loginHistory: [],
    }
  },

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  /** Store actions for authentication operations */
  actions: {
    /**
     * Registers a new user with the application.
     * @param {RegisterData} data - User registration data
     * @returns {Promise<User>} The registered user object
     * @throws {Error} If registration fails
     */
    async register(data: RegisterData) {
      try {
        const user = await AuthService.register(data)
        this.user = user
        this.isAuthenticated = true
        return user
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },

    /**
     * Authenticates a user and creates a new session.
     * Handles 2FA verification if enabled.
     * @param {LoginCredentials} credentials - User login credentials
     * @returns {Promise<User>} The authenticated user object
     * @throws {Error} If login fails or 2FA verification fails
     */
    async login(credentials: LoginCredentials) {
      console.log('Attempting login:', { email: credentials.email })
      try {
        const { user, token } = await AuthService.login(credentials)
        console.log('Login successful:', { userId: user.id })

        // If 2FA is enabled, verify the token before completing login
        if (this.twoFactorEnabled && !credentials.totpCode) {
          throw new Error('2FA token required')
        }

        if (this.twoFactorEnabled && credentials.totpCode) {
          const isValid = TwoFactorAuthService.verifyToken(
            this.twoFactorSecret!,
            credentials.totpCode,
          )
          if (!isValid) {
            throw new Error('Invalid 2FA token')
          }
        }

        this.user = user
        this.token = token
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)

        // Record login history
        this.loginHistory.unshift({
          timestamp: new Date().toISOString(),
          details: `Logged in as ${user.email}`,
        })

        return user
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    /**
     * Updates the authenticated user's profile information.
     * @param {UserProfile} profile - Updated profile data
     * @returns {Promise<User>} Updated user object
     * @throws {Error} If user is not authenticated or update fails
     */
    async updateProfile(profile: UserProfile) {
      if (!this.user?.id) throw new Error('User not authenticated')

      try {
        const updatedUser = await AuthService.updateProfile(this.user.id, profile)
        this.user = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return updatedUser
      } catch (error) {
        console.error('Profile update failed:', error)
        throw error
      }
    },

    /**
     * Enables two-factor authentication for the current user.
     * @returns {Promise<{secret: string, qrCode: string}>} 2FA setup data
     * @throws {Error} If user is not authenticated or 2FA setup fails
     */
    async enable2FA() {
      if (!this.user?.id) throw new Error('User not authenticated')

      try {
        const { secret, qrCode } = await AuthService.enable2FA(this.user.id)
        return { secret, qrCode }
      } catch (error) {
        console.error('2FA setup failed:', error)
        throw error
      }
    },

    /**
     * Logs out the current user and clears authentication state.
     * Removes the authentication token from local storage.
     */
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    },
  },
})
