import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientBriefRepository } from './repositories/client-brief.repository';
import { CreateClientBriefDto } from './dto/create-client-brief.dto';
import { BriefStatus, BriefPriority } from './entities/client-brief.entity';
import { NotificationService } from '../notifications/notification.service';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class ClientBriefsService {
  constructor(
    private readonly clientBriefRepository: ClientBriefRepository,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(clientId: string, createClientBriefDto: CreateClientBriefDto) {
    const clientBrief = this.clientBriefRepository.create({
      ...createClientBriefDto,
      clientId,
      status: BriefStatus.DRAFT,
      priority: createClientBriefDto.priority || BriefPriority.MEDIUM,
      language: createClientBriefDto.language || 'en',
    });

    return this.clientBriefRepository.save(clientBrief);
  }

  async publish(briefId: string, clientId: string) {
    const clientBrief = await this.findById(briefId);

    if (clientBrief.clientId !== clientId) {
      throw new ForbiddenException('You can only publish your own briefs');
    }

    if (clientBrief.status !== BriefStatus.DRAFT) {
      throw new BadRequestException('Only draft briefs can be published');
    }

    clientBrief.status = BriefStatus.PUBLISHED;
    clientBrief.publishedAt = new Date();

    const savedBrief = await this.clientBriefRepository.save(clientBrief);

    this.eventEmitter.emit(LocalEvents.CLIENT_BRIEF_PUBLISHED, {
      userId: clientId,
      slug: 'brief-published',
      brief: savedBrief,
    });

    return savedBrief;
  }

  async assignLawyer(briefId: string, lawyerId: string, adminId: string) {
    const clientBrief = await this.findById(briefId);

    if (clientBrief.status !== BriefStatus.PUBLISHED) {
      throw new BadRequestException('Only published briefs can be assigned');
    }

    clientBrief.status = BriefStatus.ASSIGNED;
    clientBrief.assignedLawyerId = lawyerId;
    clientBrief.assignedAt = new Date();

    const savedBrief = await this.clientBriefRepository.save(clientBrief);

    await this.sendAssignmentNotifications(savedBrief);

    this.eventEmitter.emit(LocalEvents.CLIENT_BRIEF_ASSIGNED, {
      userId: lawyerId,
      slug: 'brief-assigned',
      brief: savedBrief,
    });

    return savedBrief;
  }

  async close(briefId: string, clientId: string) {
    const clientBrief = await this.findById(briefId);

    if (clientBrief.clientId !== clientId) {
      throw new ForbiddenException('You can only close your own briefs');
    }

    if (clientBrief.status === BriefStatus.ASSIGNED) {
      throw new BadRequestException('Cannot close assigned briefs');
    }

    clientBrief.status = BriefStatus.CLOSED;
    clientBrief.closedAt = new Date();

    return this.clientBriefRepository.save(clientBrief);
  }

  async update(
    briefId: string,
    clientId: string,
    updateData: Partial<CreateClientBriefDto>,
  ) {
    const clientBrief = await this.findById(briefId);

    if (clientBrief.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own briefs');
    }

    if (clientBrief.status !== BriefStatus.DRAFT) {
      throw new BadRequestException('Only draft briefs can be updated');
    }

    Object.assign(clientBrief, updateData);
    return this.clientBriefRepository.save(clientBrief);
  }

  async findById(id: string) {
    const clientBrief = await this.clientBriefRepository.findOne({
      where: { id },
      relations: ['client', 'caseEntity', 'assignedLawyer', 'proposals'],
    });

    if (!clientBrief) {
      throw new NotFoundException('Client brief not found');
    }

    return clientBrief;
  }

  async getClientBriefs(clientId: string, status?: BriefStatus) {
    const where: any = { clientId };
    if (status) {
      where.status = status;
    }

    return this.clientBriefRepository.find({
      where,
      relations: ['caseEntity', 'assignedLawyer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublishedBriefs(filters?: {
    jurisdiction?: string;
    priority?: BriefPriority;
    language?: string;
    requiresMediation?: boolean;
  }) {
    const where: any = { status: BriefStatus.PUBLISHED };

    if (filters?.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.language) {
      where.language = filters.language;
    }
    if (filters?.requiresMediation !== undefined) {
      where.requiresMediation = filters.requiresMediation;
    }

    return this.clientBriefRepository.find({
      where,
      relations: ['client'],
      order: {
        isUrgent: 'DESC',
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async searchBriefs(
    query: string,
    filters?: {
      jurisdiction?: string;
      priority?: BriefPriority;
      language?: string;
    },
  ) {
    const where: any = { status: BriefStatus.PUBLISHED };

    if (filters?.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.language) {
      where.language = filters.language;
    }

    return this.clientBriefRepository
      .createQueryBuilder('brief')
      .where('brief.status = :status', { status: BriefStatus.PUBLISHED })
      .andWhere(
        '(brief.title ILIKE :query OR brief.description ILIKE :query OR brief.legalProblem ILIKE :query)',
        { query: `%${query}%` },
      )
      .andWhere(
        filters?.jurisdiction ? 'brief.jurisdiction = :jurisdiction' : '1=1',
        {
          jurisdiction: filters?.jurisdiction || '',
        },
      )
      .andWhere(filters?.priority ? 'brief.priority = :priority' : '1=1', {
        priority: filters?.priority || BriefPriority.MEDIUM,
      })
      .andWhere(filters?.language ? 'brief.language = :language' : '1=1', {
        language: filters?.language || 'en',
      })
      .orderBy('brief.isUrgent', 'DESC')
      .addOrderBy('brief.priority', 'DESC')
      .addOrderBy('brief.createdAt', 'ASC')
      .getMany();
  }

  async getBriefsByJurisdiction(jurisdiction: string) {
    return this.clientBriefRepository.find({
      where: { jurisdiction, status: BriefStatus.PUBLISHED },
      relations: ['client'],
      order: {
        isUrgent: 'DESC',
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  private async sendAssignmentNotifications(clientBrief: any) {
    try {
      if (clientBrief.assignedLawyerId) {
        await this.notificationService.createNotification({
          userId: clientBrief.assignedLawyerId,
          title: 'New Brief Assigned',
          message: `You have been assigned to handle: ${clientBrief.title}`,
        });
      }

      await this.notificationService.createNotification({
        userId: clientBrief.clientId,
        title: 'Lawyer Assigned',
        message: `A lawyer has been assigned to handle your brief: ${clientBrief.title}`,
      });
    } catch (error) {
      console.error('Failed to send assignment notifications:', error);
    }
  }
}
