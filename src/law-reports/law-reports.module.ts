import { Module } from '@nestjs/common';
import { LawReportsController } from './law-reports.controller';
import { LawReportsService } from './law-reports.service';
import { LawReportRepository } from './repositories/law-report.repository';

@Module({
  controllers: [LawReportsController],
  providers: [LawReportsService, LawReportRepository],
  exports: [LawReportsService],
})
export class LawReportsModule {}
