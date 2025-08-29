import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// Forward reference to avoid circular dependency

export enum DocumentType {
  CALL_TO_BAR_CERTIFICATE = 'CALL_TO_BAR_CERTIFICATE',
  NATIONAL_ID = 'NATIONAL_ID',
  NIN_SLIP = 'NIN_SLIP',
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  PROFESSIONAL_INSURANCE = 'PROFESSIONAL_INSURANCE',
  CONTINUING_LEGAL_EDUCATION = 'CONTINUING_LEGAL_EDUCATION',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'verification_documents' })
export class VerificationDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('LawyerProfile', 'verificationDocuments', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lawyer_profile_id' })
  lawyerProfile!: any;

  @Column({ type: 'text' })
  documentType!: DocumentType;

  @Column({ type: 'text' })
  fileName!: string;

  @Column({ type: 'text' })
  fileUrl!: string;

  @Column({ type: 'text', nullable: true })
  originalFileName!: string | null;

  @Column({ type: 'text', nullable: true })
  mimeType!: string | null;

  @Column({ type: 'int', nullable: true })
  fileSize!: number | null;

  @Column({ type: 'text', default: 'PENDING' })
  status!: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  verificationNotes!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'text', nullable: true })
  documentNumber!: string | null; // For certificates, IDs, etc.

  @Column({ type: 'timestamp', nullable: true })
  issueDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  issuingAuthority!: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimary!: boolean; // Whether this is the primary document for this type

  @Column({ type: 'text', nullable: true })
  metadata!: string | null; // JSON string for additional data

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
