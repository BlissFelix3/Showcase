import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DocumentType } from './entities/document.entity';
import { ConfigService } from '@nestjs/config';

export interface DocumentTemplateData {
  date?: string;
  language?: string;
  jurisdiction?: string;

  partyAName?: string;
  partyAAddress?: string;
  partyAEmail?: string;
  partyAPhone?: string;
  partyAIdType?: string;
  partyAIdNumber?: string;

  partyBName?: string;
  partyBAddress?: string;
  partyBEmail?: string;
  partyBPhone?: string;
  partyBIdType?: string;
  partyBIdNumber?: string;

  propertyDescription?: string;
  propertyAddress?: string;
  propertyType?: string;
  propertySize?: string;

  amount?: string;
  currency?: string;
  paymentTerms?: string;
  depositAmount?: string;

  duration?: string;
  startDate?: string;
  endDate?: string;
  terms?: string[];
  conditions?: string[];

  reason?: string;
  vacateDate?: string;
  noticePeriod?: string;
  contractType?: string;
  subjectMatter?: string;

  [key: string]: any;
}

export interface GeneratedDocument {
  content: string;
  fileName: string;
  mimeType: string;
  metadata: Record<string, any>;
}

@Injectable()
export class DocumentGenerationService {
  private readonly logger = new Logger(DocumentGenerationService.name);
  private readonly defaultJurisdiction = 'Nigeria';
  private readonly defaultCurrency = '₦';

  constructor(private readonly configService: ConfigService) {}

  async generateDocument(
    type: DocumentType,
    templateData: DocumentTemplateData,
    language: string = 'en',
  ): Promise<GeneratedDocument> {
    try {
      this.logger.log(`Generating ${type} document for language: ${language}`);

      this.validateTemplateData(type, templateData);

      const content = await this.generateDocumentContent(
        type,
        templateData,
        language,
      );

      const fileName = this.generateFileName(type, templateData);

      const metadata = this.createDocumentMetadata(
        type,
        templateData,
        language,
      );

      return {
        content,
        fileName,
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        metadata,
      };
    } catch (error) {
      this.logger.error(`Error generating ${type} document:`, error);
      throw new BadRequestException(
        `Document generation failed: ${error.message}`,
      );
    }
  }

