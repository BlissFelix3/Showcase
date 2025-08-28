import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';
import { Jurisdiction } from '../../jurisdictions/entities/jurisdiction.entity';

export type CaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'MEDIATION'
  | 'LITIGATION'
  | 'CLOSED'
  | 'SUSPENDED';

@Entity({ name: 'cases' })
export class CaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  client!: User;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  lawyer!: User | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text', default: 'OPEN' })
  status!: CaseStatus;

  @Column({ type: 'uuid', nullable: true })
  jurisdictionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number | null;

  @OneToMany(() => Proposal, (p) => p.caseEntity)
  proposals?: Proposal[];

  @OneToMany(() => Milestone, (m) => m.caseEntity)
  milestones?: Milestone[];

  @ManyToOne(() => Jurisdiction, { onDelete: 'SET NULL' })
  jurisdiction?: Jurisdiction;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
