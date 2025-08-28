import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { LocalEvents, NotificationSlugs } from 'src/utils/constants';
import { PushService } from './push.service';

@Injectable()
export class NotificationEvents {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly pushService: PushService,
  ) {}

  @OnEvent(LocalEvents.NOTIFICATION_CREATED)
  async handleNotificationCreated(payload: any) {
    const { notification, user } = payload;

    if (!user?.id) {
      console.error('User is undefined or has no ID in the payload.');
      return;
    }

    const deviceTokens = await this.notificationService.getUserDeviceTokens(
      user.id,
    );

    if (deviceTokens.length > 0) {
      await this.pushService.sendToToken(deviceTokens, {
        notification: {
          title: notification.title,
          body: notification.message,
          imageUrl: notification.imageUrl,
        },
        data: {
          notificationId: notification.id,
          slug: notification.slug,
          category: notification.category,
        },
      });
    }
  }

  // User Management Events
  @OnEvent(LocalEvents.USER_REGISTRATION_SUCCESSFUL)
  async handleUserRegistrationSuccessful(payload: any) {
    const { userId, slug } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.REGISTRATION_SUCCESSFUL) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  @OnEvent(LocalEvents.LAWYER_PROFILE_VERIFIED)
  async handleLawyerProfileVerified(payload: any) {
    const { userId, slug } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.LAWYER_PROFILE_VERIFIED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // AI Consultation Events
  @OnEvent(LocalEvents.AI_CONSULTATION_PAYMENT_CONFIRMED)
  async handleConsultationPaymentConfirmed(payload: any) {
    const { userId, slug, consultation } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.CONSULTATION_PAYMENT_CONFIRMED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          consultationId: consultation.id,
          amount: consultation.amountMinor / 100,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Case Management Events
  @OnEvent(LocalEvents.CASE_ASSIGNED)
  async handleCaseAssigned(payload: any) {
    const { userId, slug, caseData } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.CASE_ASSIGNED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          caseId: caseData.id,
          caseTitle: caseData.title,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Proposal Events
  @OnEvent(LocalEvents.PROPOSAL_ACCEPTED)
  async handleProposalAccepted(payload: any) {
    const { userId, slug, proposal } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.PROPOSAL_ACCEPTED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          proposalId: proposal.id,
          caseId: proposal.caseEntity?.id,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Milestone Events
  @OnEvent(LocalEvents.MILESTONE_COMPLETED)
  async handleMilestoneCompleted(payload: any) {
    const { userId, slug, milestone } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.MILESTONE_COMPLETED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          milestoneId: milestone.id,
          caseId: milestone.caseEntity?.id,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Payment Events
  @OnEvent(LocalEvents.PAYMENT_SUCCESSFUL)
  async handlePaymentSuccessful(payload: any) {
    const { userId, slug, payment } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.PAYMENT_SUCCESSFUL) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          paymentId: payment.id,
          amount: payment.amountMinor / 100,
          purpose: payment.purpose,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Document Events
  @OnEvent(LocalEvents.DOCUMENT_GENERATED)
  async handleDocumentGenerated(payload: any) {
    const { userId, slug, document } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.DOCUMENT_GENERATED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          documentId: document.id,
          documentTitle: document.title,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Task Events
  @OnEvent(LocalEvents.TASK_ASSIGNED)
  async handleTaskAssigned(payload: any) {
    const { userId, slug, task } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.TASK_ASSIGNED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          caseId: task.caseEntity?.id,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Appointment Events
  @OnEvent(LocalEvents.APPOINTMENT_SCHEDULED)
  async handleAppointmentScheduled(payload: any) {
    const { userId, slug, appointment } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.APPOINTMENT_SCHEDULED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          appointmentId: appointment.id,
          scheduledAt: appointment.scheduledAt,
          type: appointment.type,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Rating Events
  @OnEvent(LocalEvents.RATING_RECEIVED)
  async handleRatingReceived(payload: any) {
    const { userId, slug, rating } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.RATING_RECEIVED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          ratingId: rating.id,
          overallRating: rating.overallRating,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Complaint Events
  @OnEvent(LocalEvents.COMPLAINT_SUBMITTED)
  async handleComplaintSubmitted(payload: any) {
    const { userId, slug, complaint } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.COMPLAINT_SUBMITTED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          complaintId: complaint.id,
          complaintTitle: complaint.title,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Appeal Events
  @OnEvent(LocalEvents.APPEAL_SUBMITTED)
  async handleAppealSubmitted(payload: any) {
    const { userId, slug, appeal } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.APPEAL_SUBMITTED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          appealId: appeal.id,
          appealTitle: appeal.title,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Subscription Events
  @OnEvent(LocalEvents.SUBSCRIPTION_ACTIVATED)
  async handleSubscriptionActivated(payload: any) {
    const { userId, slug, subscription } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.SUBSCRIPTION_ACTIVATED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          subscriptionId: subscription.id,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Client Brief Events
  @OnEvent(LocalEvents.CLIENT_BRIEF_PUBLISHED)
  async handleClientBriefPublished(payload: any) {
    const { userId, slug, brief } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.BRIEF_PUBLISHED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          briefId: brief.id,
          briefTitle: brief.title,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Mediation Events
  @OnEvent(LocalEvents.MEDIATION_REQUESTED)
  async handleMediationRequested(payload: any) {
    const { userId, slug, mediation } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.MEDIATION_REQUESTED) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          mediationId: mediation.id,
          imageUrl: template.imageUrl,
        },
      });
    }
  }

  // Chat Events
  @OnEvent(LocalEvents.CHAT_MESSAGE_RECEIVED)
  async handleChatMessageReceived(payload: any) {
    const { userId, slug, message } = payload;

    const template = await this.notificationService.getTemplateBySlug(slug);

    if (template.slug === NotificationSlugs.NEW_MESSAGE) {
      await this.notificationService.sendNotificationWithTemplate({
        userId,
        templateSlug: slug,
        data: {
          messageId: message.id,
          senderName: message.sender?.fullName || 'Someone',
          imageUrl: template.imageUrl,
        },
      });
    }
  }
}