  private validateTemplateData(
    type: DocumentType,
    data: DocumentTemplateData,
  ): void {
    const requiredFields = this.getRequiredFields(type);

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        throw new BadRequestException(
          `Required field '${field}' is missing or empty`,
        );
      }
    }
  }

  private getRequiredFields(type: DocumentType): string[] {
    const fieldMap: Record<DocumentType, string[]> = {
      SALE_AGREEMENT: [
        'partyAName',
        'partyBName',
        'propertyDescription',
        'amount',
      ],
      RENT_AGREEMENT: [
        'partyAName',
        'partyBName',
        'propertyDescription',
        'amount',
        'duration',
      ],
      QUIT_NOTICE: [
        'partyAName',
        'partyBName',
        'propertyAddress',
        'reason',
        'vacateDate',
      ],
      CONTRACT: ['partyAName', 'partyBName', 'subjectMatter', 'amount'],
      LEGAL_LETTER: ['partyAName', 'partyBName', 'subjectMatter'],
      AFFIDAVIT: ['partyAName', 'subjectMatter'],
      POWER_OF_ATTORNEY: ['partyAName', 'partyBName', 'subjectMatter'],
      WILL: ['partyAName', 'subjectMatter'],
      CUSTOM: ['subjectMatter'],
    };

    return fieldMap[type] || [];
  }

  private async generateDocumentContent(
    type: DocumentType,
    data: DocumentTemplateData,
    language: string,
  ): Promise<string> {
    const templates: Record<DocumentType, () => string> = {
      SALE_AGREEMENT: () => this.generateSaleAgreement(data, language),
      RENT_AGREEMENT: () => this.generateRentAgreement(data, language),
      QUIT_NOTICE: () => this.generateQuitNotice(data, language),
      CONTRACT: () => this.generateContract(data, language),
      LEGAL_LETTER: () => this.generateLegalLetter(data, language),
      AFFIDAVIT: () => this.generateAffidavit(data, language),
      POWER_OF_ATTORNEY: () => this.generatePowerOfAttorney(data, language),
      WILL: () => this.generateWill(data, language),
      CUSTOM: () => this.generateCustomDocument(data, language),
    };

    const template = templates[type];
    if (!template) {
      throw new BadRequestException(`Unsupported document type: ${type}`);
    }

    return template();
  }

  private generateSaleAgreement(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;
    const currency = data.currency || this.defaultCurrency;

    return `SALE AGREEMENT

This Sale Agreement (hereinafter referred to as "Agreement") is made and entered into on this ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()} in ${jurisdiction} between:

SELLER (hereinafter referred to as "Seller"):
Name: ${data.partyAName}
Address: ${data.partyAAddress}
Email: ${data.partyAEmail || 'N/A'}
Phone: ${data.partyAPhone || 'N/A'}
ID Type: ${data.partyAIdType || 'N/A'}
ID Number: ${data.partyAIdNumber || 'N/A'}

BUYER (hereinafter referred to as "Buyer"):
Name: ${data.partyBName}
Address: ${data.partyBAddress}
Email: ${data.partyBEmail || 'N/A'}
Phone: ${data.partyBPhone || 'N/A'}
ID Type: ${data.partyBIdType || 'N/A'}
ID Number: ${data.partyBIdNumber || 'N/A'}

PROPERTY DESCRIPTION:
${data.propertyDescription}

PROPERTY ADDRESS:
${data.propertyAddress || 'As described above'}

PROPERTY TYPE: ${data.propertyType || 'Real Estate'}
PROPERTY SIZE: ${data.propertySize || 'N/A'}

PURCHASE PRICE:
Total Amount: ${currency}${data.amount}
Deposit Amount: ${currency}${data.depositAmount || 'N/A'}
Payment Terms: ${data.paymentTerms || 'As agreed between parties'}

TERMS AND CONDITIONS:
${this.generateTermsAndConditions(data.terms)}

SPECIAL CONDITIONS:
${this.generateSpecialConditions(data.conditions)}

DISPUTE RESOLUTION:
Any dispute arising from this agreement shall be resolved through mediation in accordance with ${jurisdiction} law, and if mediation fails, through arbitration.

GOVERNING LAW:
This agreement shall be governed by and construed in accordance with the laws of ${jurisdiction}.

SIGNATURES:

Seller: _________________                    Date: _________________
Name: ${data.partyAName}

Buyer: _________________                     Date: _________________
Name: ${data.partyBName}

Witness 1: _________________                 Date: _________________
Name: _________________

Witness 2: _________________                 Date: _________________
Name: _________________

NOTARY PUBLIC: _________________             Date: _________________
Seal: _________________`;
  }

  private generateRentAgreement(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;
    const currency = data.currency || this.defaultCurrency;

    return `RENT AGREEMENT

This Rent Agreement (hereinafter referred to as "Agreement") is made and entered into on this ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()} in ${jurisdiction} between:

LANDLORD (hereinafter referred to as "Landlord"):
Name: ${data.partyAName}
Address: ${data.partyAAddress}
Email: ${data.partyAEmail || 'N/A'}
Phone: ${data.partyAPhone || 'N/A'}

TENANT (hereinafter referred to as "Tenant"):
Name: ${data.partyBName}
Address: ${data.partyBAddress}
Email: ${data.partyBEmail || 'N/A'}
Phone: ${data.partyBPhone || 'N/A'}
ID Type: ${data.partyBIdType || 'N/A'}
ID Number: ${data.partyBIdNumber || 'N/A'}

PROPERTY DESCRIPTION:
${data.propertyDescription}

PROPERTY ADDRESS:
${data.propertyAddress || 'As described above'}

PROPERTY TYPE: ${data.propertyType || 'Residential'}
PROPERTY SIZE: ${data.propertySize || 'N/A'}

RENTAL TERMS:
Monthly Rent: ${currency}${data.amount}
Security Deposit: ${currency}${data.depositAmount || 'N/A'}
Rental Duration: ${data.duration}
Start Date: ${data.startDate || 'N/A'}
End Date: ${data.endDate || 'N/A'}

UTILITIES AND SERVICES:
${this.generateUtilityTerms(data)}

RENTAL CONDITIONS:
${this.generateRentalConditions(data)}

TENANT OBLIGATIONS:
1. Pay rent on time
2. Maintain property in good condition
3. Notify landlord of any damages
4. Comply with building rules and regulations

LANDLORD OBLIGATIONS:
1. Maintain property in habitable condition
2. Provide necessary repairs
3. Respect tenant's privacy
4. Return security deposit upon termination

TERMINATION:
This agreement may be terminated by either party with ${data.noticePeriod || '30 days'} written notice.

DISPUTE RESOLUTION:
Any dispute arising from this agreement shall be resolved through mediation in accordance with ${jurisdiction} law.

GOVERNING LAW:
This agreement shall be governed by and construed in accordance with the laws of ${jurisdiction}.

SIGNATURES:

Landlord: _________________                  Date: _________________
Name: ${data.partyAName}

Tenant: _________________                    Date: _________________
Name: ${data.partyBName}

Witness: _________________                   Date: _________________
Name: _________________`;
  }

  private generateQuitNotice(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `QUIT NOTICE

To: ${data.partyBName}
Address: ${data.partyBAddress}
Email: ${data.partyBEmail || 'N/A'}
Phone: ${data.partyBPhone || 'N/A'}

Subject: Notice to Quit and Deliver Possession

Dear ${data.partyBName},

This is to formally notify you that you are required to quit and deliver up possession of the premises located at:

${data.propertyAddress}

PROPERTY DESCRIPTION:
${data.propertyDescription}

REASON FOR NOTICE:
${data.reason}

NOTICE PERIOD:
${data.noticePeriod || '30 days'} from the date of this notice

VACATE DATE:
You are required to vacate the premises on or before: ${data.vacateDate}

CONDITIONS:
1. Remove all personal belongings
2. Leave the premises in the same condition as received
3. Return all keys and access devices
4. Settle any outstanding utility bills

CONSEQUENCES OF NON-COMPLIANCE:
Failure to comply with this notice may result in legal action for eviction and recovery of possession.

CONTACT INFORMATION:
For any queries regarding this notice, please contact:

Landlord: ${data.partyAName}
Address: ${data.partyAAddress}
Phone: ${data.partyAPhone || 'N/A'}
Email: ${data.partyAEmail || 'N/A'}

This notice is served in accordance with the laws of ${jurisdiction}.

Dated: ${date}

Landlord: _________________
Name: ${data.partyAName}
Signature: _________________`;
  }

  private generateContract(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;
    const currency = data.currency || this.defaultCurrency;

    return `CONTRACT AGREEMENT

This Contract Agreement (hereinafter referred to as "Contract") is made and entered into on this ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()} in ${jurisdiction} between:

PARTY A (hereinafter referred to as "Party A"):
Name: ${data.partyAName}
Address: ${data.partyAAddress}
Email: ${data.partyAEmail || 'N/A'}
Phone: ${data.partyAPhone || 'N/A'}

PARTY B (hereinafter referred to as "Party B"):
Name: ${data.partyBName}
Address: ${data.partyBAddress}
Email: ${data.partyBEmail || 'N/A'}
Phone: ${data.partyBPhone || 'N/A'}

SUBJECT MATTER:
${data.subjectMatter}

CONTRACT TYPE:
${data.contractType || 'General Service Contract'}

CONTRACT VALUE:
Amount: ${currency}${data.amount}
Payment Terms: ${data.paymentTerms || 'As agreed between parties'}

CONTRACT DURATION:
Start Date: ${data.startDate || 'N/A'}
End Date: ${data.endDate || 'N/A'}
Duration: ${data.duration || 'N/A'}

SCOPE OF WORK:
${this.generateScopeOfWork(data)}

TERMS AND CONDITIONS:
${this.generateTermsAndConditions(data.terms)}

SPECIAL CONDITIONS:
${this.generateSpecialConditions(data.conditions)}

PAYMENT SCHEDULE:
${this.generatePaymentSchedule(data)}

TERMINATION CLAUSE:
Either party may terminate this contract with ${data.noticePeriod || '30 days'} written notice.

DISPUTE RESOLUTION:
Any dispute arising from this contract shall be resolved through mediation in accordance with ${jurisdiction} law, and if mediation fails, through arbitration.

GOVERNING LAW:
This contract shall be governed by and construed in accordance with the laws of ${jurisdiction}.

SIGNATURES:

Party A: _________________                   Date: _________________
Name: ${data.partyAName}
Signature: _________________

Party B: _________________                   Date: _________________
Name: ${data.partyBName}
Signature: _________________

Witness: _________________                   Date: _________________
Name: _________________`;
  }

  private generateLegalLetter(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `LEGAL LETTER

From: ${data.partyAName}
Address: ${data.partyAAddress}
Email: ${data.partyAEmail || 'N/A'}
Phone: ${data.partyAPhone || 'N/A'}

To: ${data.partyBName}
Address: ${data.partyBAddress}
Email: ${data.partyBEmail || 'N/A'}
Phone: ${data.partyBPhone || 'N/A'}

Date: ${date}
Subject: ${data.subjectMatter}

Dear ${data.partyBName},

${this.generateLetterContent(data)}

This letter serves as formal notice of our position and intentions regarding the above matter.

Please treat this matter with the urgency it deserves and respond within ${data.noticePeriod || '14 days'} of receipt of this letter.

If you fail to respond or take appropriate action, we reserve the right to pursue all available legal remedies without further notice.

For any queries regarding this matter, please contact us at the above address or phone number.

Yours faithfully,

${data.partyAName}
Signature: _________________

CC: Legal Representative (if applicable)`;
  }

  private generateAffidavit(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `AFFIDAVIT

I, ${data.partyAName}, of ${data.partyAAddress}, do solemnly and sincerely declare as follows:

1. I am the deponent in this affidavit.
2. I am of sound mind and capable of making this affidavit.
3. The facts stated herein are true to the best of my knowledge, information, and belief.

SUBJECT MATTER:
${data.subjectMatter}

DETAILED STATEMENT:
${this.generateAffidavitContent(data)}

I make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Oaths Act of ${jurisdiction}.

Sworn at: _________________
On this: ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()}

Before me:

Commissioner for Oaths/Notary Public
Name: _________________
Seal: _________________
Signature: _________________

Deponent:
Name: ${data.partyAName}
Signature: _________________`;
  }

  private generatePowerOfAttorney(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, ${data.partyAName}, of ${data.partyAAddress}, do hereby appoint and constitute ${data.partyBName}, of ${data.partyBAddress}, as my true and lawful attorney-in-fact (hereinafter referred to as "Attorney") to act in my name, place, and stead.

PURPOSE:
${data.subjectMatter}

POWERS GRANTED:
${this.generatePowerOfAttorneyPowers(data)}

SPECIFIC AUTHORITY:
The Attorney is hereby authorized to:
1. Execute and deliver any and all documents
2. Make any and all representations
3. Take any and all actions necessary or incidental to the purpose stated above
4. Bind me legally in all matters related to this power of attorney

LIMITATIONS:
${this.generatePowerOfAttorneyLimitations(data)}

DURATION:
This power of attorney shall remain in effect from ${data.startDate || date} until ${data.endDate || 'revoked by me in writing'}.

REVOCATION:
I reserve the right to revoke this power of attorney at any time by providing written notice to the Attorney.

GOVERNING LAW:
This power of attorney shall be governed by and construed in accordance with the laws of ${jurisdiction}.

IN WITNESS WHEREOF, I have hereunto set my hand and seal on this ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()}.

