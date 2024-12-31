import type { LoginCredentials, RegisterData, User, UserProfile } from '@/types/user'
import { TwoFactorAuthService } from './2fa'

const API_URL = 'http://localhost:3000' // json-server URL

// Browser-safe password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Simple JWT implementation for development
function generateToken(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = btoa('development-signature') // In production, use proper signing
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export class AuthService {
  static async register(data: RegisterData): Promise<User> {
    const hashedPassword = await hashPassword(data.password)

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        password: hashedPassword,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    const user = await response.json()
    delete user.password
    return user
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/users?email=${credentials.email}`)
    const users = await response.json()
    const user = users[0]

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const hashedInput = await hashPassword(credentials.password)
    if (hashedInput !== user.password) {
      throw new Error('Invalid credentials')
    }

    if (user.twoFactorEnabled) {
      if (!credentials.totpCode) {
        throw new Error('2FA code required')
      }
      const isValidCode = TwoFactorAuthService.verifyToken(
        user.twoFactorSecret!,
        credentials.totpCode,
      )
      if (!isValidCode) {
        throw new Error('Invalid 2FA code')
      }
    }

    const token = generateToken({ userId: user.id, exp: Date.now() + 24 * 60 * 60 * 1000 })
    delete user.password

    return { user, token }
  }

  static async updateProfile(userId: string, profile: UserProfile): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    return response.json()
  }

  static async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    // TODO: Implement 2FA setup with a library like 'otplib'
    throw new Error('Not implemented')
  }
}
