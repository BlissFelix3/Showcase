import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaseEntity } from '../../cases/entities/case.entity';

export enum JurisdictionType {
  COUNTRY = 'COUNTRY',
  STATE = 'STATE',
  CITY = 'CITY',
  LOCAL_GOVERNMENT = 'LOCAL_GOVERNMENT',
  DISTRICT = 'DISTRICT',
}

export enum JurisdictionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Entity('jurisdictions')
export class Jurisdiction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string; // e.g., 'NG', 'LAG', 'ABJ'

  @Column({ type: 'varchar', length: 50 })
  type: JurisdictionType;

  @Column({ type: 'varchar', length: 50, default: JurisdictionStatus.ACTIVE })
  status: JurisdictionStatus;

  @Column({ type: 'uuid', nullable: true })
  parentId: string; // For hierarchical structure (e.g., City belongs to State)

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 0 })
  lawyerCount: number; // Number of lawyers in this jurisdiction

  @Column({ type: 'int', default: 0 })
  caseCount: number; // Number of cases in this jurisdiction

  @Column({ type: 'json', nullable: true })
  legalSystem: any; // Legal system specific to this jurisdiction

  @Column({ type: 'json', nullable: true })
  courtStructure: any; // Court structure and hierarchy

  @OneToMany(() => User, (user) => user.jurisdiction)
  users: User[];

  @OneToMany(() => CaseEntity, (caseEntity) => caseEntity.jurisdiction)
  cases: CaseEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
