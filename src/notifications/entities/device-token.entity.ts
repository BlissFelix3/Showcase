import { BaseEntity } from '../../config/repository/base-entity';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'device_tokens' })
@Unique(['userId', 'deviceToken'])
export class DeviceToken extends BaseEntity {
  @Index()
  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  deviceToken: string;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  appVersion?: string;

  @ManyToOne(() => User, (user) => user.deviceTokens)
  user: User;
}
