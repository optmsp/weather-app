export interface TwoFactorAuthData {
  secret: string
  qrCodeUrl: string
}

export class TwoFactorAuthService {
  private static readonly APP_NAME = 'Weather App'

  private static async generateRandomBytes(length: number): Promise<Uint8Array> {
    return crypto.getRandomValues(new Uint8Array(length))
  }

  private static base32Encode(buffer: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = 0
    let value = 0
    let output = ''

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i]
      bits += 8

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31]
    }

    return output
  }

  static async generateSecret(userEmail: string): Promise<TwoFactorAuthData> {
    const buffer = await this.generateRandomBytes(20)
    const secret = this.base32Encode(buffer)
    const otpauth = `otpauth://totp/${encodeURIComponent(this.APP_NAME)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(this.APP_NAME)}`

    // For development, return a data URL with instructions
    const qrCodeUrl = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
        <text x="100" y="40" text-anchor="middle">Development Mode</text>
        <text x="100" y="60" text-anchor="middle">Use code: 123456</text>
      </svg>`,
    )}`

    return { secret, qrCodeUrl }
  }

  static verifyToken(token: string, secret: string): boolean {
    // For development, accept any 6-digit code
    // In production, implement proper TOTP verification
    return /^\d{6}$/.test(token)
  }

  static generateToken(secret: string): string {
    // For development, return a static code
    // In production, implement proper TOTP generation
    return '123456'
  }
}
