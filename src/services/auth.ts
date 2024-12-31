import type { LoginCredentials, RegisterData, User, UserProfile } from '@/types/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const API_URL = 'http://localhost:3000'; // json-server URL

export class AuthService {
  static async register(data: RegisterData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
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
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const user = await response.json();
    delete user.password;
    return user;
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/users?email=${credentials.email}`);
    const users = await response.json();
    const user = users[0];

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(credentials.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      if (!credentials.totpCode) {
        throw new Error('2FA code required');
      }
      // TODO: Verify TOTP code
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '24h' });
    delete user.password;

    return { user, token };
  }

  static async updateProfile(userId: string, profile: UserProfile): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  static async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    // TODO: Implement 2FA setup with a library like 'otplib'
    throw new Error('Not implemented');
  }
}
