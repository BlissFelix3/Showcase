import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { LawyerProfileRepository } from './repositories/lawyer-profile.repository';
import { ClientProfileRepository } from './repositories/client-profile.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly lawyerRepo: LawyerProfileRepository,
    private readonly clientRepo: ClientProfileRepository,
  ) {}

  async createUserWithProfile(userData: {
    email: string;
    passwordHash: string;
    role: 'LAWYER' | 'CLIENT';
    fullName: string;
    phone?: string;
  }): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    // Create user
    const user = this.userRepository.create({
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role,
    });
    await this.userRepository.save(user);

    // Create profile based on role
    if (userData.role === 'LAWYER') {
      const lawyer = this.lawyerRepo.create({
        user,
        fullName: userData.fullName,
        phone: userData.phone ?? null,
      });
      await this.lawyerRepo.save(lawyer);
    } else {
      const client = this.clientRepo.create({
        user,
        fullName: userData.fullName,
        phone: userData.phone ?? null,
      });
      await this.clientRepo.save(client);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['lawyerProfile', 'clientProfile'],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.lawyerProfile', 'lawyerProfile')
      .leftJoinAndSelect('user.clientProfile', 'clientProfile')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['lawyerProfile', 'clientProfile'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    user.passwordHash = newPasswordHash;
    await this.userRepository.save(user);
  }

  async findByPhone(phone: string): Promise<User | null> {
    // Search in both lawyer and client profiles
    const lawyerProfile = await this.lawyerRepo.findOne({
      where: { phone },
      relations: ['user'],
    });

    if (lawyerProfile) {
      return lawyerProfile.user;
    }

    const clientProfile = await this.clientRepo.findOne({
      where: { phone },
      relations: ['user'],
    });

    if (clientProfile) {
      return clientProfile.user;
    }

    return null;
  }

  async markEmailVerified(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);

    // Update user with email verification status
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async markPhoneVerified(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);

    // Update user with phone verification status
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async getUserWithProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'lawyerProfile',
        'clientProfile',
        'jurisdiction',
        'languagePreference',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, profileData: any): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    if (user.role === 'LAWYER' && user.lawyerProfile) {
      Object.assign(user.lawyerProfile, profileData);
      await this.lawyerRepo.save(user.lawyerProfile);
    } else if (user.role === 'CLIENT' && user.clientProfile) {
      Object.assign(user.clientProfile, profileData);
      await this.clientRepo.save(user.clientProfile);
    }

    return this.getUserWithProfile(userId);
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async reactivateUser(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    user.isActive = true;
    await this.userRepository.save(user);
  }
}
