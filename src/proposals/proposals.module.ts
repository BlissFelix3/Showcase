import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { ProposalRepository } from './repositories/proposal.repository';
import { CasesModule } from '../cases/cases.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [CasesModule, PaymentsModule],
  controllers: [ProposalsController],
  providers: [ProposalsService, ProposalRepository],
})
export class ProposalsModule {}
