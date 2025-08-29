import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LawyerProfile } from '../../users/entities/lawyer-profile.entity';

export enum PracticeAreaCategory {
  CIVIL_LITIGATION = 'CIVIL_LITIGATION',
  CRIMINAL_LAW = 'CRIMINAL_LAW',
  CORPORATE_LAW = 'CORPORATE_LAW',
  FAMILY_LAW = 'FAMILY_LAW',
  PROPERTY_LAW = 'PROPERTY_LAW',
  LABOR_LAW = 'LABOR_LAW',
  TAX_LAW = 'TAX_LAW',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  ENVIRONMENTAL_LAW = 'ENVIRONMENTAL_LAW',
  INTERNATIONAL_LAW = 'INTERNATIONAL_LAW',
  OTHER = 'OTHER',
}

@Entity('practice_areas')
export class PracticeArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: PracticeAreaCategory;

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  lawyerCount: number;

  @ManyToMany(() => LawyerProfile)
  @JoinTable({
    name: 'lawyer_practice_areas',
    joinColumn: { name: 'practiceAreaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'lawyerProfileId', referencedColumnName: 'id' },
  })
  lawyers: LawyerProfile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
