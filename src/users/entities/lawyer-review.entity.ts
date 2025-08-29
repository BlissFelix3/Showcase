import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'lawyer_reviews' })
export class LawyerReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @ManyToOne('LawyerProfile', 'reviews', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lawyer_profile_id' })
  lawyerProfile!: any;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'text', nullable: true })
  caseType!: string | null;

  @Column({ type: 'text', nullable: true })
  caseOutcome!: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'boolean', default: false })
  isAnonymous!: boolean;

  @Column({ type: 'text', nullable: true })
  responseFromLawyer!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lawyerRespondedAt!: Date | null;

  @Column({ type: 'boolean', default: false })
  isHelpful!: boolean;

  @Column({ type: 'int', default: 0 })
  helpfulCount!: number;

  @Column({ type: 'text', nullable: true })
  moderationNotes!: string | null;

  @Column({ type: 'boolean', default: true })
  isVisible!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