Principal:
Name: ${data.partyAName}
Signature: _________________
Seal: _________________

Witness:
Name: _________________
Signature: _________________

Notary Public:
Name: _________________
Seal: _________________
Date: _________________`;
  }

  private generateWill(data: DocumentTemplateData, language: string): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `LAST WILL AND TESTAMENT

I, ${data.partyAName}, of ${data.partyAAddress}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils by me made.

PURPOSE OF THIS WILL:
${data.subjectMatter}

PERSONAL INFORMATION:
- Full Name: ${data.partyAName}
- Address: ${data.partyAAddress}
- Date of Birth: ${data.dateOfBirth || 'N/A'}
- Nationality: ${data.nationality || jurisdiction}

MARITAL STATUS:
${data.maritalStatus || 'Single'}

EXECUTOR:
I appoint ${data.executorName || data.partyBName} as the Executor of this Will.

BENEFICIARIES AND BEQUESTS:
${this.generateWillBequests(data)}

SPECIFIC BEQUESTS:
${this.generateSpecificBequests(data)}

RESIDUARY CLAUSE:
I give, devise, and bequeath all the rest, residue, and remainder of my estate, both real and personal, to ${data.residuaryBeneficiary || data.partyBName}.

GUARDIANSHIP:
If I have minor children at the time of my death, I appoint ${data.guardianName || 'N/A'} as their guardian.

