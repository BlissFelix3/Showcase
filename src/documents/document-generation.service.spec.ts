import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  DocumentGenerationService,
  DocumentTemplateData,
} from './document-generation.service';
import { DocumentType } from './entities/document.entity';

describe('DocumentGenerationService', () => {
  let service: DocumentGenerationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentGenerationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentGenerationService>(DocumentGenerationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDocument', () => {
    it('should generate a sale agreement document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyAAddress: '123 Main St, Lagos',
        partyBName: 'Jane Smith',
        partyBAddress: '456 Oak Ave, Abuja',
        propertyDescription: 'A 3-bedroom apartment in Victoria Island',
        amount: '50,000,000',
        date: '2024-01-15',
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain('SALE AGREEMENT');
      expect(result.content).toContain('John Doe');
      expect(result.content).toContain('Jane Smith');
      expect(result.content).toContain('₦50,000,000');
      expect(result.fileName).toContain('SALE_AGREEMENT');
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
    });

    it('should generate a rent agreement document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Landlord Corp',
        partyAAddress: '789 Business Blvd, Lagos',
        partyBName: 'Tenant LLC',
        partyBAddress: '321 Residential Rd, Abuja',
        propertyDescription: 'Office space in business district',
        amount: '500,000',
        duration: '12 months',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
      };

      const result = await service.generateDocument(
        'RENT_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain('RENT AGREEMENT');
      expect(result.content).toContain('Landlord Corp');
      expect(result.content).toContain('Tenant LLC');
      expect(result.content).toContain('₦500,000');
      expect(result.content).toContain('12 months');
    });

    it('should generate a quit notice document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Property Owner',
        partyAAddress: '555 Owner St, Lagos',
        partyBName: 'Current Tenant',
        partyBAddress: '777 Tenant Ave, Abuja',
        propertyAddress: '999 Property Rd, Lagos',
        reason: 'Non-payment of rent for 3 consecutive months',
        vacateDate: '2024-03-31',
      };

      const result = await service.generateDocument(
        'QUIT_NOTICE',
        templateData,
      );

      expect(result.content).toContain('QUIT NOTICE');
      expect(result.content).toContain('Property Owner');
      expect(result.content).toContain('Current Tenant');
      expect(result.content).toContain(
        'Non-payment of rent for 3 consecutive months',
      );
      expect(result.content).toContain('2024-03-31');
    });

    it('should generate a contract document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Service Provider Inc',
        partyAAddress: '111 Service St, Lagos',
        partyBName: 'Client Company Ltd',
        partyBAddress: '222 Client Ave, Abuja',
        subjectMatter: 'Software development services',
        amount: '2,000,000',
        contractType: 'Service Contract',
        duration: '6 months',
      };

      const result = await service.generateDocument('CONTRACT', templateData);

      expect(result.content).toContain('CONTRACT AGREEMENT');
      expect(result.content).toContain('Service Provider Inc');
      expect(result.content).toContain('Client Company Ltd');
      expect(result.content).toContain('Software development services');
      expect(result.content).toContain('₦2,000,000');
    });

    it('should generate a legal letter document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Law Firm Associates',
        partyAAddress: '333 Legal Blvd, Lagos',
        partyBName: 'Opposing Party',
        partyBAddress: '444 Opposing Rd, Abuja',
        subjectMatter: 'Breach of contract notice',
      };

      const result = await service.generateDocument(
        'LEGAL_LETTER',
        templateData,
      );

      expect(result.content).toContain('LEGAL LETTER');
      expect(result.content).toContain('Law Firm Associates');
      expect(result.content).toContain('Opposing Party');
      expect(result.content).toContain('Breach of contract notice');
    });

    it('should generate an affidavit document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Affiant Person',
        partyAAddress: '555 Affiant St, Lagos',
        subjectMatter: 'Identity verification for passport application',
      };

      const result = await service.generateDocument('AFFIDAVIT', templateData);

      expect(result.content).toContain('AFFIDAVIT');
      expect(result.content).toContain('Affiant Person');
      expect(result.content).toContain(
        'Identity verification for passport application',
      );
    });

    it('should generate a power of attorney document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Principal Person',
        partyAAddress: '666 Principal Ave, Lagos',
        partyBName: 'Attorney Agent',
        partyBAddress: '777 Attorney Blvd, Abuja',
        subjectMatter: 'Real estate transactions',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = await service.generateDocument(
        'POWER_OF_ATTORNEY',
        templateData,
      );

      expect(result.content).toContain('POWER OF ATTORNEY');
      expect(result.content).toContain('Principal Person');
      expect(result.content).toContain('Attorney Agent');
      expect(result.content).toContain('Real estate transactions');
    });

    it('should generate a will document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Testator Person',
        partyAAddress: '888 Testator Rd, Lagos',
        subjectMatter: 'Distribution of estate assets',
        executorName: 'Executor Person',
        residuaryBeneficiary: 'Beneficiary Person',
      };

      const result = await service.generateDocument('WILL', templateData);

      expect(result.content).toContain('LAST WILL AND TESTAMENT');
      expect(result.content).toContain('Testator Person');
      expect(result.content).toContain('Executor Person');
      expect(result.content).toContain('Distribution of estate assets');
    });

    it('should generate a custom document successfully', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Custom Client',
        partyAAddress: '999 Custom St, Lagos',
        subjectMatter: 'Custom legal matter',
        customContent: 'This is a custom legal document content.',
        documentTitle: 'CUSTOM LEGAL AGREEMENT',
      };

      const result = await service.generateDocument('CUSTOM', templateData);

      expect(result.content).toContain('CUSTOM LEGAL AGREEMENT');
      expect(result.content).toContain('Custom Client');
      expect(result.content).toContain('Custom legal matter');
      expect(result.content).toContain(
        'This is a custom legal document content.',
      );
    });

    it('should throw error for missing required fields in sale agreement', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'John Doe',
        // Missing required fields: partyBName, propertyDescription, amount
      };

      await expect(
        service.generateDocument('SALE_AGREEMENT', templateData),
      ).rejects.toThrow(
        "Document generation failed: Required field 'partyBName' is missing or empty",
      );
    });

    it('should throw error for missing required fields in rent agreement', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Landlord',
        partyBName: 'Tenant',
        // Missing required fields: propertyDescription, amount, duration
      };

      await expect(
        service.generateDocument('RENT_AGREEMENT', templateData),
      ).rejects.toThrow(
        "Document generation failed: Required field 'propertyDescription' is missing or empty",
      );
    });

    it('should throw error for unsupported document type', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Test Person',
        subjectMatter: 'Test matter',
      };

      await expect(
        service.generateDocument('INVALID_TYPE' as DocumentType, templateData),
      ).rejects.toThrow(
        'Document generation failed: Unsupported document type: INVALID_TYPE',
      );
    });

    it('should use default jurisdiction and currency when not provided', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyBName: 'Jane Smith',
        propertyDescription: 'Test property',
        amount: '100,000',
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain('Nigeria');
      expect(result.content).toContain('₦100,000');
    });

    it('should use custom jurisdiction and currency when provided', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyBName: 'Jane Smith',
        propertyDescription: 'Test property',
        amount: '100,000',
        jurisdiction: 'Ghana',
        currency: 'GH₵',
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain('Ghana');
      expect(result.content).toContain('GH₵100,000');
    });

    it('should generate document with custom terms and conditions', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Party A',
        partyBName: 'Party B',
        propertyDescription: 'Test property',
        amount: '100,000',
        terms: ['Custom term 1', 'Custom term 2', 'Custom term 3'],
        conditions: ['Special condition 1', 'Special condition 2'],
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain('1. Custom term 1');
      expect(result.content).toContain('2. Custom term 2');
      expect(result.content).toContain('3. Custom term 3');
      expect(result.content).toContain('1. Special condition 1');
      expect(result.content).toContain('2. Special condition 2');
    });

    it('should generate document with default terms when none provided', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'Party A',
        partyBName: 'Party B',
        propertyDescription: 'Test property',
        amount: '100,000',
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.content).toContain(
        '1. Both parties agree to fulfill their obligations',
      );
      expect(result.content).toContain(
        '2. Any modifications must be made in writing',
      );
      expect(result.content).toContain(
        '3. This agreement is binding upon the parties',
      );
      expect(result.content).toContain(
        '4. If any provision of this agreement is found to be invalid',
      );
    });

    it('should generate metadata correctly', async () => {
      const templateData: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyBName: 'Jane Smith',
        propertyDescription: 'Test property',
        amount: '100,000',
        jurisdiction: 'Nigeria',
        language: 'en',
      };

      const result = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData,
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.documentType).toBe('SALE_AGREEMENT');
      expect(result.metadata.language).toBe('en');
      expect(result.metadata.jurisdiction).toBe('Nigeria');
      expect(result.metadata.metadata.partyCount).toBe(2);
      expect(result.metadata.metadata.hasFinancialTerms).toBe(true);
      expect(result.metadata.metadata.hasDuration).toBe(false);
    });

    it('should generate unique file names for different documents', async () => {
      const templateData1: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyBName: 'Jane Smith',
        propertyDescription: 'Property 1',
        amount: '100,000',
        title: 'Sale Agreement 1',
      };

      const templateData2: DocumentTemplateData = {
        partyAName: 'John Doe',
        partyBName: 'Jane Smith',
        propertyDescription: 'Property 2',
        amount: '200,000',
        title: 'Sale Agreement 2',
      };

      const result1 = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData1,
      );
      const result2 = await service.generateDocument(
        'SALE_AGREEMENT',
        templateData2,
      );

      expect(result1.fileName).not.toBe(result2.fileName);
      expect(result1.fileName).toContain('Sale_Agreement_1');
      expect(result2.fileName).toContain('Sale_Agreement_2');
    });
  });
});
