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
import { CaseEntity } from '../../cases/entities/case.entity';

export enum AppealStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum AppealType {
  ACCESS_RESTORATION = 'ACCESS_RESTORATION',
  CASE_REASSIGNMENT = 'CASE_REASSIGNMENT',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',
  OTHER = 'OTHER',
}

@Entity('appeals')
export class Appeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  appellantId: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'varchar', length: 50 })
  type: AppealType;

  @Column({ type: 'varchar', length: 50, default: AppealStatus.PENDING })
  status: AppealStatus;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  evidence: string | null;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'text', nullable: true })
  decision: string;

  @Column({ type: 'datetime', nullable: true })
  decisionDate: Date;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appellantId' })
  appellant: User;

  @ManyToOne(() => CaseEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  caseEntity: CaseEntity;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedBy' })
  reviewer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
