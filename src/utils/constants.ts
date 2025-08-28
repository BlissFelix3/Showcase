// Notification Event Constants for Sulhu Platform
export const LocalEvents = {
  // Email Notification Events
  EMAIL_WELCOME: 'email.welcome',
  EMAIL_FORGOT_PASSWORD: 'email.forgot-password',
  EMAIL_PASSWORD_RESET: 'email.password-reset',
  EMAIL_VERIFICATION: 'email.verification',
  EMAIL_VERIFIED: 'email.verified',
  EMAIL_PHONE_VERIFICATION: 'email.phone-verification',
  EMAIL_PHONE_VERIFIED: 'email.phone-verified',
  EMAIL_LOGIN_SUCCESS: 'email.login-success',
  EMAIL_PASSWORD_CHANGED: 'email.password-changed',
  EMAIL_ACCOUNT_DEACTIVATED: 'email.account-deactivated',
  EMAIL_ACCOUNT_REACTIVATED: 'email.account-reactivated',

  // Push Notification Events
  PUSH_WELCOME: 'push.welcome',
  PUSH_FORGOT_PASSWORD: 'push.forgot-password',
  PUSH_PASSWORD_RESET: 'push.password-reset',
  PUSH_VERIFICATION: 'push.verification',
  PUSH_VERIFIED: 'push.verified',
  PUSH_PHONE_VERIFICATION: 'push.phone-verification',
  PUSH_PHONE_VERIFIED: 'push.phone-verified',
  PUSH_LOGIN_SUCCESS: 'push.login-success',
  PUSH_PASSWORD_CHANGED: 'push.password-changed',
  PUSH_ACCOUNT_DEACTIVATED: 'push.account-deactivated',
  PUSH_ACCOUNT_REACTIVATED: 'push.account-reactivated',

  // Business Logic Events (for other services)
  USER_REGISTRATION_SUCCESSFUL: 'user.registration.successful',
  USER_VERIFICATION_SUCCESSFUL: 'user.verification.successful',
  USER_VERIFICATION_REJECTED: 'user.verification.rejected',
  LAWYER_PROFILE_VERIFIED: 'lawyer.profile.verified',
  LAWYER_PROFILE_REJECTED: 'lawyer.profile.rejected',
  AI_CONSULTATION_CREATED: 'ai.consultation.created',
  AI_CONSULTATION_PROCESSED: 'ai.consultation.processed',
  AI_CONSULTATION_PAYMENT_CONFIRMED: 'ai.consultation.payment.confirmed',
  CASE_CREATED: 'case.created',
  CASE_ASSIGNED: 'case.assigned',
  CASE_STATUS_UPDATED: 'case.status.updated',
  CASE_COMPLETED: 'case.completed',
  CASE_SUSPENDED: 'case.suspended',
  PROPOSAL_SUBMITTED: 'proposal.submitted',
  PROPOSAL_ACCEPTED: 'proposal.accepted',
  PROPOSAL_REJECTED: 'proposal.rejected',
  PROPOSAL_WITHDRAWN: 'proposal.withdrawn',
  MILESTONE_CREATED: 'milestone.created',
  MILESTONE_COMPLETED: 'milestone.completed',
  MILESTONE_PAYMENT_DUE: 'milestone.payment.due',
  MILESTONE_PAYMENT_CONFIRMED: 'milestone.payment.confirmed',
  PAYMENT_SUCCESSFUL: 'payment.successful',
  PAYMENT_FAILED: 'payment.failed',
  ESCROW_CREATED: 'escrow.created',
  ESCROW_RELEASED: 'escrow.released',
  ESCROW_CANCELLED: 'escrow.cancelled',
  DOCUMENT_GENERATION_REQUESTED: 'document.generation.requested',
  DOCUMENT_GENERATED: 'document.generated',
  DOCUMENT_PAYMENT_CONFIRMED: 'document.payment.confirmed',
  DOCUMENT_READY: 'document.ready',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_OVERDUE: 'task.overdue',
  TASK_REMINDER: 'task.reminder',
  APPOINTMENT_SCHEDULED: 'appointment.scheduled',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_REMINDER: 'appointment.reminder',
  RATING_SUBMITTED: 'rating.submitted',
  RATING_RECEIVED: 'rating.received',
  COMPLAINT_SUBMITTED: 'complaint.submitted',
  COMPLAINT_RESOLVED: 'complaint.resolved',
  COMPLAINT_ESCALATED: 'complaint.escalated',
  APPEAL_SUBMITTED: 'appeal.submitted',
  APPEAL_REVIEWED: 'appeal.reviewed',
  APPEAL_DECISION_MADE: 'appeal.decision.made',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  CLIENT_BRIEF_PUBLISHED: 'client.brief.published',
  CLIENT_BRIEF_ASSIGNED: 'client.brief.assigned',
  CLIENT_BRIEF_CLOSED: 'client.brief.closed',
  MEDIATION_REQUESTED: 'mediation.requested',
  MEDIATION_SCHEDULED: 'mediation.scheduled',
  MEDIATION_COMPLETED: 'mediation.completed',
  CHAT_MESSAGE_RECEIVED: 'chat.message.received',
  CHAT_MESSAGE_READ: 'chat.message.read',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_UPDATE: 'system.update',
  SECURITY_ALERT: 'security.alert',
  NOTIFICATION_CREATED: 'notification.created',
} as const;

