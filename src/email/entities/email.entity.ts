import { BaseEntity } from '../../config/repository/base-entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'email-templates' })
export class EmailTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  from: string;

  @Column()
  templateId: string;

  @Column({ unique: true })
  slug: string;
}
