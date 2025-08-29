import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeAreasService } from './practice-areas.service';
import { PracticeAreaRepository } from './repositories/practice-area.repository';
import { PracticeAreaAssignmentService } from './practice-area-assignment.service';
import { LawyerProfileRepository } from '../users/repositories/lawyer-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LawyerProfileRepository])],
  providers: [
    PracticeAreasService,
    PracticeAreaRepository,
    PracticeAreaAssignmentService,
  ],
  exports: [
    PracticeAreasService,
    PracticeAreaRepository,
    PracticeAreaAssignmentService,
  ],
})
export class PracticeAreasModule {}
