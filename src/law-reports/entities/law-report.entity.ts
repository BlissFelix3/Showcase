import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ReportCategory =
  | 'CONTRACT_LAW'
  | 'PROPERTY_LAW'
  | 'EMPLOYMENT_LAW'
  | 'CRIMINAL_LAW'
  | 'FAMILY_LAW'
  | 'COMMERCIAL_LAW'
  | 'CONSTITUTIONAL_LAW'
  | 'ADMINISTRATIVE_LAW';

export type ReportJurisdiction =
  | 'NIGERIA'
  | 'LAGOS'
  | 'ABUJA'
  | 'KANO'
  | 'RIVERS'
  | 'OTHER';

@Entity({ name: 'law_reports' })
export class LawReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  citation!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text' })
  category!: ReportCategory;

  @Column({ type: 'text' })
  jurisdiction!: ReportJurisdiction;

  @Column({ type: 'text' })
  court!: string;

  @Column({ type: 'date' })
  decisionDate!: Date;

  @Column({ type: 'text', nullable: true })
  judge!: string | null;

  @Column({ type: 'text', nullable: true })
  parties!: string | null;

  @Column({ type: 'text', nullable: true })
  headnotes!: string | null;

  @Column({ type: 'text', nullable: true })
  ratioDecidendi!: string | null;

  @Column({ type: 'text', nullable: true })
  obiterDicta!: string | null;

  @Column({ type: 'text', nullable: true })
  fullText!: string | null;

  @Column({ type: 'text', nullable: true })
  fileUrl!: string | null;

  @Column({ type: 'text', default: 'en' })
  language!: string;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
