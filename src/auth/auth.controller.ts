import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

class EmailVerificationDto {
  @IsEmail()
  email!: string;
}

class PhoneVerificationDto {
  @IsString()
  phone!: string;
}

class VerifyPhoneDto {
  @IsString()
  phone!: string;

  @IsString()
  code!: string;
}

class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.email, dto.newPassword);
  }

  @Post('send-email-verification')
  async sendEmailVerification(@Body() dto: EmailVerificationDto) {
    return await this.authService.sendEmailVerification(dto.email);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: { userId: string }) {
    return await this.authService.verifyEmail(dto.userId);
  }

  @Post('send-phone-verification')
  async sendPhoneVerification(@Body() dto: PhoneVerificationDto) {
    return await this.authService.sendPhoneVerification(dto.phone);
  }

  @Post('verify-phone')
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    return await this.authService.verifyPhone(dto.phone, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req: any) {
    return await this.authService.refreshToken(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any) {
    return await this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
  }
}
