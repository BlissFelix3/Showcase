import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentRepository } from './repositories/document.repository';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { PaymentsService } from '../payments/payments.service';
import { DocumentType, DocumentStatus } from './entities/document.entity';
import { LocalEvents } from '../utils/constants';
import {
  DocumentGenerationService,
  DocumentTemplateData,
} from './document-generation.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async createDocument(clientId: string, dto: GenerateDocumentDto) {
    const document = this.documentRepository.create({
      client: { id: clientId },
      caseEntity: dto.caseId ? { id: dto.caseId } : null,
      title: dto.title,
      type: dto.type,
      description: dto.description,
      templateData: dto.templateData,
      language: dto.language || 'en',
      amountMinor: this.calculateDocumentFee(dto.type),
      status: 'DRAFT',
    });

    const saved = await this.documentRepository.save(document);

    const payment = await this.paymentsService.createConsultationPayment(
      clientId,
      saved.amountMinor,
    );

    saved.paymentReference = payment.providerRef;
    const finalDocument = await this.documentRepository.save(saved);

    return finalDocument;
  }

  async generateDocument(id: string) {
    const document = await this.findOne(id);

    if (!document.isPaid) {
      throw new Error('Document must be paid before generation');
    }

    document.generatedContent = await this.generateDocumentContent(
      document.type,
      document.templateData,
    );
    document.status = 'GENERATED';
    document.fileName = `${document.title}_${Date.now()}.docx`;

    const savedDocument = await this.documentRepository.save(document);

    return savedDocument;
  }

  async getDocumentById(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['client', 'caseEntity'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getClientDocuments(clientId: string) {
    return this.documentRepository.find({
      where: { client: { id: clientId } },
      relations: ['caseEntity'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDocumentStatus(id: string, status: DocumentStatus) {
    const document = await this.findOne(id);
    document.status = status;
    return this.documentRepository.save(document);
  }

  private async findOne(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['client', 'caseEntity'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  private calculateDocumentFee(type: DocumentType): number {
    const fees: Record<DocumentType, number> = {
      SALE_AGREEMENT: 10000,
      RENT_AGREEMENT: 8000,
      QUIT_NOTICE: 5000,
      CONTRACT: 15000,
      LEGAL_LETTER: 3000,
      AFFIDAVIT: 5000,
      POWER_OF_ATTORNEY: 12000,
      WILL: 20000,
      CUSTOM: 25000,
    };

    return fees[type] || 10000;
  }

  private async generateDocumentContent(
    type: DocumentType,
    templateData: Record<string, any>,
  ) {
    const generatedDocument =
      await this.documentGenerationService.generateDocument(
        type,
        templateData as DocumentTemplateData,
        templateData.language || 'en',
      );

    return generatedDocument.content;
  }
}
