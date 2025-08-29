import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LawyerProfileRepository } from '../users/repositories/lawyer-profile.repository';
import { VerificationDocumentRepository } from '../users/repositories/verification-document.repository';

import {
  DocumentType,
  DocumentStatus,
} from '../users/entities/verification-document.entity';
import { LocalEvents } from '../utils/constants';

export interface VerificationResult {
  success: boolean;
  message: string;
  verificationStatus: string;
  nextSteps?: string[];
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly lawyerRepo: LawyerProfileRepository,
    private readonly verificationDocumentRepo: VerificationDocumentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submitDocuments(
    lawyerUserId: string,
    payload: {
      callToBarCertificateUrl: string;
      nationalIdNumber: string;
      additionalDocuments?: Array<{
        type: string;
        url: string;
        description: string;
      }>;
    },
  ) {
    const profile = await this.lawyerRepo.findOne({
      where: { user: { id: lawyerUserId } },
      relations: ['user', 'verificationDocuments'],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    if (!this.isValidUrl(payload.callToBarCertificateUrl)) {
      throw new BadRequestException('Invalid call to bar certificate URL');
    }

    profile.callToBarCertificateUrl = payload.callToBarCertificateUrl;
    profile.nationalIdNumber = payload.nationalIdNumber;
    profile.verificationStatus = 'PENDING';

    const verificationDocuments = [
      {
        documentType: DocumentType.CALL_TO_BAR_CERTIFICATE,
        fileName: 'call_to_bar_certificate',
        fileUrl: payload.callToBarCertificateUrl,
        status: DocumentStatus.PENDING,
        lawyerProfile: profile,
        isPrimary: true,
      } as any,
      {
        documentType: DocumentType.NATIONAL_ID,
        fileName: 'national_id',
        fileUrl: payload.nationalIdNumber,
        status: DocumentStatus.PENDING,
        lawyerProfile: profile,
        isPrimary: true,
      } as any,
    ];

    if (payload.additionalDocuments) {
      payload.additionalDocuments.forEach((doc) => {
        verificationDocuments.push({
          documentType: doc.type as DocumentType,
          fileName: doc.type.toLowerCase().replace(/_/g, '_'),
          fileUrl: doc.url,
          status: DocumentStatus.PENDING,
          lawyerProfile: profile,
          isPrimary: false,
          metadata: JSON.stringify({ description: doc.description }),
        } as any);
      });
    }

    await this.verificationDocumentRepo.save(verificationDocuments);

    const savedProfile = await this.lawyerRepo.save(profile);

    this.eventEmitter.emit(LocalEvents.VERIFICATION_DOCUMENT_UPLOADED, {
      lawyerId: profile.id,
      lawyerName: profile.fullName,
      lawyerEmail: profile.user.email,
      documentCount: verificationDocuments.length,
      submittedAt: new Date().toISOString(),
    });

    this.logger.log(
      `Verification documents submitted for lawyer ${lawyerUserId}`,
    );
    return savedProfile;
  }

  async review(
    lawyerProfileId: string,
    approve: boolean,
    adminId: string,
    reviewNotes?: string,
    requiredActions?: string[],
  ): Promise<VerificationResult> {
    const profile = await this.lawyerRepo.findOne({
      where: { id: lawyerProfileId },
      relations: ['user', 'verificationDocuments'],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    if (
      profile.verificationStatus === 'APPROVED' ||
      profile.verificationStatus === 'REJECTED'
    ) {
      throw new BadRequestException('Profile has already been reviewed');
    }

    profile.verificationStatus = approve ? 'APPROVED' : 'REJECTED';
    profile.verifiedBy = adminId;
    profile.verifiedAt = new Date();
    profile.verificationNotes = reviewNotes || null;

    if (approve) {
      await this.verificationDocumentRepo.update(
        { lawyerProfile: { id: lawyerProfileId } },
        { status: DocumentStatus.APPROVED },
      );

      this.eventEmitter.emit(LocalEvents.USER_VERIFICATION_SUCCESSFUL, {
        email: profile.user.email,
        userData: {
          fullName: profile.fullName,
          lawyerId: profile.user.id,
          verificationDate: new Date().toISOString(),
          verifiedBy: adminId,
        },
      });

      this.logger.log(
        `Lawyer ${lawyerProfileId} verification approved by admin ${adminId}`,
      );
    } else {
      // Mark verification documents as rejected
      await this.verificationDocumentRepo.update(
        { lawyerProfile: { id: lawyerProfileId } },
        { status: DocumentStatus.REJECTED },
      );

      this.eventEmitter.emit(LocalEvents.USER_VERIFICATION_REJECTED, {
        email: profile.user.email,
        userData: {
          fullName: profile.fullName,
          lawyerId: profile.user.id,
          rejectionReason: reviewNotes,
          requiredActions: requiredActions,
          rejectedAt: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Lawyer ${lawyerProfileId} verification rejected by admin ${adminId}`,
      );
    }

    const savedProfile = await this.lawyerRepo.save(profile);

    return {
      success: true,
      message: approve
        ? 'Verification approved successfully'
        : 'Verification rejected',
      verificationStatus: savedProfile.verificationStatus,
      nextSteps: approve
        ? [
            'Lawyer can now accept cases',
            'Profile is visible to clients',
            'Verification is now active',
          ]
        : [
            'Review rejection feedback',
            'Address required actions',
            'Resubmit verification documents',
          ],
    };
  }

  async requestAdditionalDocuments(
    lawyerProfileId: string,
    adminId: string,
    requiredDocuments: Array<{
      type: string;
      description: string;
      deadline?: Date;
    }>,
    notes?: string,
  ) {
    const profile = await this.lawyerRepo.findOne({
      where: { id: lawyerProfileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    profile.verificationStatus = 'PENDING';
    profile.verificationNotes = notes || null;

    const savedProfile = await this.lawyerRepo.save(profile);

    this.eventEmitter.emit(LocalEvents.VERIFICATION_DOCUMENT_UPLOADED, {
      lawyerId: profile.id,
      lawyerName: profile.fullName,
      lawyerEmail: profile.user.email,
      requiredDocuments,
      notes,
      deadline: requiredDocuments[0]?.deadline?.toISOString(),
      requestedAt: new Date().toISOString(),
    });

    this.logger.log(
      `Additional documents requested for lawyer ${lawyerProfileId} by admin ${adminId}`,
    );
    return savedProfile;
  }

  async getVerificationQueue(page = 1, limit = 20) {
    const [profiles, total] = await this.lawyerRepo.findAndCount({
      where: { verificationStatus: 'PENDING' },
      relations: ['user', 'verificationDocuments'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVerificationStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.lawyerRepo.count({ where: { verificationStatus: 'PENDING' } }),
      this.lawyerRepo.count({ where: { verificationStatus: 'APPROVED' } }),
      this.lawyerRepo.count({ where: { verificationStatus: 'REJECTED' } }),
    ]);

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }

  async validateVerificationDocuments(lawyerProfileId: string) {
    const profile = await this.lawyerRepo.findOne({
      where: { id: lawyerProfileId },
      relations: ['verificationDocuments'],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    const validationResults = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      documentStatus: {} as Record<string, any>,
    };

    const requiredDocuments = [
      DocumentType.CALL_TO_BAR_CERTIFICATE,
      DocumentType.NATIONAL_ID,
    ];
    const submittedDocuments =
      profile.verificationDocuments?.map((doc) => doc.documentType) || [];

    for (const requiredDoc of requiredDocuments) {
      if (!submittedDocuments.includes(requiredDoc)) {
        validationResults.isValid = false;
        validationResults.errors.push(
          `Missing required document: ${requiredDoc}`,
        );
      }
    }

    if (profile.verificationDocuments) {
      for (const doc of profile.verificationDocuments) {
        validationResults.documentStatus[doc.documentType] = {
          status: doc.status,
          url: doc.fileUrl,
          submittedAt: doc.createdAt,
        };

        if (!this.isValidUrl(doc.fileUrl)) {
          validationResults.isValid = false;
          validationResults.errors.push(
            `Invalid URL for document: ${doc.documentType}`,
          );
        }

        if (doc.status === DocumentStatus.REJECTED) {
          validationResults.warnings.push(
            `Document ${doc.documentType} was previously rejected`,
          );
        }
      }
    }

    return validationResults;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