// Notification Template Slugs
export const NotificationSlugs = {
  // User Management
  REGISTRATION_SUCCESSFUL: 'registration-successful',
  VERIFICATION_SUCCESSFUL: 'verification-successful',
  VERIFICATION_REJECTED: 'verification-rejected',
  LAWYER_PROFILE_VERIFIED: 'lawyer-profile-verified',
  LAWYER_PROFILE_REJECTED: 'lawyer-profile-rejected',

  // AI Consultation
  CONSULTATION_CREATED: 'consultation-created',
  CONSULTATION_PROCESSED: 'consultation-processed',
  CONSULTATION_PAYMENT_CONFIRMED: 'consultation-payment-confirmed',

  // Case Management
  CASE_CREATED: 'case-created',
  CASE_ASSIGNED: 'case-assigned',
  CASE_STATUS_UPDATED: 'case-status-updated',
  CASE_COMPLETED: 'case-completed',
  CASE_SUSPENDED: 'case-suspended',

  // Proposals
  PROPOSAL_SUBMITTED: 'proposal-submitted',
  PROPOSAL_ACCEPTED: 'proposal-accepted',
  PROPOSAL_REJECTED: 'proposal-rejected',

  // Milestones
  MILESTONE_CREATED: 'milestone-created',
  MILESTONE_COMPLETED: 'milestone-completed',
  MILESTONE_PAYMENT_DUE: 'milestone-payment-due',

  // Payments
  PAYMENT_SUCCESSFUL: 'payment-successful',
  PAYMENT_FAILED: 'payment-failed',
  ESCROW_CREATED: 'escrow-created',
  ESCROW_RELEASED: 'escrow-released',

  // Documents
  DOCUMENT_GENERATED: 'document-generated',
  DOCUMENT_READY: 'document-ready',

  // Tasks
  TASK_ASSIGNED: 'task-assigned',
  TASK_COMPLETED: 'task-completed',
  TASK_OVERDUE: 'task-overdue',
  TASK_REMINDER: 'task-reminder',

  // Appointments
  APPOINTMENT_SCHEDULED: 'appointment-scheduled',
  APPOINTMENT_CONFIRMED: 'appointment-confirmed',
  APPOINTMENT_CANCELLED: 'appointment-cancelled',
  APPOINTMENT_REMINDER: 'appointment-reminder',

  // Ratings
  RATING_RECEIVED: 'rating-received',

  // Complaints
  COMPLAINT_SUBMITTED: 'complaint-submitted',
  COMPLAINT_RESOLVED: 'complaint-resolved',

  // Appeals
  APPEAL_SUBMITTED: 'appeal-submitted',
  APPEAL_DECISION: 'appeal-decision',

  // Subscriptions
  SUBSCRIPTION_ACTIVATED: 'subscription-activated',
  SUBSCRIPTION_EXPIRED: 'subscription-expired',

  // Client Briefs
  BRIEF_PUBLISHED: 'brief-published',
  BRIEF_ASSIGNED: 'brief-assigned',

  // Mediation
  MEDIATION_REQUESTED: 'mediation-requested',
  MEDIATION_SCHEDULED: 'mediation-scheduled',

  // Chat
  NEW_MESSAGE: 'new-message',

  // System
  MAINTENANCE_NOTICE: 'maintenance-notice',
  SECURITY_ALERT: 'security-alert',
} as const;

// Notification Types
export const NotificationTypes = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

// Notification Priorities
export const NotificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Notification Categories
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
