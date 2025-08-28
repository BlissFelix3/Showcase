import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentRepository } from './repositories/document.repository';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { PaymentsService } from '../payments/payments.service';
import { DocumentType, DocumentStatus } from './entities/document.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
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
    // Simulate document generation (replace with actual document generation service)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const templates: Record<DocumentType, string> = {
      SALE_AGREEMENT: this.generateSaleAgreement(templateData),
      RENT_AGREEMENT: this.generateRentAgreement(templateData),
      QUIT_NOTICE: this.generateQuitNotice(templateData),
      CONTRACT: this.generateContract(templateData),
      LEGAL_LETTER: this.generateLegalLetter(templateData),
      AFFIDAVIT: this.generateAffidavit(templateData),
      POWER_OF_ATTORNEY: this.generatePowerOfAttorney(templateData),
      WILL: this.generateWill(templateData),
      CUSTOM: this.generateCustomDocument(templateData),
    };

    return templates[type] || 'Document content generated successfully.';
  }

  private generateSaleAgreement(data: Record<string, any>): string {
    return `SALE AGREEMENT

This Sale Agreement is made on ${data.date || new Date().toLocaleDateString()} between:

SELLER: ${data.sellerName || 'N/A'}
ADDRESS: ${data.sellerAddress || 'N/A'}

BUYER: ${data.buyerName || 'N/A'}
ADDRESS: ${data.buyerAddress || 'N/A'}

PROPERTY: ${data.propertyDescription || 'N/A'}
PRICE: ₦${data.price || 'N/A'}

Terms and conditions as agreed upon by both parties.

Signed by:
Seller: _________________
Buyer: _________________
Witness: _________________`;
  }

  private generateRentAgreement(data: Record<string, any>): string {
    return `RENT AGREEMENT

This Rent Agreement is made on ${data.date || new Date().toLocaleDateString()} between:

LANDLORD: ${data.landlordName || 'N/A'}
ADDRESS: ${data.landlordAddress || 'N/A'}

TENANT: ${data.tenantName || 'N/A'}
ADDRESS: ${data.tenantAddress || 'N/A'}

PROPERTY: ${data.propertyDescription || 'N/A'}
RENT: ₦${data.rent || 'N/A'} per month
DURATION: ${data.duration || 'N/A'}

Terms and conditions as agreed upon by both parties.

Signed by:
Landlord: _________________
Tenant: _________________
Witness: _________________`;
  }

  private generateQuitNotice(data: Record<string, any>): string {
    return `QUIT NOTICE

To: ${data.tenantName || 'N/A'}
Address: ${data.tenantAddress || 'N/A'}

This is to notify you that you are required to quit and deliver up possession of the premises located at:

${data.propertyAddress || 'N/A'}

The reason for this notice is: ${data.reason || 'N/A'}

You are required to vacate the premises on or before: ${data.vacateDate || 'N/A'}

Dated: ${data.date || new Date().toLocaleDateString()}

Landlord: ${data.landlordName || 'N/A'}`;
  }

  private generateContract(data: Record<string, any>): string {
    return `CONTRACT AGREEMENT

This Contract is made on ${data.date || new Date().toLocaleDateString()} between:

PARTY A: ${data.partyAName || 'N/A'}
ADDRESS: ${data.partyAAddress || 'N/A'}

PARTY B: ${data.partyBName || 'N/A'}
ADDRESS: ${data.partyBAddress || 'N/A'}

SCOPE OF WORK: ${data.scopeOfWork || 'N/A'}
CONTRACT VALUE: ₦${data.contractValue || 'N/A'}
DURATION: ${data.duration || 'N/A'}

Terms and conditions as agreed upon by both parties.

Signed by:
Party A: _________________
Party B: _________________
Witness: _________________`;
  }

  private generateLegalLetter(data: Record<string, any>): string {
    return `LEGAL LETTER

Date: ${data.date || new Date().toLocaleDateString()}
To: ${data.recipientName || 'N/A'}
Address: ${data.recipientAddress || 'N/A'}

Subject: ${data.subject || 'N/A'}

Dear ${data.recipientName || 'Sir/Madam'},

${data.content || 'This is a legal letter regarding the matter discussed.'}

Please treat this matter with the urgency it deserves.

Yours faithfully,
${data.senderName || 'N/A'}
${data.senderTitle || 'N/A'}`;
  }

  private generateAffidavit(data: Record<string, any>): string {
    return `AFFIDAVIT

I, ${data.deponentName || 'N/A'}, of ${data.deponentAddress || 'N/A'}, do hereby solemnly declare and affirm as follows:

${data.content || 'This affidavit is made in support of the application.'}

I make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Oaths Act.

Sworn to at ${data.location || 'N/A'} this ${data.date || new Date().toLocaleDateString()}

Before me:
Commissioner for Oaths/Notary Public

Deponent: _________________`;
  }

  private generatePowerOfAttorney(data: Record<string, any>): string {
    return `POWER OF ATTORNEY

I, ${data.principalName || 'N/A'}, of ${data.principalAddress || 'N/A'}, do hereby appoint ${data.attorneyName || 'N/A'}, of ${data.attorneyAddress || 'N/A'}, as my Attorney-in-Fact.

POWERS GRANTED:
${data.powers || 'General powers to act on my behalf in all matters.'}

This Power of Attorney shall remain in effect until ${data.expiryDate || 'revoked by me in writing'}.

Dated: ${data.date || new Date().toLocaleDateString()}

Principal: _________________
Attorney: _________________
Witness: _________________`;
  }

  private generateWill(data: Record<string, any>): string {
    return `LAST WILL AND TESTAMENT

I, ${data.testatorName || 'N/A'}, of ${data.testatorAddress || 'N/A'}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament.

I hereby revoke all former Wills and Codicils by me made.

I appoint ${data.executorName || 'N/A'} as Executor of this my Will.

I give, devise, and bequeath my estate as follows:

${data.bequests || 'All my property to be distributed according to law.'}

Dated: ${data.date || new Date().toLocaleDateString()}

Testator: _________________
Witness 1: _________________
Witness 2: _________________`;
  }

  private generateCustomDocument(data: Record<string, any>): string {
    return `CUSTOM DOCUMENT

${data.title || 'Custom Document'}

Date: ${data.date || new Date().toLocaleDateString()}

${data.content || 'This is a custom document generated based on your requirements.'}

Additional Information:
${data.additionalInfo || 'No additional information provided.'}

Signed by:
${data.signatoryName || 'N/A'}

Date: ${data.signatureDate || new Date().toLocaleDateString()}`;
  }
}
