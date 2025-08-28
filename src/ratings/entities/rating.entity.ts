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

@Entity({ name: 'ratings' })
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  rater!: User; // Client who is rating

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  rated!: User; // Lawyer being rated

  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'SET NULL' })
  caseEntity?: CaseEntity | null;

  @ManyToOne(() => Milestone, { nullable: true, onDelete: 'SET NULL' })
  milestone?: Milestone | null;

  @Column({ type: 'integer', default: 0 })
  overallRating!: number; // 1-5 stars

  @Column({ type: 'integer', default: 0 })
  communicationRating!: number; // 1-5 stars

  @Column({ type: 'integer', default: 0 })
  expertiseRating!: number; // 1-5 stars

  @Column({ type: 'integer', default: 0 })
  professionalismRating!: number; // 1-5 stars

  @Column({ type: 'integer', default: 0 })
  valueRating!: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'boolean', default: false })
  isAnonymous!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
