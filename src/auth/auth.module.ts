import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { OTPService } from './otp.service';
import { UsersModule } from '../users/users.module';
import appConfig from '../config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret:
        appConfig.jwt.privateKey || process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: (appConfig.jwt.expiresIn as string) || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EncryptionService, OTPService, JwtStrategy],
})
export class AuthModule {}
