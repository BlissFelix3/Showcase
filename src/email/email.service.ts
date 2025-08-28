import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailgunService } from './mailgun.service';
import { ICreateTemplate } from './interface/email.interface';
import { EmailTemplateRepository } from './repositories/email.repository';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async create(payload: ICreateTemplate) {
    const template = await this.emailTemplateRepository.findOne({
      where: { slug: payload.slug },
    });

    if (template) {
      throw new ConflictException('Template with this slug already exists');
    }

    return this.emailTemplateRepository.save(payload);
  }

  async getAllTemplate() {
    try {
      return await this.emailTemplateRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async getBySlug(slug: string) {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: { slug },
      });
      if (!slug) {
        throw new NotFoundException(`Email Template not found for ${slug}`);
      }

      return template;
    } catch (error) {
      throw error;
    }
  }

  async sendTemplatedEmail(to: string, templateId: string, variables: object) {
    try {
      return await this.mailgunService.sendWithTemplate(templateId, {
        to,
        variables,
      });
    } catch (error) {
      throw error;
    }
  }
}
