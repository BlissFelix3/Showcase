import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LawyerProfileRepository } from './repositories/lawyer-profile.repository';
import { VerificationDocumentRepository } from './repositories/verification-document.repository';
import { LawyerReviewRepository } from './repositories/lawyer-review.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeAreaRepository } from '../practice-areas/repositories/practice-area.repository';
import { PracticeArea } from '../practice-areas/entities/practice-area.entity';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { VerifyLawyerDto, VerificationAction } from './dto/verify-lawyer.dto';
import {
  DocumentType,
  DocumentStatus,
} from './entities/verification-document.entity';
import { LocalEvents } from '../utils/constants';
import { FileUploadService, UploadedFile } from './file-upload.service';

@Injectable()
export class LawyerProfileService {
  private readonly logger = new Logger(LawyerProfileService.name);

  constructor(
    private readonly lawyerProfileRepository: LawyerProfileRepository,
    private readonly verificationDocumentRepository: VerificationDocumentRepository,
    private readonly lawyerReviewRepository: LawyerReviewRepository,
    @InjectRepository(PracticeArea)
    private readonly practiceAreaRepository: PracticeAreaRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getLawyerProfile(lawyerId: string) {
    const profile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
      relations: [
        'user',
        'practiceAreaEntities',
        'reviews',
        'verificationDocuments',
        'jurisdiction',
      ],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    return profile;
  }

  async getPublicLawyerProfile(lawyerId: string) {
    const profile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
      relations: ['user', 'practiceAreaEntities', 'reviews', 'jurisdiction'],
    });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    if (profile.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Lawyer profile not yet verified');
    }

    const publicProfile = {
      ...profile,
      verificationDocuments: undefined,
      verificationNotes: undefined,
      verifiedBy: undefined,
    };

