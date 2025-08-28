import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import cfg from '../config';

export interface EmailRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
  html?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(
    request: EmailRequest,
  ): Promise<{ sent: boolean; reason?: string }> {
    try {
      if (!cfg.mailgun.apiKey || !cfg.mailgun.domain || !cfg.mailgun.from) {
        this.logger.warn('Mailgun not configured');
        return { sent: false, reason: 'MAILGUN_NOT_CONFIGURED' };
      }

      const { to, subject, template, data, html } = request;

      // Generate HTML content from template or use provided HTML
      let emailHtml = html;
      if (template && data) {
        emailHtml = this.generateEmailFromTemplate(template, data);
      }

      if (!emailHtml) {
        return { sent: false, reason: 'NO_HTML_CONTENT' };
      }

      const url = `https://api.mailgun.net/v3/${cfg.mailgun.domain}/messages`;
      const auth = {
        username: 'api',
        password: cfg.mailgun.apiKey,
      };

      const params = new URLSearchParams();
      params.set('from', cfg.mailgun.from);
      params.set('to', to);
      params.set('subject', subject);
      params.set('html', emailHtml);

      const res = await axios.post(url, params, { auth });
      const success = res.status === 200;

      if (success) {
        this.logger.log(`Email sent successfully to ${to}`);
      } else {
        this.logger.warn(
          `Failed to send email to ${to}, status: ${res.status}`,
        );
      }

      return { sent: success };
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      return { sent: false, reason: 'SEND_ERROR' };
    }
  }

  async sendEmailLegacy(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ sent: boolean; reason?: string }> {
    return this.sendEmail({ to, subject, html });
  }

  async sendSms(
    to: string,
    message: string,
  ): Promise<{ sent: boolean; reason?: string }> {
    try {
      // TODO: Integrate preferred SMS provider here using cfg
      this.logger.log(`SMS would be sent to ${to}: ${message}`);

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { sent: false, reason: 'SMS_PROVIDER_NOT_CONFIGURED' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending SMS: ${errorMessage}`);
      return { sent: false, reason: 'SEND_ERROR' };
    }
  }

  async sendWhatsapp(
    to: string,
    message: string,
  ): Promise<{ sent: boolean; reason?: string }> {
    try {
      // TODO: Integrate WhatsApp Business provider here using cfg
      this.logger.log(`WhatsApp message would be sent to ${to}: ${message}`);

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { sent: false, reason: 'WHATSAPP_PROVIDER_NOT_CONFIGURED' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending WhatsApp message: ${errorMessage}`);
      return { sent: false, reason: 'SEND_ERROR' };
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
  ): Promise<{ sent: boolean; reason?: string }> {
    try {
      // TODO: Integrate Firebase Cloud Messaging or other push notification service
      this.logger.log(
        `Push notification would be sent to user ${userId}: ${title} - ${body}`,
      );

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      return {
        sent: false,
        reason: 'PUSH_NOTIFICATION_PROVIDER_NOT_CONFIGURED',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending push notification: ${errorMessage}`);
      return { sent: false, reason: 'SEND_ERROR' };
    }
  }

  private generateEmailFromTemplate(
    template: string,
    data: Record<string, any>,
  ): string {
    // Simple template engine - in production, use a proper templating library
    const templates: Record<string, string> = {
      'payment-success': `
        <h2>Payment Successful</h2>
        <p>Your payment of ₦${data.amount} for ${data.purpose} has been processed successfully.</p>
        <p>Date: ${data.date}</p>
        <p>Thank you for using Sulhu!</p>
      `,
      'payment-failure': `
        <h2>Payment Failed</h2>
        <p>Your payment with reference ${data.reference} has failed.</p>
        <p>Date: ${data.date}</p>
        <p>Please try again or contact support if the issue persists.</p>
      `,
      'transfer-failure': `
        <h2>Transfer Failed</h2>
        <p>Your transfer with reference ${data.reference} has failed.</p>
        <p>Date: ${data.date}</p>
        <p>Please contact support for assistance.</p>
      `,
      'refund-processed': `
        <h2>Refund Processed</h2>
        <p>Your refund of ₦${data.amount} with reference ${data.reference} has been processed.</p>
        <p>Date: ${data.date}</p>
        <p>The refund will appear in your account within 3-5 business days.</p>
      `,
      'consultation-confirmed': `
        <h2>Consultation Payment Confirmed</h2>
        <p>Your consultation payment of ₦${data.amount} has been confirmed.</p>
        <p>Date: ${data.date}</p>
        <p>You can now proceed with your legal consultation.</p>
      `,
      'escrow-confirmed': `
        <h2>Escrow Payment Confirmed</h2>
        <p>Your escrow payment of ₦${data.amount} has been confirmed and is being held securely.</p>
        <p>Case ID: ${data.caseId || 'N/A'}</p>
        <p>Date: ${data.date}</p>
        <p>Funds will be released according to the agreed terms.</p>
      `,
      'escrow-created': `
        <h2>Escrow Created</h2>
        <p>An escrow has been created for ₦${data.amount} for case ${data.caseId}.</p>
        <p>Purpose: ${data.purpose}</p>
        <p>Date: ${data.date}</p>
        <p>Funds are now held securely until release conditions are met.</p>
      `,
      'escrow-created-client': `
        <h2>Escrow Created</h2>
        <p>An escrow has been created for your case ${data.caseId} with an amount of ₦${data.amount}.</p>
        <p>Purpose: ${data.purpose}</p>
        <p>Date: ${data.date}</p>
        <p>Your funds are now held securely until the lawyer completes the agreed work.</p>
      `,
    };

    const templateHtml = templates[template];
    if (!templateHtml) {
      this.logger.warn(`Email template not found: ${template}`);
      return `
        <h2>${data.subject || 'Notification'}</h2>
        <p>This is an automated notification from Sulhu.</p>
        <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
      `;
    }

    // Replace placeholders with actual data
    let html = templateHtml;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      html = html.replace(placeholder, String(value));
    });

    return html;
  }
}
