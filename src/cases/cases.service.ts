import { Injectable, NotFoundException } from '@nestjs/common';

import { CaseRepository } from './repositories/case.repository';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseStatus } from './entities/case.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class CasesService {
  constructor(private readonly caseRepository: CaseRepository) {}

  async create(createCaseDto: CreateCaseDto, clientId: string) {
    const caseEntity = this.caseRepository.create({
      title: createCaseDto.title,
      summary: createCaseDto.summary,
      client: { id: clientId },
      status: 'OPEN' as CaseStatus,
      jurisdictionId: createCaseDto.jurisdiction,
      latitude: createCaseDto.latitude,
      longitude: createCaseDto.longitude,
    });

    const savedCase = await this.caseRepository.save(caseEntity);

    return savedCase;
  }

  async findOne(id: string, userId: string) {
    const caseEntity = await this.caseRepository.findOne({
      where: { id, client: { id: userId } },
      relations: ['client', 'lawyer'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    return caseEntity;
  }
}