FUNERAL ARRANGEMENTS:
${data.funeralArrangements || 'I leave my funeral arrangements to the discretion of my Executor.'}

REVOCATION:
I hereby revoke all former wills and codicils made by me.

IN WITNESS WHEREOF, I have hereunto set my hand and seal on this ${date} day of ${new Date().getMonth() + 1}, ${new Date().getFullYear()}.

Testator:
Name: ${data.partyAName}
Signature: _________________

Witness 1:
Name: _________________
Signature: _________________
Address: _________________

Witness 2:
Name: _________________
Signature: _________________
Address: _________________

Notary Public:
Name: _________________
Seal: _________________
Date: _________________`;
  }

  private generateCustomDocument(
    data: DocumentTemplateData,
    language: string,
  ): string {
    const date = data.date || new Date().toLocaleDateString();
    const jurisdiction = data.jurisdiction || this.defaultJurisdiction;

    return `CUSTOM LEGAL DOCUMENT

${data.documentTitle || 'LEGAL DOCUMENT'}

This document is created on ${date} in ${jurisdiction}.

PARTIES:
${this.generateCustomDocumentParties(data)}

SUBJECT MATTER:
${data.subjectMatter}

DETAILED CONTENT:
${data.customContent || 'Custom content as specified by the client.'}

