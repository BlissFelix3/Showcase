import { BaseEntity } from '../../config/repository/base-entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'notifications' })
export class Notification extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  message: string;

  @Index()
  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Index()
  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: false, default: false })
  isRead: boolean;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ nullable: true })
  metadata?: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
}
