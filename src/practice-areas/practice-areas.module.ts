import { Module } from '@nestjs/common';
import { PracticeAreasService } from './practice-areas.service';
import { PracticeAreaRepository } from './repositories/practice-area.repository';

@Module({
  providers: [PracticeAreasService, PracticeAreaRepository],
  exports: [PracticeAreasService],
})
export class PracticeAreasModule {}
