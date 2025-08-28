import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CaseEntity } from '../../cases/entities/case.entity';
import { Payment } from '../../payments/entities/payment.entity';

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'FUNDED'
  | 'CANCELLED';

@Entity({ name: 'milestones' })
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CaseEntity, (c) => c.milestones, { onDelete: 'CASCADE' })
  caseEntity!: CaseEntity;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'integer', default: 0 })
  tranchePercent!: number;

  @Column({ type: 'text', default: 'PENDING' })
  status!: MilestoneStatus;

  @OneToMany(() => Payment, (p) => p.milestone)
  payments?: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
