import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LawyerProfileRepository } from '../users/repositories/lawyer-profile.repository';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class VerificationService {
  constructor(
    private readonly lawyerRepo: LawyerProfileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submitDocuments(
    lawyerUserId: string,
    payload: { callToBarCertificateUrl: string; nationalIdNumber: string },
  ) {
    const profile = await this.lawyerRepo.findOne({
      where: { user: { id: lawyerUserId } },
    });
    if (!profile) throw new NotFoundException('Lawyer profile not found');
    profile.callToBarCertificateUrl = payload.callToBarCertificateUrl;
    profile.nationalIdNumber = payload.nationalIdNumber;
    profile.verificationStatus = 'PENDING';
    return this.lawyerRepo.save(profile);
  }

  async review(lawyerProfileId: string, approve: boolean) {
    const profile = await this.lawyerRepo.findOne({
      where: { id: lawyerProfileId },
    });
    if (!profile) throw new NotFoundException('Lawyer profile not found');
    profile.verificationStatus = approve ? 'APPROVED' : 'REJECTED';
    const savedProfile = await this.lawyerRepo.save(profile);

    if (approve) {
      this.eventEmitter.emit(LocalEvents.LAWYER_PROFILE_VERIFIED, {
        userId: profile.user.id,
        slug: 'lawyer-profile-verified',
        profileData: {
          fullName: profile.fullName,
          verificationStatus: 'APPROVED',
        },
      });
    } else {
      this.eventEmitter.emit(LocalEvents.USER_VERIFICATION_REJECTED, {
        userId: profile.user.id,
        slug: 'verification-rejected',
        profileData: {
          fullName: profile.fullName,
          verificationStatus: 'REJECTED',
        },
      });
    }

    return savedProfile;
  }
}
