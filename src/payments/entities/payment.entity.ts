import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CaseEntity } from '../../cases/entities/case.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';

export type PaymentStatus =
  | 'HELD_IN_ESCROW'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED'
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  caseEntity?: CaseEntity | null;

  @Column({ type: 'text' })
  purpose!: string;

  @Column({ type: 'integer' })
  amountMinor!: number;

  @Column({ type: 'text', default: 'HELD_IN_ESCROW' })
  status!: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  provider!: 'PAYSTACK' | 'ESCROW' | 'OTHER' | null;

  @Column({ type: 'text', nullable: true })
  providerRef!: string | null;

  @Column({ type: 'text', nullable: true })
  escrowId!: string | null;

  @ManyToOne(() => Milestone, { nullable: true, onDelete: 'SET NULL' })
  milestone?: Milestone | null;

  @CreateDateColumn()
  createdAt!: Date;
}