TERMS AND CONDITIONS:
${this.generateTermsAndConditions(data.terms)}

SPECIAL PROVISIONS:
${this.generateSpecialConditions(data.conditions)}

GOVERNING LAW:
This document shall be governed by and construed in accordance with the laws of ${jurisdiction}.

SIGNATURES:

${this.generateCustomDocumentSignatures(data)}

Date: ${date}
Place: ${data.place || jurisdiction}`;
  }

  private generateTermsAndConditions(terms?: string[]): string {
    if (!terms || terms.length === 0) {
      return `1. Both parties agree to fulfill their obligations as outlined in this agreement.
2. Any modifications must be made in writing and signed by both parties.
3. This agreement is binding upon the parties and their respective heirs, successors, and assigns.
4. If any provision of this agreement is found to be invalid, the remaining provisions shall remain in full force and effect.`;
    }

    return terms.map((term, index) => `${index + 1}. ${term}`).join('\n');
  }

  private generateSpecialConditions(conditions?: string[]): string {
    if (!conditions || conditions.length === 0) {
      return 'No special conditions apply.';
    }

    return conditions
      .map((condition, index) => `${index + 1}. ${condition}`)
      .join('\n');
  }

  private generateUtilityTerms(data: DocumentTemplateData): string {
    return `Utilities and services included in the rent: ${data.utilitiesIncluded || 'Basic utilities (water, electricity)'}
Additional services: ${data.additionalServices || 'None'}
Utility payment responsibility: ${data.utilityResponsibility || 'Tenant responsible for all utilities'}`;
  }

  private generateRentalConditions(data: DocumentTemplateData): string {
    return `1. No pets without written permission
