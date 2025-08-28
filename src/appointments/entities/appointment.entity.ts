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

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
  INITIAL_CONSULTATION = 'INITIAL_CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  COURT_HEARING = 'COURT_HEARING',
  MEDIATION_SESSION = 'MEDIATION_SESSION',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  OTHER = 'OTHER',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  lawyerId: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: AppointmentType.INITIAL_CONSULTATION,
  })
  type: AppointmentType;

  @Column({ type: 'varchar', length: 50, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 60 }) // Duration in minutes
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  meetingLink: string; // For virtual meetings

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string; // For physical meetings

  @Column({ type: 'varchar', length: 50, default: 'en' })
  language: string; // Client's preferred language

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lawyerId' })
  lawyer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => CaseEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  caseEntity: CaseEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
