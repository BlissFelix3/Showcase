import { Module } from '@nestjs/common';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { MilestoneRepository } from './repositories/milestone.repository';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [MilestonesController],
  providers: [MilestonesService, MilestoneRepository],
  exports: [MilestonesService, MilestoneRepository],
})
export class MilestonesModule {}
