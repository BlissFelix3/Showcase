import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type ConsultationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type ConsultationType = 'INITIAL' | 'FOLLOW_UP' | 'SPECIALIST';

@Entity({ name: 'ai_consultations' })
export class AIConsultation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  client!: User;

  @Column({ type: 'text' })
  legalProblem!: string;

  @Column({ type: 'text', nullable: true })
  aiAnalysis!: string | null;

  @Column({ type: 'text', nullable: true })
  recommendations!: string | null;

  @Column({ type: 'text', nullable: true })
  chosenOption!: string | null;

  @Column({ type: 'text', default: 'PENDING' })
  status!: ConsultationStatus;

  @Column({ type: 'text', default: 'INITIAL' })
  type!: ConsultationType;

  @Column({ type: 'text', nullable: true })
  language!: string | null;

  @Column({ type: 'integer', default: 0 })
  amountMinor!: number;

  @Column({ type: 'text', nullable: true })
  paymentReference!: string | null;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'text', nullable: true })
  aiResponse!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
