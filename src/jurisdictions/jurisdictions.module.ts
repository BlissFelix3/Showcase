import { Module } from '@nestjs/common';
import { JurisdictionsService } from './jurisdictions.service';
import { JurisdictionRepository } from './repositories/jurisdiction.repository';

@Module({
  providers: [JurisdictionsService, JurisdictionRepository],
  exports: [JurisdictionsService],
})
export class JurisdictionsModule {}
