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

export type DocumentType =
  | 'SALE_AGREEMENT'
  | 'RENT_AGREEMENT'
  | 'QUIT_NOTICE'
  | 'CONTRACT'
  | 'LEGAL_LETTER'
  | 'AFFIDAVIT'
  | 'POWER_OF_ATTORNEY'
  | 'WILL'
  | 'CUSTOM';

export type DocumentStatus = 'DRAFT' | 'GENERATED' | 'SIGNED' | 'ARCHIVED';

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  client!: User;

  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'SET NULL' })
  caseEntity?: CaseEntity | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  type!: DocumentType;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', default: 'DRAFT' })
  status!: DocumentStatus;

  @Column({ type: 'json' })
  templateData!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  generatedContent!: string | null;

  @Column({ type: 'text', nullable: true })
  fileUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  fileName!: string | null;

  @Column({ type: 'text', nullable: true })
  language!: string | null;

  @Column({ type: 'integer', default: 0 })
  amountMinor!: number; // Document generation fee

  @Column({ type: 'text', nullable: true })
  paymentReference!: string | null;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
