import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class EmailNotificationEvents {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(LocalEvents.EMAIL_WELCOME)
  async handleWelcomeEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'welcome-template',
        {
          fullName: payload.userData.fullName,
          role: payload.userData.role,
        },
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_FORGOT_PASSWORD)
  async handleForgotPasswordEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'forgot-password-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send forgot password email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_PASSWORD_RESET)
  async handlePasswordResetEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'password-reset-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_VERIFICATION)
  async handleEmailVerification(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'email-verification-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send email verification:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_VERIFIED)
  async handleEmailVerified(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'email-verified-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send email verified notification:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_PHONE_VERIFICATION)
  async handlePhoneVerificationEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'phone-verification-template',
        {
          phone: payload.userData.phone,
          otpCode: payload.userData.otpCode,
        },
      );
    } catch (error) {
      console.error('Failed to send phone verification email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_PHONE_VERIFIED)
  async handlePhoneVerifiedEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'phone-verified-template',
        {
          phone: payload.userData.phone,
        },
      );
    } catch (error) {
      console.error('Failed to send phone verified email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_LOGIN_SUCCESS)
  async handleLoginSuccessEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'login-success-template',
        {
          role: payload.userData.role,
        },
      );
    } catch (error) {
      console.error('Failed to send login success email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_PASSWORD_CHANGED)
  async handlePasswordChangedEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'password-changed-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_ACCOUNT_DEACTIVATED)
  async handleAccountDeactivatedEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'account-deactivated-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send account deactivated email:', error);
    }
  }

  @OnEvent(LocalEvents.EMAIL_ACCOUNT_REACTIVATED)
  async handleAccountReactivatedEmail(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'account-reactivated-template',
        {
          email: payload.email,
        },
      );
    } catch (error) {
      console.error('Failed to send account reactivated email:', error);
    }
  }
}