2. No subletting without written permission
3. Maintain property in good condition
4. Pay rent on time
5. Comply with building rules and regulations`;
  }

  private generateScopeOfWork(data: DocumentTemplateData): string {
    return (
      data.scopeOfWork ||
      'The scope of work shall be as detailed in the project specifications and any subsequent amendments agreed upon by both parties.'
    );
  }

  private generatePaymentSchedule(data: DocumentTemplateData): string {
    return (
      data.paymentSchedule ||
      'Payment shall be made according to the following schedule:\n- 30% upon contract signing\n- 40% upon project commencement\n- 30% upon project completion'
    );
  }

  private generateLetterContent(data: DocumentTemplateData): string {
    return (
      data.letterContent ||
      `This letter is written to formally address the matter concerning ${data.subjectMatter}.

We have attempted to resolve this matter amicably but have been unsuccessful. We are therefore writing to formally notify you of our position and to request immediate action to resolve this matter.

We expect a response within the specified timeframe, failing which we will have no choice but to pursue all available legal remedies.`
    );
  }

  private generateAffidavitContent(data: DocumentTemplateData): string {
    return (
      data.affidavitContent ||
      `I hereby state that the information provided above is true and accurate to the best of my knowledge. I understand that making a false statement in this affidavit may constitute perjury and is punishable by law.`
    );
  }

  private generatePowerOfAttorneyPowers(data: DocumentTemplateData): string {
    return (
      data.powerOfAttorneyPowers ||
      `The Attorney shall have full power and authority to act on my behalf in all matters related to the purpose stated above, including but not limited to signing documents, making representations, and taking any necessary actions.`
    );
  }

  private generatePowerOfAttorneyLimitations(
    data: DocumentTemplateData,
  ): string {
    return (
      data.powerOfAttorneyLimitations ||
      `The Attorney shall not have the power to:\n1. Make gifts of my property\n2. Change my will\n3. Act beyond the scope of the purpose stated above`
    );
  }

  private generateWillBequests(data: DocumentTemplateData): string {
    return (
      data.willBequests ||
      `I give, devise, and bequeath my estate as follows:\n- Personal effects to my immediate family\n- Real property as specified in separate documentation\n- Financial assets to be distributed according to my Executor's discretion`
    );
  }

  private generateSpecificBequests(data: DocumentTemplateData): string {
    return (
      data.specificBequests ||
      `Specific bequests:\n- No specific bequests at this time`
    );
  }

  private generateCustomDocumentParties(data: DocumentTemplateData): string {
    if (data.partyAName && data.partyBName) {
      return `Party A: ${data.partyAName}
Address: ${data.partyAAddress}

Party B: ${data.partyBName}
Address: ${data.partyBAddress}`;
    }
    return `Client: ${data.partyAName || 'N/A'}
Address: ${data.partyAAddress || 'N/A'}`;
  }

  private generateCustomDocumentSignatures(data: DocumentTemplateData): string {
    if (data.partyAName && data.partyBName) {
      return `Party A: _________________
Name: ${data.partyAName}
Signature: _________________

Party B: _________________
Name: ${data.partyBName}
Signature: _________________

Witness: _________________
Name: _________________`;
    }
    return `Client: _________________
Name: ${data.partyAName || 'N/A'}
Signature: _________________

Witness: _________________
Name: _________________`;
  }

  private generateFileName(
    type: DocumentType,
    data: DocumentTemplateData,
  ): string {
    const timestamp = Date.now();
    const sanitizedTitle = (data.title || type).replace(/[^a-zA-Z0-9]/g, '_');
    return `${sanitizedTitle}_${timestamp}.docx`;
  }

  private createDocumentMetadata(
    type: DocumentType,
    data: DocumentTemplateData,
    language: string,
  ): Record<string, any> {
    return {
      documentType: type,
      language,
      jurisdiction: data.jurisdiction || this.defaultJurisdiction,
      generatedAt: new Date().toISOString(),
      templateVersion: '1.0',
      metadata: {
        partyCount: data.partyBName ? 2 : 1,
        hasFinancialTerms: !!data.amount,
        hasDuration: !!data.duration,
        customFields: Object.keys(data).filter(
          (key) => !['date', 'language', 'jurisdiction'].includes(key),
        ),
      },
    };
  }
}