    return publicProfile;
  }

  async updateLawyerProfile(
    lawyerId: string,
    updateData: UpdateLawyerProfileDto,
  ) {
    const profile = await this.getLawyerProfile(lawyerId);

    if (updateData.fullName) profile.fullName = updateData.fullName;
    if (updateData.phone) profile.phone = updateData.phone;
    if (updateData.linkedinUrl) profile.linkedinUrl = updateData.linkedinUrl;
    if (updateData.twitterUrl) profile.twitterUrl = updateData.twitterUrl;
    if (updateData.bio) profile.bio = updateData.bio;
    if (updateData.experience) profile.experience = updateData.experience;
    if (updateData.yearsOfExperience !== undefined) {
      profile.yearsOfExperience = updateData.yearsOfExperience;
    }
    if (updateData.education) profile.education = updateData.education;
    if (updateData.specializations)
      profile.specializations = updateData.specializations;
    if (updateData.languages) profile.languages = updateData.languages;
    if (updateData.isAvailable !== undefined)
      profile.isAvailable = updateData.isAvailable;
    if (updateData.availabilityNotes)
      profile.availabilityNotes = updateData.availabilityNotes;
    if (updateData.hourlyRate !== undefined)
      profile.hourlyRate = updateData.hourlyRate;
    if (updateData.feeStructure) profile.feeStructure = updateData.feeStructure;
    if (updateData.latitude !== undefined)
      profile.latitude = updateData.latitude;
    if (updateData.longitude !== undefined)
      profile.longitude = updateData.longitude;

    if (updateData.practiceAreas) {
      const practiceAreaIds = updateData.practiceAreas.map((pa) => pa.id);

      const validation = await this.validatePracticeAreaAssignment(
        lawyerId,
        practiceAreaIds,
      );

      if (!validation.isValid) {
        throw new BadRequestException(
          `Practice area assignment validation failed: ${validation.errors.join(', ')}`,
        );
      }

      if (validation.warnings.length > 0) {
        this.logger.warn(
          `Practice area assignment warnings for lawyer ${lawyerId}: ${validation.warnings.join(', ')}`,
        );
      }

      await this.assignPracticeAreasToLawyer(lawyerId, practiceAreaIds);
    }

    const updatedProfile = await this.lawyerProfileRepository.save(profile);

    this.logger.log(`Lawyer profile updated: ${lawyerId}`);
    return updatedProfile;
  }

  async uploadVerificationDocument(
    lawyerId: string,
    uploadData: UploadDocumentDto,
    file: UploadedFile,
  ) {
    const profile = await this.getLawyerProfile(lawyerId);

    const existingDoc = await this.verificationDocumentRepository.findOne({
      where: {
        lawyerProfile: { id: lawyerId },
        documentType: uploadData.documentType,
        status: DocumentStatus.APPROVED,
      },
    });

    if (existingDoc && uploadData.isPrimary) {
      throw new BadRequestException(
        `Document type ${uploadData.documentType} already has an approved version`,
      );
    }

    const fileMetadata = await this.fileUploadService.processUploadedFile(file);

    const document = this.verificationDocumentRepository.create({
      lawyerProfile: profile,
      documentType: uploadData.documentType,
      fileName: fileMetadata.fileName,
      fileUrl: fileMetadata.fileUrl,
      originalFileName:
        uploadData.originalFileName || fileMetadata.originalName,
      mimeType: fileMetadata.mimeType,
      fileSize: fileMetadata.fileSize,
      documentNumber: uploadData.documentNumber,
      issueDate: uploadData.issueDate ? new Date(uploadData.issueDate) : null,
      expiryDate: uploadData.expiryDate
        ? new Date(uploadData.expiryDate)
        : null,
      issuingAuthority: uploadData.issuingAuthority,
      isPrimary: uploadData.isPrimary || false,
      metadata: uploadData.metadata,
    });

    const savedDocument =
      await this.verificationDocumentRepository.save(document);

    if (profile.verificationStatus !== 'PENDING') {
      profile.verificationStatus = 'PENDING';
      await this.lawyerProfileRepository.save(profile);
    }

    this.logger.log(`Verification document uploaded: ${savedDocument.id}`);

    this.eventEmitter.emit(LocalEvents.VERIFICATION_DOCUMENT_UPLOADED, {
      lawyerId,
      documentId: savedDocument.id,
      documentType: uploadData.documentType,
    });

    return savedDocument;
  }

  async getVerificationDocuments(lawyerId: string) {
    const documents = await this.verificationDocumentRepository.find({
      where: { lawyerProfile: { id: lawyerId } },
      order: { createdAt: 'DESC' },
    });

    return documents;
  }

  async createReview(
    clientId: string,
    lawyerId: string,
    reviewData: CreateReviewDto,
  ) {
    const profile = await this.getLawyerProfile(lawyerId);

    const existingReview = await this.lawyerReviewRepository.findOne({
      where: {
        client: { id: clientId },
        lawyerProfile: { id: lawyerId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this lawyer');
    }

    const review = this.lawyerReviewRepository.create({
      client: { id: clientId },
      lawyerProfile: profile,
      rating: reviewData.rating,
      comment: reviewData.comment,
      caseType: reviewData.caseType,
      caseOutcome: reviewData.caseOutcome,
      isAnonymous: reviewData.isAnonymous || false,
    });

    const savedReview = await this.lawyerReviewRepository.save(review);

    await this.updateLawyerRating(lawyerId);

    this.logger.log(
      `Review created for lawyer ${lawyerId} by client ${clientId}`,
    );

    this.eventEmitter.emit(LocalEvents.LAWYER_REVIEW_CREATED, {
      lawyerId,
      clientId,
      reviewId: savedReview.id,
      rating: reviewData.rating,
    });

    return savedReview;
  }

  async getLawyerReviews(lawyerId: string, page = 1, limit = 10) {
    const [reviews, total] = await this.lawyerReviewRepository.findAndCount({
      where: {
        lawyerProfile: { id: lawyerId },
        isVisible: true,
      },
      relations: ['client'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateLawyerRating(lawyerId: string) {
    const reviews = await this.lawyerReviewRepository.find({
      where: {
        lawyerProfile: { id: lawyerId },
        isVisible: true,
      },
      select: ['rating'],
    });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.lawyerProfileRepository.update(lawyerId, {
      ratingAverage: averageRating,
    });
  }

  async verifyLawyer(
    lawyerId: string,
    adminId: string,
    verificationData: VerifyLawyerDto,
  ) {
    const profile = await this.getLawyerProfile(lawyerId);

    if (verificationData.action === VerificationAction.APPROVE) {
      const requiredDocuments = [
        DocumentType.CALL_TO_BAR_CERTIFICATE,
        DocumentType.NATIONAL_ID,
      ];

      const approvedDocuments = await this.verificationDocumentRepository.find({
        where: {
          lawyerProfile: { id: lawyerId },
          status: DocumentStatus.APPROVED,
        },
      });

      const hasRequiredDocs = requiredDocuments.every((docType) =>
        approvedDocuments.some((doc) => doc.documentType === docType),
      );

      if (!hasRequiredDocs) {
        throw new BadRequestException(
          'Cannot approve lawyer without required verification documents',
        );
      }

      profile.verificationStatus = 'APPROVED';
      profile.verifiedAt = new Date();
      profile.verifiedBy = adminId;
      profile.verificationNotes = verificationData.verificationNotes || null;
    } else if (verificationData.action === VerificationAction.REJECT) {
      profile.verificationStatus = 'REJECTED';
      profile.verificationNotes = verificationData.verificationNotes || null;
    } else if (
      verificationData.action === VerificationAction.REQUEST_MORE_INFO
    ) {
      profile.verificationStatus = 'PENDING';
      profile.verificationNotes = verificationData.verificationNotes || null;
    }

    const updatedProfile = await this.lawyerProfileRepository.save(profile);

    this.logger.log(
      `Lawyer ${lawyerId} verification status updated to ${verificationData.action} by admin ${adminId}`,
    );

    this.eventEmitter.emit(LocalEvents.LAWYER_VERIFICATION_STATUS_CHANGED, {
      lawyerId,
      status: verificationData.action,
      adminId,
      notes: verificationData.verificationNotes,
    });

    return updatedProfile;
  }

  async getLawyersForMatching(
    jurisdiction: string,
    practiceArea: string,
    clientLocation?: { latitude: number; longitude: number },
    limit = 10,
  ) {
    let query = this.lawyerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.practiceAreaEntities', 'practiceAreas')
      .leftJoinAndSelect('profile.jurisdiction', 'jurisdiction')
      .where('profile.verificationStatus = :status', { status: 'APPROVED' })
      .andWhere('profile.isAvailable = :available', { available: true })
      .andWhere('jurisdiction.name = :jurisdiction', { jurisdiction })
      .andWhere('practiceAreas.name = :practiceArea', { practiceArea })
      .orderBy('profile.ratingAverage', 'DESC')
      .addOrderBy('profile.yearsOfExperience', 'DESC')
      .limit(limit);

    if (clientLocation) {
      query = query.addSelect(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(profile.latitude)) *
            cos(radians(profile.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(profile.latitude))
          )
        )`,
        'distance',
      );
      query = query.setParameter('lat', clientLocation.latitude);
      query = query.setParameter('lng', clientLocation.longitude);
      query = query.addOrderBy('distance', 'ASC');
    }

    const lawyers = await query.getMany();
    return lawyers;
  }

  async getVerificationQueue(page = 1, limit = 20) {
    const [profiles, total] = await this.lawyerProfileRepository.findAndCount({
      where: { verificationStatus: 'PENDING' },
      relations: ['user', 'verificationDocuments', 'jurisdiction'],
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

  async getLawyerStats(lawyerId: string) {
    const profile = await this.getLawyerProfile(lawyerId);

    const [totalReviews, totalDocuments] = await Promise.all([
      this.lawyerReviewRepository.count({
        where: { lawyerProfile: { id: lawyerId }, isVisible: true },
      }),
      this.verificationDocumentRepository.count({
        where: { lawyerProfile: { id: lawyerId } },
      }),
    ]);

    const reviewStats = await this.lawyerReviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.lawyerProfile.id = :lawyerId', { lawyerId })
      .andWhere('review.isVisible = :visible', { visible: true })
      .groupBy('review.rating')
      .getRawMany();

    return {
      profile,
      stats: {
        totalReviews,
        totalDocuments,
        ratingDistribution: reviewStats,
        successRate:
          profile.totalCases > 0
            ? (profile.successfulCases / profile.totalCases) * 100
            : 0,
      },
    };
  }

  async getLawyerPracticeAreas(lawyerId: string): Promise<PracticeArea[]> {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    return lawyerProfile.practiceAreaEntities || [];
  }

  async assignPracticeAreasToLawyer(
    lawyerId: string,
    practiceAreaIds: string[],
  ) {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    const practiceAreas =
      await this.practiceAreaRepository.findByIds(practiceAreaIds);

    if (practiceAreas.length !== practiceAreaIds.length) {
      const foundIds = practiceAreas.map((pa) => pa.id);
      const missingIds = practiceAreaIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Practice areas not found: ${missingIds.join(', ')}`,
      );
    }

    lawyerProfile.practiceAreaEntities = practiceAreas;
    lawyerProfile.practiceAreas = practiceAreaIds;

    const updatedProfile =
      await this.lawyerProfileRepository.save(lawyerProfile);

    this.logger.log(
      `Practice areas assigned to lawyer ${lawyerId}: ${practiceAreaIds.join(', ')}`,
    );

    this.eventEmitter.emit(LocalEvents.LAWYER_PRACTICE_AREAS_UPDATED, {
      lawyerId,
      practiceAreaIds,
      previousPracticeAreas:
        lawyerProfile.practiceAreaEntities?.map((pa) => pa.id) || [],
    });

    return updatedProfile;
  }

  async removePracticeAreaFromLawyer(lawyerId: string, practiceAreaId: string) {
    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
      relations: ['practiceAreaEntities'],
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id: practiceAreaId },
    });

    if (!practiceArea) {
      throw new NotFoundException('Practice area not found');
    }

    lawyerProfile.practiceAreaEntities =
      lawyerProfile.practiceAreaEntities?.filter(
        (pa) => pa.id !== practiceAreaId,
      ) || [];
    lawyerProfile.practiceAreas =
      lawyerProfile.practiceAreas?.filter((id) => id !== practiceAreaId) || [];

    const updatedProfile =
      await this.lawyerProfileRepository.save(lawyerProfile);

    this.logger.log(
      `Practice area ${practiceAreaId} removed from lawyer ${lawyerId}`,
    );

    this.eventEmitter.emit(LocalEvents.LAWYER_PRACTICE_AREAS_UPDATED, {
      lawyerId,
      practiceAreaIds:
        updatedProfile.practiceAreaEntities?.map((pa) => pa.id) || [],
      removedPracticeAreaId: practiceAreaId,
    });

    return updatedProfile;
  }

  async validatePracticeAreaAssignment(
    lawyerId: string,
    practiceAreaIds: string[],
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyerProfile) {
      errors.push('Lawyer profile not found');
      return { isValid: false, errors, warnings };
    }

    const practiceAreas =
      await this.practiceAreaRepository.findByIds(practiceAreaIds);

    if (practiceAreas.length !== practiceAreaIds.length) {
      const foundIds = practiceAreas.map((pa) => pa.id);
      const missingIds = practiceAreaIds.filter((id) => !foundIds.includes(id));
      errors.push(`Practice areas not found: ${missingIds.join(', ')}`);
    }

    const inactiveAreas = practiceAreas.filter((pa) => !pa.isActive);
    if (inactiveAreas.length > 0) {
      warnings.push(
        `Inactive practice areas: ${inactiveAreas.map((pa) => pa.name).join(', ')}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
