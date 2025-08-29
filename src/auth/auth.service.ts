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
      const isEmailExist = await this.usersService.findByEmail(data.email);
      if (isEmailExist) {
        throw new ConflictException('Account with email already exists');
      }

      if (data.phone) {
        const isPhoneExist = await this.usersService.findByPhone(data.phone);
        if (isPhoneExist) {
          throw new ConflictException(
            'Account with phone number already exists',
          );
        }
      }

      const hashedPassword = this.encryptionService.hash(data.password);

      const user = await this.usersService.createUserWithProfile({
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
      });

      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      this.eventEmitter.emit(LocalEvents.EMAIL_WELCOME, {
        userId: user.id,
        email: user.email,
        userData: {
          fullName: data.fullName,
          role: user.role,
        },
      });

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
      const user = await this.usersService.findByEmailWithPassword(email);
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const isPasswordCorrect = await this.encryptionService.compare(
        password,
        user.passwordHash,
      );

      if (!isPasswordCorrect) {
        throw new BadRequestException('Invalid email or password');
      }

      if (!user.isActive) {
        throw new ForbiddenException('Account has been deactivated');
      }

      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      this.eventEmitter.emit(LocalEvents.EMAIL_LOGIN_SUCCESS, {
        userId: user.id,
        email: user.email,
        userData: {
          role: user.role,
        },
      });

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

      const hashedPassword = this.encryptionService.hash(newPassword);

      await this.usersService.updatePassword(user.id, hashedPassword);

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

      await this.usersService.markEmailVerified(userId);

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
      const user = await this.usersService.findByPhone(phone);
      if (!user) {
        throw new NotFoundException('Account with phone number does not exist');
      }

      const otpCode = await this.otpService.generateOTP(phone);

      this.eventEmitter.emit(LocalEvents.EMAIL_PHONE_VERIFICATION, {
        userId: user.id,
        email: user.email,
        userData: {
          phone: phone,
          otpCode,
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
      const user = await this.usersService.findByPhone(phone);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isValidCode = await this.otpService.verifyOTP(phone, code);
      if (!isValidCode) {
        throw new BadRequestException('Invalid verification code');
      }

      await this.usersService.markPhoneVerified(user.id);

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

      const isCurrentPasswordCorrect = await this.encryptionService.compare(
        currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordCorrect) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = this.encryptionService.hash(newPassword);

      await this.usersService.updatePassword(user.id, hashedPassword);

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
