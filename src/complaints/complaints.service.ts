import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ComplaintRepository } from './repositories/complaint.repository';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintStatus } from './entities/complaint.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintRepository: ComplaintRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createComplaintDto: CreateComplaintDto, userId: string) {
    const complainantRef = { id: userId };
    const respondentRef = { id: createComplaintDto.respondentId };
    const caseRef = createComplaintDto.caseId
      ? { id: createComplaintDto.caseId }
      : null;

    const entity = this.complaintRepository.create({
      complainant: complainantRef,
      respondent: respondentRef,
      caseEntity: caseRef,
      type: createComplaintDto.type,
      title: createComplaintDto.title,
      description: createComplaintDto.description,
      severity: createComplaintDto.severity || 'MEDIUM',
      status: 'PENDING',
    });

    const savedComplaint = await this.complaintRepository.save(entity);

    return savedComplaint;
  }

  async findAll() {
    return this.complaintRepository.find({
      relations: ['complainant', 'respondent', 'caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['complainant', 'respondent', 'caseEntity'],
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async findByUser(userId: string) {
    return this.complaintRepository.find({
      where: [{ complainant: { id: userId } }, { respondent: { id: userId } }],
      relations: ['complainant', 'respondent', 'caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: ComplaintStatus) {
    const complaint = await this.findOne(id);
    complaint.status = status;
    return this.complaintRepository.save(complaint);
  }

  async resolve(id: string, resolution: string, mediatorId: string) {
    const complaint = await this.findOne(id);
    complaint.status = 'RESOLVED';
    complaint.resolution = resolution;
    complaint.mediatorId = mediatorId;
    complaint.resolutionDate = new Date();

    const savedComplaint = await this.complaintRepository.save(complaint);

    return savedComplaint;
  }
}
