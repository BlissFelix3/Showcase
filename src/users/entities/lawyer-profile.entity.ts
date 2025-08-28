import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PracticeArea } from '../../practice-areas/entities/practice-area.entity';

@Entity({ name: 'lawyer_profiles' })
export class LawyerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (u) => u.lawyerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  linkedinUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  twitterUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  callToBarCertificateUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  nationalIdNumber!: string | null;

  @Column('simple-array', { nullable: true })
  practiceAreas!: string[] | null; // Keep for backward compatibility

  @ManyToMany(() => PracticeArea)
  @JoinTable({
    name: 'lawyer_practice_areas',
    joinColumn: { name: 'lawyerProfileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'practiceAreaId', referencedColumnName: 'id' },
  })
  practiceAreaEntities?: PracticeArea[];

  @Column({ type: 'float', default: 0 })
  ratingAverage!: number;

  @Column({ type: 'text', default: 'PENDING' })
  verificationStatus!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number | null;
}
