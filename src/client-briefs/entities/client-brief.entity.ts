import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaseEntity } from '../../cases/entities/case.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';

export enum BriefStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ASSIGNED = 'ASSIGNED',
  EXPIRED = 'EXPIRED',
}

export enum BriefPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('client_briefs')
export class ClientBrief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  legalProblem: string;

  @Column({ type: 'text', nullable: true })
  desiredOutcome: string;

  @Column({ type: 'varchar', length: 50, default: BriefStatus.DRAFT })
  status: BriefStatus;

  @Column({ type: 'varchar', length: 50, default: BriefPriority.MEDIUM })
  priority: BriefPriority;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string; // City/State for location-based matching

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetRangeMin: number; // Minimum budget in NGN

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetRangeMax: number; // Maximum budget in NGN

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string; // Client's preferred language

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  closedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  assignedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedLawyerId: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string; // For admin use

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'boolean', default: false })
  requiresMediation: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => CaseEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  caseEntity: CaseEntity;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedLawyerId' })
  assignedLawyer: User;

  @OneToMany(() => Proposal, (proposal) => proposal.clientBrief)
  proposals: Proposal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
