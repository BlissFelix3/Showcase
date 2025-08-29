import { IEmailInput } from './interface/email.interface';
import Mailgun, { Interfaces } from 'mailgun.js';
import config from '../config';

const FormData = require('form-data');

export class MailgunService {
  private client: Interfaces.IMailgunClient;

  constructor() {
    if (!config.mailgun.apiKey) {
      throw new Error('MAILGUN_KEY environment variable is required');
    }

    const mailgun = new Mailgun(FormData);
    this.client = mailgun.client({
      username: 'api',
      key: config.mailgun.apiKey,
    });
  }

  async sendPlain(data: IEmailInput): Promise<any> {
    try {
      if (!config.mailgun.domain) {
        throw new Error('MAILGUN_DOMAIN environment variable is required');
      }

      if (!data.text && !data.html) {
        throw new Error('Either text or html content must be provided');
      }

      const messageData: any = {
        from: data.from,
        to: data.to,
        subject: data.subject,
      };

      if (data.text) {
        messageData.text = data.text;
      }
      if (data.html) {
        messageData.html = data.html;
      }

      return await this.client.messages.create(
        config.mailgun.domain,
        messageData,
      );
    } catch (error) {
      throw error;
    }
  }

  async sendWithTemplate(templateId: string, data: IEmailInput): Promise<any> {
    try {
      if (!config.mailgun.domain) {
        throw new Error('MAILGUN_DOMAIN environment variable is required');
      }

      if (!data) {
        throw new Error('Email data is required');
      }

      const mailgunData = {
        from: config.mailgun.from || 'noreply@mg.livio.life',
        to: `${data.variables?.firstName || ''} ${data.variables?.lastName || ''} <${data.to}>`,
        subject: data.subject,
        template: templateId,
        't:variables': JSON.stringify(data.variables || {}),
        // 'h:Reply-To': 'reply-to@example.com',
      };

      return await this.client.messages.create(
        config.mailgun.domain,
        mailgunData,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
