import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { EncryptionService } from './encryption.service';
import { OTPService } from './otp.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly otpService: OTPService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(data: CreateUserDto): Promise<any> {
    try {
      // Check if email already exists
      const isEmailExist = await this.usersService.findByEmail(data.email);
      if (isEmailExist) {
        throw new ConflictException('Account with email already exists');
      }

      // Check if phone already exists (if provided)
      if (data.phone) {
        const isPhoneExist = await this.usersService.findByPhone(data.phone);
        if (isPhoneExist) {
          throw new ConflictException(
            'Account with phone number already exists',
          );
        }
      }

      // Hash password
      const hashedPassword = this.encryptionService.hash(data.password);

      // Create user with profile using the new method
      const user = await this.usersService.createUserWithProfile({
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
      });

      // Generate JWT token
      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      // Emit email notification event for welcome email
      this.eventEmitter.emit(LocalEvents.EMAIL_WELCOME, {
        userId: user.id,
        email: user.email,
        userData: {
          fullName: data.fullName,
          role: user.role,
        },
      });

      // Remove password from response
      const { passwordHash, ...userData } = user;

      return {
        message: 'Registration successful',
        status: true,
        data: {
          user: userData,
          token: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmailWithPassword(email);
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      // Verify password
      const isPasswordCorrect = await this.encryptionService.compare(
        password,
        user.passwordHash,
      );

      if (!isPasswordCorrect) {
        throw new BadRequestException('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new ForbiddenException('Account has been deactivated');
      }

      // Generate JWT token
      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      // Emit email notification event for login success
      this.eventEmitter.emit(LocalEvents.EMAIL_LOGIN_SUCCESS, {
        userId: user.id,
        email: user.email,
        userData: {
          role: user.role,
        },
      });

      // Remove password from response
      const { passwordHash, ...userData } = user;

      return {
        message: 'Login successful',
        status: true,
        data: {
          user: userData,
          token: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUserAndIssueToken(
    email: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) return null;

    const ok = await this.encryptionService.compare(
      password,
      user.passwordHash,
    );
    if (!ok) return null;

    return this.jwtService.sign({ sub: user.id, role: user.role });
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Account with email does not exist');
      }

      // Emit email notification event for forgot password
      this.eventEmitter.emit(LocalEvents.EMAIL_FORGOT_PASSWORD, {
        userId: user.id,
        email: user.email,
        userData: {
          email: user.email,
        },
      });

      return {
        message: 'Password reset instruction sent to your email',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const hashedPassword = this.encryptionService.hash(newPassword);

      // Update user password
      await this.usersService.updatePassword(user.id, hashedPassword);

      // Emit email notification event for password reset
      this.eventEmitter.emit(LocalEvents.EMAIL_PASSWORD_RESET, {
        userId: user.id,
        email: user.email,
        userData: {
          email: user.email,
        },
      });

      return {
        message: 'Password has been changed successfully',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendEmailVerification(email: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Account with email does not exist');
      }

      // Emit email notification event for email verification
      this.eventEmitter.emit(LocalEvents.EMAIL_VERIFICATION, {
        userId: user.id,
        email: user.email,
        userData: {
          email: user.email,
        },
      });

      return {
        message: 'Verification code sent to your email',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(userId: string): Promise<any> {
    try {
      const user = await this.usersService.findByIdOrFail(userId);

      // Mark email as verified
      await this.usersService.markEmailVerified(userId);

      // Emit email notification event for email verified
      this.eventEmitter.emit(LocalEvents.EMAIL_VERIFIED, {
        userId: user.id,
        email: user.email,
        userData: {
          email: user.email,
        },
      });

      return {
        message: 'Email verified successfully',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendPhoneVerification(phone: string): Promise<any> {
    try {
      // Find user by phone
      const user = await this.usersService.findByPhone(phone);
      if (!user) {
        throw new NotFoundException('Account with phone number does not exist');
      }

      // Generate and send OTP
      const otpCode = await this.otpService.generateOTP(phone);

      // Emit email notification event for phone verification
      this.eventEmitter.emit(LocalEvents.EMAIL_PHONE_VERIFICATION, {
        userId: user.id,
        email: user.email,
        userData: {
          phone: phone,
          otpCode, // Include OTP for SMS/WhatsApp services
        },
      });

      return {
        message: `OTP sent to phone number ${phone.replace(/.(?=.{4})/g, 'x')}`,
        status: true,
        data: {
          phone,
          expiresIn: '10 minutes',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyPhone(phone: string, code: string): Promise<any> {
    try {
      // Find user by phone
      const user = await this.usersService.findByPhone(phone);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify OTP code using the OTP service
      const isValidCode = await this.otpService.verifyOTP(phone, code);
      if (!isValidCode) {
        throw new BadRequestException('Invalid verification code');
      }

      // Mark phone as verified
      await this.usersService.markPhoneVerified(user.id);

      // Emit email notification event for phone verified
      this.eventEmitter.emit(LocalEvents.EMAIL_PHONE_VERIFIED, {
        userId: user.id,
        email: user.email,
        userData: {
          phone: phone,
        },
      });

      return {
        message: 'Phone number verified successfully',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(userId: string): Promise<any> {
    try {
      const user = await this.usersService.findByIdOrFail(userId);

      if (!user.isActive) {
        throw new ForbiddenException('Account has been deactivated');
      }

      // Generate new JWT token
      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      return {
        message: 'Token refreshed successfully',
        status: true,
        data: {
          token: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string): Promise<any> {
    try {
      // Logout functionality - no events needed for now
      // In production, you might want to add token blacklisting here

      return {
        message: 'Logged out successfully',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any> {
    try {
      const user = await this.usersService.findByEmailWithPassword(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordCorrect = await this.encryptionService.compare(
        currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordCorrect) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = this.encryptionService.hash(newPassword);

      // Update password
      await this.usersService.updatePassword(user.id, hashedPassword);

      // Emit email notification event for password changed
      this.eventEmitter.emit(LocalEvents.EMAIL_PASSWORD_CHANGED, {
        userId: user.id,
        email: user.email,
        userData: {
          email: user.email,
        },
      });

      return {
        message: 'Password changed successfully',
        status: true,
      };
    } catch (error) {
      throw error;
    }
  }
}
