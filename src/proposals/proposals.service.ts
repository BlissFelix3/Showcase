import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProposalRepository } from './repositories/proposal.repository';
import { SubmitProposalDto } from './dto/submit-proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { CaseRepository } from '../cases/repositories/case.repository';
import { PaymentsService } from '../payments/payments.service';
import { LocalEvents } from '../utils/constants';
import type { FindOptionsWhere } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import type { CaseEntity, CaseStatus } from '../cases/entities/case.entity';
import type { User } from '../users/entities/user.entity';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly proposalRepository: ProposalRepository,
    private readonly caseRepository: CaseRepository,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submit(
    caseId: string,
    lawyerId: string,
    dto: SubmitProposalDto,
  ): Promise<Proposal> {
    const proposal = this.proposalRepository.create({
      caseEntity: { id: caseId },
      lawyer: { id: lawyerId },
      quotedFeeMinor: dto.quotedFeeMinor,
    });

    const savedProposal = await this.proposalRepository.save(proposal);

    // Emit proposal submitted event for notifications
    this.eventEmitter.emit(LocalEvents.PROPOSAL_SUBMITTED, {
      userId: lawyerId,
      slug: 'proposal-submitted',
      proposal: savedProposal,
    });

    return savedProposal;
  }

  async accept(proposalId: string): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
      relations: ['caseEntity', 'lawyer'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    proposal.status = 'ACCEPTED';
    const saved = await this.proposalRepository.save(proposal);

    const updates: QueryDeepPartialEntity<CaseEntity> = {
      lawyer: { id: proposal.lawyer.id } as QueryDeepPartialEntity<User>,
      status: 'IN_PROGRESS' as CaseStatus,
    };

    await this.caseRepository.update({ id: proposal.caseEntity.id }, updates);

    await this.paymentsService.createEscrowPayment({
      caseId: proposal.caseEntity.id,
      amountMinor: proposal.quotedFeeMinor,
      purpose: 'escrow_full_fee',
      lawyerId: proposal.lawyer.id,
      clientId: proposal.caseEntity.client.id,
    });

    // Emit proposal accepted event for notifications
    this.eventEmitter.emit(LocalEvents.PROPOSAL_ACCEPTED, {
      userId: proposal.lawyer.id,
      slug: 'proposal-accepted',
      proposal: saved,
    });

    // Emit case assigned event for notifications
    this.eventEmitter.emit(LocalEvents.CASE_ASSIGNED, {
      userId: proposal.caseEntity.client.id,
      slug: 'case-assigned',
      caseData: proposal.caseEntity,
    });

    return saved;
  }

  async listForUser(userId: string) {
    const where: FindOptionsWhere<Proposal>[] = [
      { lawyer: { id: userId } },
      { caseEntity: { client: { id: userId } } },
    ];

    return this.proposalRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}
