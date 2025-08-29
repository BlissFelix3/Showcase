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

    // Create payment for document generation
    const payment = await this.paymentsService.createConsultationPayment(
      clientId,
      saved.amountMinor,
    );

    // Update document with payment reference
    saved.paymentReference = payment.providerRef;
    const finalDocument = await this.documentRepository.save(saved);

    // Emit document created event for notifications
    this.eventEmitter.emit(LocalEvents.DOCUMENT_GENERATION_REQUESTED, {
      userId: clientId,
      slug: 'document-generation-requested',
      document: finalDocument,
    });

    return finalDocument;
  }

  async generateDocument(id: string) {
    const document = await this.findOne(id);

    if (!document.isPaid) {
      throw new Error('Document must be paid before generation');
    }

    // Generate document content based on type and template data
    document.generatedContent = await this.generateDocumentContent(
      document.type,
      document.templateData,
    );
    document.status = 'GENERATED';
    document.fileName = `${document.title}_${Date.now()}.docx`;

    const savedDocument = await this.documentRepository.save(document);

    // Emit document generated event for notifications
    this.eventEmitter.emit(LocalEvents.DOCUMENT_GENERATED, {
      userId: document.client.id,
      slug: 'document-generated',
      document: savedDocument,
    });

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
      SALE_AGREEMENT: 10000, // 100 NGN
      RENT_AGREEMENT: 8000, // 80 NGN
      QUIT_NOTICE: 5000, // 50 NGN
      CONTRACT: 15000, // 150 NGN
      LEGAL_LETTER: 3000, // 30 NGN
      AFFIDAVIT: 5000, // 50 NGN
      POWER_OF_ATTORNEY: 12000, // 120 NGN
      WILL: 20000, // 200 NGN
      CUSTOM: 25000, // 250 NGN
    };

    return fees[type] || 10000;
  }

  private async generateDocumentContent(
    type: DocumentType,
    templateData: Record<string, any>,
  ) {
    // Use the actual document generation service
    const generatedDocument =
      await this.documentGenerationService.generateDocument(
        type,
        templateData as DocumentTemplateData,
        templateData.language || 'en',
      );

    return generatedDocument.content;
  }
}
