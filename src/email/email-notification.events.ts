import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class EmailNotificationEvents {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(LocalEvents.USER_WELCOME)
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

  @OnEvent(LocalEvents.FORGOT_PASSWORD_REQUESTED)
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

  @OnEvent(LocalEvents.PASSWORD_RESET_SUCCESSFUL)
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

  @OnEvent(LocalEvents.VERIFICATION_EMAIL_SENT)
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

  @OnEvent(LocalEvents.VERIFICATION_EMAIL_CONFIRMED)
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

  @OnEvent(LocalEvents.VERIFICATION_PHONE_SENT)
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

  @OnEvent(LocalEvents.VERIFICATION_PHONE_CONFIRMED)
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

  @OnEvent(LocalEvents.USER_LOGIN_SUCCESS)
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

  @OnEvent(LocalEvents.USER_PASSWORD_CHANGED)
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

  @OnEvent(LocalEvents.USER_ACCOUNT_DEACTIVATED)
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

  @OnEvent(LocalEvents.USER_ACCOUNT_REACTIVATED)
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

  @OnEvent(LocalEvents.VERIFICATION_DOCUMENT_UPLOADED)
  async handleVerificationDocumentUploaded(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        'admin@lawent.com',
        'verification-request-template',
        {
          lawyerName: payload.lawyerName,
          lawyerEmail: payload.lawyerEmail,
          documentCount: payload.documentCount,
          submittedAt: payload.submittedAt,
        },
      );
    } catch (error) {
      console.error('Failed to send verification request email:', error);
    }
  }

  @OnEvent(LocalEvents.USER_VERIFICATION_SUCCESSFUL)
  async handleVerificationSuccessful(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'verification-successful-template',
        {
          fullName: payload.userData.fullName,
          verificationDate: payload.userData.verificationDate,
          verifiedBy: payload.userData.verifiedBy,
        },
      );
    } catch (error) {
      console.error('Failed to send verification successful email:', error);
    }
  }

  @OnEvent(LocalEvents.USER_VERIFICATION_REJECTED)
  async handleVerificationRejected(payload: any) {
    try {
      await this.emailService.sendTemplatedEmail(
        payload.email,
        'verification-rejected-template',
        {
          fullName: payload.userData.fullName,
          rejectionReason: payload.userData.rejectionReason,
          requiredActions: payload.userData.requiredActions,
          rejectedAt: payload.userData.rejectedAt,
        },
      );
    } catch (error) {
      console.error('Failed to send verification rejected email:', error);
    }
  }
}
