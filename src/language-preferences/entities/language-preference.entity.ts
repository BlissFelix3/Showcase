import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LanguageCode {
  EN = 'en', // English
  HA = 'ha', // Hausa
  YO = 'yo', // Yoruba
  IG = 'ig', // Igbo
  FR = 'fr', // French
  AR = 'ar', // Arabic
  ZH = 'zh', // Chinese
  ES = 'es', // Spanish
}

export enum LanguageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Entity('language_preferences')
export class LanguagePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  primaryLanguage: LanguageCode;

  @Column('simple-array', { default: [] })
  secondaryLanguages: LanguageCode[];

  @Column({ type: 'varchar', length: 50, default: LanguageStatus.ACTIVE })
  status: LanguageStatus;

  @Column({ type: 'boolean', default: true })
  receiveNotificationsInPrimary: boolean;

  @Column({ type: 'boolean', default: false })
  receiveNotificationsInSecondary: boolean;

  @Column({ type: 'text', nullable: true })
  customTranslations: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @Column({ type: 'boolean', default: false })
  autoTranslate: boolean;

  @Column({ type: 'varchar', length: 50, default: 'en' })
  interfaceLanguage: LanguageCode;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
