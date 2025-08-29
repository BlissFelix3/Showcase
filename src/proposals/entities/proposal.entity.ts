import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaseEntity } from '../../cases/entities/case.entity';
import { ClientBrief } from '../../client-briefs/entities/client-brief.entity';

export type ProposalStatus =
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

@Entity({ name: 'proposals' })
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CaseEntity, (c) => c.proposals, { onDelete: 'CASCADE' })
  caseEntity!: CaseEntity;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  lawyer!: User;

  @Column({ type: 'integer' })
  quotedFeeMinor!: number;

  @Column({ type: 'text', default: 'SUBMITTED' })
  status!: ProposalStatus;

  @Column({ type: 'uuid', nullable: true })
  clientBriefId: string;

  @ManyToOne(() => ClientBrief, (cb) => cb.proposals, { onDelete: 'SET NULL' })
  clientBrief?: ClientBrief;

  @CreateDateColumn()
  createdAt!: Date;
}
