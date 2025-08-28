import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaseEntity } from '../../cases/entities/case.entity';

export type ComplaintStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED';
export type ComplaintType =
  | 'NON_COMPLETION'
  | 'POOR_EXECUTION'
  | 'COMMUNICATION'
  | 'PAYMENT'
  | 'OTHER';
export type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

@Entity({ name: 'complaints' })
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  complainant!: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  respondent!: User;

  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'SET NULL' })
  caseEntity?: CaseEntity | null;

  @Column({ type: 'text' })
  type!: ComplaintType;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', default: 'PENDING' })
  status!: ComplaintStatus;

  @Column({ type: 'text', default: 'MEDIUM' })
  severity!: ComplaintSeverity;

  @Column({ type: 'text', nullable: true })
  adminNotes!: string | null;

  @Column({ type: 'text', nullable: true })
  resolution!: string | null;

  @Column({ type: 'text', nullable: true })
  mediatorId!: string | null;

  @Column({ type: 'date', nullable: true })
  resolutionDate!: Date | null;

  @Column({ type: 'json', nullable: true })
  evidence!: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
