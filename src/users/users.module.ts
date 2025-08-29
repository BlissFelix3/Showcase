import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { LawyerProfileRepository } from './repositories/lawyer-profile.repository';
import { ClientProfileRepository } from './repositories/client-profile.repository';
import { VerificationDocumentRepository } from './repositories/verification-document.repository';
import { LawyerReviewRepository } from './repositories/lawyer-review.repository';
import { LawyerProfileService } from './lawyer-profile.service';
import { LawyerProfileController } from './lawyer-profile.controller';
import { FileUploadService } from './file-upload.service';
import { PracticeArea } from '../practice-areas/entities/practice-area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LawyerProfileRepository,
      ClientProfileRepository,
      VerificationDocumentRepository,
      LawyerReviewRepository,
    ]),
    TypeOrmModule.forFeature([PracticeArea]),
  ],
  controllers: [UsersController, LawyerProfileController],
  providers: [
    UsersService,
    UserRepository,
    LawyerProfileService,
    FileUploadService,
  ],
  exports: [UsersService, UserRepository, LawyerProfileService],
})
export class UsersModule {}
