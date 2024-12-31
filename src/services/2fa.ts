import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export interface TwoFactorAuthData {
  secret: string
  qrCodeUrl: string
}

export class TwoFactorAuthService {
  private static readonly APP_NAME = 'Weather App'

  static async generateSecret(userEmail: string): Promise<TwoFactorAuthData> {
    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(userEmail, this.APP_NAME, secret)
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    return {
      secret,
      qrCodeUrl,
    }
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch {
      return false
    }
  }

  static generateToken(secret: string): string {
    return authenticator.generate(secret)
  }
}
