import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { LawyerProfileRepository } from './repositories/lawyer-profile.repository';
import { ClientProfileRepository } from './repositories/client-profile.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    LawyerProfileRepository,
    ClientProfileRepository,
  ],
  exports: [
    UsersService,
    UserRepository,
    LawyerProfileRepository,
    ClientProfileRepository,
  ],
})
export class UsersModule {}
