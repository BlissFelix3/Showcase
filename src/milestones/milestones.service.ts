import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneRepository } from './repositories/milestone.repository';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { PaymentsService } from '../payments/payments.service';
import { MilestoneStatus } from './entities/milestone.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly milestoneRepository: MilestoneRepository,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createMilestoneDto: CreateMilestoneDto, caseId: string) {
    const milestone = this.milestoneRepository.create({
      ...createMilestoneDto,
      caseEntity: { id: caseId },
      status: 'PENDING',
    });

    const savedMilestone = await this.milestoneRepository.save(milestone);

    // Emit milestone created event for notifications
    this.eventEmitter.emit(LocalEvents.MILESTONE_CREATED, {
      userId: savedMilestone.caseEntity.client.id,
      slug: 'milestone-created',
      milestone: savedMilestone,
    });

    return savedMilestone;
  }

  async fund(caseId: string, milestoneId: string, amountMinor: number) {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['caseEntity'],
    });
    if (!milestone || milestone.caseEntity.id !== caseId)
      throw new NotFoundException('Milestone not found');
    if (amountMinor <= 0) throw new BadRequestException('Invalid amount');

    // Create escrow payment via PaymentsService
    const { escrowId } = await this.paymentsService.createEscrowPayment({
      caseId,
      amountMinor,
      milestoneId,
      purpose: 'milestone',
      lawyerId: milestone.caseEntity.lawyer?.id || 'system',
      clientId: milestone.caseEntity.client.id,
    });

    return { funded: true, escrowId };
  }

  async complete(milestoneId: string) {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['caseEntity'],
    });
    if (!milestone) throw new NotFoundException('Milestone not found');

    // Find the associated escrow payment and release it
    const escrowPayment = await this.paymentsService.getEscrowsByCase(
      milestone.caseEntity.id,
    );
    const milestoneEscrow = escrowPayment.find(
      (escrow) =>
        escrow.metadata?.milestoneId === milestoneId &&
        escrow.status === 'ACTIVE',
    );

    if (milestoneEscrow) {
      await this.paymentsService.releaseEscrow(
        milestoneEscrow.escrowId,
        'Milestone completed',
        'system',
      );
    }

    milestone.status = 'COMPLETED';
    const savedMilestone = await this.milestoneRepository.save(milestone);

    // Emit milestone completed event for notifications
    this.eventEmitter.emit(LocalEvents.MILESTONE_COMPLETED, {
      userId: milestone.caseEntity.client.id,
      slug: 'milestone-completed',
      milestone: savedMilestone,
    });

    return savedMilestone;
  }

  async updateStatus(milestoneId: string, status: MilestoneStatus) {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Validate status transition
    const validStatuses: MilestoneStatus[] = [
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED',
      'PAID',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    milestone.status = status;
    return this.milestoneRepository.save(milestone);
  }

  async findById(milestoneId: string) {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['caseEntity'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return milestone;
  }

  async findByCase(caseId: string) {
    return this.milestoneRepository.find({
      where: { caseEntity: { id: caseId } },
      order: { createdAt: 'ASC' },
    });
  }

  async delete(milestoneId: string) {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    await this.milestoneRepository.remove(milestone);
    return { deleted: true };
  }
}
