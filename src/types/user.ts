export interface User {
  id: string
  email: string
  name: string
  password?: string
  twoFactorEnabled: boolean
  twoFactorSecret?: string
}

export interface UserProfile {
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
  totpCode?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  loginHistory: Array<{
    timestamp: string
    details: string
  }>
}
