import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  lawyer!: User;

  @Column({ type: 'text', default: 'ACTIVE' })
  status!: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
