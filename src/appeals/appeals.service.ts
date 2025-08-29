import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppealRepository } from './repositories/appeal.repository';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealStatus, AppealType, Appeal } from './entities/appeal.entity';
import { NotificationService } from '../notifications/notification.service';
import { LocalEvents } from '../utils/constants';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class AppealsService {
  constructor(
    private readonly appealRepository: AppealRepository,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(appellantId: string, createAppealDto: CreateAppealDto) {
    const appeal = this.appealRepository.create({
      ...createAppealDto,
      appellantId,
      status: AppealStatus.PENDING,
      language: createAppealDto.language || 'en',
      evidence: createAppealDto.evidence
        ? createAppealDto.evidence.join(',')
        : null,
    });

    const savedAppeal = await this.appealRepository.save(appeal);

    return savedAppeal;
  }

  async review(
    appealId: string,
    adminId: string,
    reviewData: {
      status: AppealStatus;
      reviewNotes: string;
      decision: string;
    },
  ) {
    const appeal = await this.findById(appealId);

    if (
      appeal.status === AppealStatus.APPROVED ||
      appeal.status === AppealStatus.REJECTED
    ) {
      throw new BadRequestException('Appeal has already been reviewed');
    }

    appeal.status = reviewData.status;
    appeal.reviewedBy = adminId;
    appeal.reviewedAt = new Date();
    appeal.reviewNotes = reviewData.reviewNotes;
    appeal.decision = reviewData.decision;
    appeal.decisionDate = new Date();

    const savedAppeal = await this.appealRepository.save(appeal);

    await this.sendReviewNotifications(savedAppeal);

    return savedAppeal;
  }

  async withdraw(appealId: string, appellantId: string) {
    const appeal = await this.findById(appealId);

    if (appeal.appellantId !== appellantId) {
      throw new ForbiddenException('You can only withdraw your own appeals');
    }

    if (appeal.status !== AppealStatus.PENDING) {
      throw new BadRequestException('Only pending appeals can be withdrawn');
    }

    appeal.status = AppealStatus.WITHDRAWN;
    return this.appealRepository.save(appeal);
  }

  async findById(id: string) {
    const appeal = await this.appealRepository.findOne({
      where: { id },
      relations: ['appellant', 'caseEntity', 'reviewer'],
    });

    if (!appeal) {
      throw new NotFoundException('Appeal not found');
    }

    return appeal;
  }

  async getAppellantAppeals(appellantId: string, status?: AppealStatus) {
    const where: FindOptionsWhere<Appeal> = { appellantId };
    if (status) {
      where.status = status;
    }

    return this.appealRepository.find({
      where,
      relations: ['caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingAppeals() {
    return this.appealRepository.find({
      where: { status: AppealStatus.PENDING },
      relations: ['appellant', 'caseEntity'],
      order: {
        isUrgent: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async getAppealsByType(type: AppealType, status?: AppealStatus) {
    const where: FindOptionsWhere<Appeal> = { type };
    if (status) {
      where.status = status;
    }

    return this.appealRepository.find({
      where,
      relations: ['appellant', 'caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAppealsByCase(caseId: string) {
    return this.appealRepository.find({
      where: { caseId },
      relations: ['appellant'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUrgentAppeals() {
    return this.appealRepository.find({
      where: { isUrgent: true, status: AppealStatus.PENDING },
      relations: ['appellant', 'caseEntity'],
      order: { createdAt: 'ASC' },
    });
  }

  private async sendReviewNotifications(appeal: Appeal) {
    try {
      await this.notificationService.createNotification({
        userId: appeal.appellantId,
        title: 'Appeal Reviewed',
        message: `Your appeal "${appeal.title}" has been ${appeal.status.toLowerCase()}`,

        metadata: {
          appealId: appeal.id,
          status: appeal.status,
          decision: appeal.decision,
        },
      });
    } catch (error) {
      console.error('Failed to send appeal review notifications:', error);
    }
  }
}
