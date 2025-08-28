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
import { Milestone } from '../../milestones/entities/milestone.entity';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  assignedTo!: User;

  @ManyToOne(() => CaseEntity, { onDelete: 'CASCADE' })
  caseEntity!: CaseEntity;

  @ManyToOne(() => Milestone, { nullable: true, onDelete: 'SET NULL' })
  milestone?: Milestone | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', default: 'PENDING' })
  status!: TaskStatus;

  @Column({ type: 'text', default: 'MEDIUM' })
  priority!: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  completedDate!: Date | null;

  @Column({ type: 'integer', default: 0 })
  estimatedHours!: number;

  @Column({ type: 'integer', default: 0 })
  actualHours!: number;

  @Column({ type: 'text', nullable: true })
  progressNotes!: string | null;

  @Column({ type: 'json', nullable: true })
  attachments!: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
