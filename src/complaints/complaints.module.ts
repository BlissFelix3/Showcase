import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { ComplaintRepository } from './repositories/complaint.repository';

@Module({
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintRepository],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
