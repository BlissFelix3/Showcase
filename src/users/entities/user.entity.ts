import {
  Column,
  Entity,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LawyerProfile } from './lawyer-profile.entity';
import { ClientProfile } from './client-profile.entity';
import { Jurisdiction } from '../../jurisdictions/entities/jurisdiction.entity';
import { LanguagePreference } from '../../language-preferences/entities/language-preference.entity';
import { DeviceToken } from '../../notifications/entities/device-token.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export type UserRole = 'LAWYER' | 'CLIENT' | 'ADMIN';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'text', default: 'CLIENT' })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ default: false })
  isPhoneVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  jurisdictionId: string;

  @OneToOne(() => LawyerProfile, (p) => p.user)
  lawyerProfile?: LawyerProfile;

  @OneToOne(() => ClientProfile, (p) => p.user)
  clientProfile?: ClientProfile;

  @ManyToOne(() => Jurisdiction, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'jurisdictionId' })
  jurisdiction?: Jurisdiction;

  @OneToOne(() => LanguagePreference, (lp) => lp.user)
  languagePreference?: LanguagePreference;

  @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user)
  deviceTokens?: DeviceToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications?: Notification[];
}
