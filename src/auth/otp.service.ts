import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocalEvents } from '../utils/constants';

export interface OTPData {
  code: string;
  phone: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
}

@Injectable()
export class OTPService {
  private otpStorage = new Map<string, OTPData>();
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async generateOTP(phone: string): Promise<string> {
    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Store OTP data
    const otpData: OTPData = {
      code,
      phone,
      expiresAt,
      attempts: 0,
      isUsed: false,
    };

    this.otpStorage.set(phone, otpData);

    return code;
  }

  async verifyOTP(phone: string, code: string): Promise<boolean> {
    const otpData = this.otpStorage.get(phone);

    if (!otpData) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(phone);
      return false;
    }

    // Check if OTP is already used
    if (otpData.isUsed) {
      return false;
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(phone);
      return false;
    }

    // Increment attempts
    otpData.attempts++;

    // Check if code matches
    if (otpData.code === code) {
      // Mark as used
      otpData.isUsed = true;
      this.otpStorage.delete(phone);

      return true;
    }

    // If max attempts reached, delete OTP
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(phone);
    }

    return false;
  }

  async resendOTP(phone: string): Promise<string> {
    // Remove existing OTP if any
    this.otpStorage.delete(phone);

    // Generate new OTP
    return this.generateOTP(phone);
  }

  async getOTPStatus(phone: string): Promise<{
    exists: boolean;
    attempts: number;
    expiresAt?: Date;
    isUsed: boolean;
  }> {
    const otpData = this.otpStorage.get(phone);

    if (!otpData) {
      return {
        exists: false,
        attempts: 0,
        isUsed: false,
      };
    }

    return {
      exists: true,
      attempts: otpData.attempts,
      expiresAt: otpData.expiresAt,
      isUsed: otpData.isUsed,
    };
  }

  async cleanupExpiredOTPs(): Promise<void> {
    const now = new Date();

    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(phone);
      }
    }
  }

  // Cleanup expired OTPs every 5 minutes
  startCleanupScheduler(): void {
    setInterval(
      () => {
        this.cleanupExpiredOTPs();
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }
}
