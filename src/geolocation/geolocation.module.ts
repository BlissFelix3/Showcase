import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';

@Module({
  imports: [UsersModule],
  controllers: [GeolocationController],
  providers: [GeolocationService],
})
export class GeolocationModule {}
