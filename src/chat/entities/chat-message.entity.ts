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

@Entity({ name: 'chat_messages' })
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  sender!: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  recipient!: User;

  @ManyToOne(() => CaseEntity, { nullable: true, onDelete: 'CASCADE' })
  caseEntity?: CaseEntity | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'text', nullable: true })
  messageType?: string | null;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
