import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MailgunService } from './mailgun.service';
import { EmailNotificationEvents } from './email-notification.events';
import { EmailTemplate } from './entities/email.entity';
import { EmailTemplateRepository } from './repositories/email.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate])],
  controllers: [EmailController],
  providers: [
    EmailService,
    MailgunService,
    EmailNotificationEvents,
    EmailTemplateRepository,
  ],
  exports: [EmailService],
})
export class EmailModule {}
