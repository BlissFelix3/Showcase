import { BaseEntity } from '../../config/repository/base-entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'notification_templates' })
export class NotificationTemplate extends BaseEntity {
  @Index()
  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  metadata?: string; // JSON string for additional template data
}
