export const LocalEvents = {
  USER_WELCOME: 'user.welcome',
  USER_LOGIN_SUCCESS: 'user.login.success',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_ACCOUNT_DEACTIVATED: 'user.account.deactivated',
  USER_ACCOUNT_REACTIVATED: 'user.account.reactivated',

  VERIFICATION_EMAIL_SENT: 'verification.email.sent',
  VERIFICATION_EMAIL_CONFIRMED: 'verification.email.confirmed',
  VERIFICATION_PHONE_SENT: 'verification.phone.sent',
  VERIFICATION_PHONE_CONFIRMED: 'verification.phone.confirmed',
  LAWYER_PROFILE_VERIFIED: 'lawyer.profile.verified',
  LAWYER_PROFILE_REJECTED: 'lawyer.profile.rejected',

  FORGOT_PASSWORD_REQUESTED: 'forgot.password.requested',
  PASSWORD_RESET_SUCCESSFUL: 'password.reset.successful',

  CASE_CREATED: 'case.created',
  CASE_ASSIGNED: 'case.assigned',
  CASE_STATUS_UPDATED: 'case.status.updated',
  CASE_COMPLETED: 'case.completed',
  CASE_SUSPENDED: 'case.suspended',

  PROPOSAL_SUBMITTED: 'proposal.submitted',
  PROPOSAL_ACCEPTED: 'proposal.accepted',
  PROPOSAL_REJECTED: 'proposal.rejected',

  MILESTONE_CREATED: 'milestone.created',
  MILESTONE_COMPLETED: 'milestone.completed',
  MILESTONE_PAYMENT_DUE: 'milestone.payment.due',

  PAYMENT_SUCCESSFUL: 'payment.successful',
  PAYMENT_FAILED: 'payment.failed',
  ESCROW_CREATED: 'escrow.created',
  ESCROW_RELEASED: 'escrow.released',

  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_OVERDUE: 'task.overdue',
  APPOINTMENT_SCHEDULED: 'appointment.scheduled',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_REMINDER: 'appointment.reminder',

  RATING_RECEIVED: 'rating.received',

  COMPLAINT_SUBMITTED: 'complaint.submitted',
  COMPLAINT_RESOLVED: 'complaint.resolved',
  APPEAL_SUBMITTED: 'appeal.submitted',
  APPEAL_REVIEWED: 'appeal.reviewed',

  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',

  CLIENT_BRIEF_PUBLISHED: 'client.brief.published',
  CLIENT_BRIEF_ASSIGNED: 'client.brief.assigned',

  MEDIATION_REQUESTED: 'mediation.requested',
  MEDIATION_SCHEDULED: 'mediation.scheduled',

  AI_CONSULTATION_PAYMENT_CONFIRMED: 'ai.consultation.payment.confirmed',

  USER_REGISTRATION_SUCCESSFUL: 'user.registration.successful',
  USER_VERIFICATION_SUCCESSFUL: 'user.verification.successful',
  USER_VERIFICATION_REJECTED: 'user.verification.rejected',

  VERIFICATION_DOCUMENT_UPLOADED: 'verification.document.uploaded',
  LAWYER_VERIFICATION_STATUS_CHANGED: 'lawyer.verification.status.changed',
  LAWYER_REVIEW_CREATED: 'lawyer.review.created',
  LAWYER_PRACTICE_AREAS_UPDATED: 'lawyer.practice.areas.updated',

  AI_CONSULTATION_CREATED: 'ai.consultation.created',
  AI_CONSULTATION_PROCESSED: 'ai.consultation.processed',

  DOCUMENT_GENERATION_REQUESTED: 'document.generation.requested',
  DOCUMENT_GENERATED: 'document.generated',
  DOCUMENT_PAYMENT_CONFIRMED: 'document.payment.confirmed',
  DOCUMENT_READY: 'document.ready',

  CHAT_MESSAGE_RECEIVED: 'chat.message.received',
  CHAT_MESSAGE_READ: 'chat.message.read',

  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_UPDATE: 'system.update',
  SECURITY_ALERT: 'security.alert',

  NOTIFICATION_CREATED: 'notification.created',
} as const;

export const NotificationSlugs = {
  REGISTRATION_SUCCESSFUL: 'registration-successful',
  VERIFICATION_SUCCESSFUL: 'verification-successful',
  VERIFICATION_REJECTED: 'verification-rejected',
  LAWYER_PROFILE_VERIFIED: 'lawyer-profile-verified',
  LAWYER_PROFILE_REJECTED: 'lawyer-profile-rejected',

  CONSULTATION_CREATED: 'consultation-created',
  CONSULTATION_PROCESSED: 'consultation-processed',
  CONSULTATION_PAYMENT_CONFIRMED: 'consultation-payment-confirmed',

  CASE_CREATED: 'case-created',
  CASE_ASSIGNED: 'case-assigned',
  CASE_STATUS_UPDATED: 'case-status-updated',
  CASE_COMPLETED: 'case-completed',
  CASE_SUSPENDED: 'case-suspended',

  PROPOSAL_SUBMITTED: 'proposal-submitted',
  PROPOSAL_ACCEPTED: 'proposal-accepted',
  PROPOSAL_REJECTED: 'proposal-rejected',

  MILESTONE_CREATED: 'milestone-created',
  MILESTONE_COMPLETED: 'milestone-completed',
  MILESTONE_PAYMENT_DUE: 'milestone-payment-due',

  PAYMENT_SUCCESSFUL: 'payment-successful',
  PAYMENT_FAILED: 'payment-failed',
  ESCROW_CREATED: 'escrow-created',
  ESCROW_RELEASED: 'escrow-released',

  DOCUMENT_GENERATED: 'document-generated',
  DOCUMENT_READY: 'document-ready',

  TASK_ASSIGNED: 'task-assigned',
  TASK_COMPLETED: 'task-completed',
  TASK_OVERDUE: 'task-overdue',
  TASK_REMINDER: 'task-reminder',

  APPOINTMENT_SCHEDULED: 'appointment-scheduled',
  APPOINTMENT_CONFIRMED: 'appointment-confirmed',
  APPOINTMENT_CANCELLED: 'appointment-cancelled',
  APPOINTMENT_REMINDER: 'appointment-reminder',

  RATING_RECEIVED: 'rating-received',

  COMPLAINT_SUBMITTED: 'complaint-submitted',
  COMPLAINT_RESOLVED: 'complaint-resolved',

  APPEAL_SUBMITTED: 'appeal-submitted',
  APPEAL_DECISION: 'appeal-decision',

  SUBSCRIPTION_ACTIVATED: 'subscription-activated',
  SUBSCRIPTION_EXPIRED: 'subscription-expired',

  BRIEF_PUBLISHED: 'brief-published',
  BRIEF_ASSIGNED: 'brief-assigned',

  MEDIATION_REQUESTED: 'mediation-requested',
  MEDIATION_SCHEDULED: 'mediation-scheduled',

  NEW_MESSAGE: 'new-message',

  MAINTENANCE_NOTICE: 'maintenance-notice',
  SECURITY_ALERT: 'security-alert',
} as const;

export const NotificationTypes = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

export const NotificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NotificationCategories = {
  SYSTEM: 'system',
  PAYMENT: 'payment',
  CASE: 'case',
  APPOINTMENT: 'appointment',
  TASK: 'task',
  DOCUMENT: 'document',
  CONSULTATION: 'consultation',
  VERIFICATION: 'verification',
  COMPLAINT: 'complaint',
  APPEAL: 'appeal',
  SUBSCRIPTION: 'subscription',
  RATING: 'rating',
  CHAT: 'chat',
} as const;
