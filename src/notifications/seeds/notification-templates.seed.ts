import { NotificationTemplate } from '../entities/notification-template.entity';

export const notificationTemplates: Partial<NotificationTemplate>[] = [
  {
    slug: 'registration-successful',
    title: 'Welcome to Sulhu!',
    message:
      'Your account has been created successfully. Welcome to the AI-powered legal platform that speeds up justice delivery.',
    category: 'verification',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'verification-successful',
    title: 'Account Verified Successfully',
    message:
      'Congratulations! Your account has been verified. You can now access all features of the Sulhu platform.',
    category: 'verification',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'verification-rejected',
    title: 'Verification Update',
    message:
      'Your account verification requires additional information. Please review and resubmit your documents.',
    category: 'verification',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'lawyer-profile-verified',
    title: 'Lawyer Profile Verified!',
    message:
      'Your lawyer profile has been verified and is now visible to potential clients. Start receiving case proposals!',
    category: 'verification',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'lawyer-profile-rejected',
    title: 'Profile Verification Update',
    message:
      'Your lawyer profile verification requires additional information. Please review and resubmit your documents.',
    category: 'verification',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'consultation-created',
    title: 'AI Consultation Created',
    message:
      'Your AI legal consultation has been created. Our AI is analyzing your legal problem and will provide recommendations soon.',
    category: 'consultation',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'consultation-processed',
    title: 'AI Analysis Complete',
    message:
      'Your AI consultation analysis is ready! View your personalized legal recommendations and next steps.',
    category: 'consultation',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'consultation-payment-confirmed',
    title: 'Consultation Payment Confirmed',
    message:
      'Your consultation payment of ₦{{amount}} has been confirmed. You can now proceed with your AI legal consultation.',
    category: 'consultation',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'case-created',
    title: 'New Case Created',
    message:
      'Your legal case "{{caseTitle}}" has been created successfully. Lawyers will now be able to submit proposals.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'case-assigned',
    title: 'Case Assigned to Lawyer',
    message:
      'Your case "{{caseTitle}}" has been assigned to a qualified lawyer. You can now track progress and communicate.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'case-status-updated',
    title: 'Case Status Updated',
    message:
      'Your case "{{caseTitle}}" status has been updated to {{status}}. Check the case dashboard for details.',
    category: 'case',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'case-completed',
    title: 'Case Completed Successfully',
    message:
      'Congratulations! Your case "{{caseTitle}}" has been completed successfully. Please rate your lawyer.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'case-suspended',
    title: 'Case Suspended',
    message:
      'Your case "{{caseTitle}}" has been suspended. Please contact support for assistance.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'proposal-submitted',
    title: 'New Proposal Received',
    message:
      'You have received a new proposal for your case "{{caseTitle}}". Review and accept the best offer.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'proposal-accepted',
    title: 'Proposal Accepted',
    message:
      'Your proposal for case "{{caseTitle}}" has been accepted! The client has hired you for this case.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'proposal-rejected',
    title: 'Proposal Update',
    message:
      'Your proposal for case "{{caseTitle}}" was not selected. Keep submitting proposals for other cases.',
    category: 'case',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'milestone-created',
    title: 'New Milestone Created',
    message:
      'A new milestone "{{milestoneTitle}}" has been created for your case. Track progress and complete tasks.',
    category: 'case',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'milestone-completed',
    title: 'Milestone Completed',
    message:
      'Milestone "{{milestoneTitle}}" has been completed successfully! Payment will be processed according to terms.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'milestone-payment-due',
    title: 'Milestone Payment Due',
    message:
      'Payment is due for completed milestone "{{milestoneTitle}}". Please confirm completion to release funds.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'payment-successful',
    title: 'Payment Successful',
    message:
      'Your payment of ₦{{amount}} for {{purpose}} has been processed successfully. Thank you for using Sulhu!',
    category: 'payment',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'payment-failed',
    title: 'Payment Failed',
    message:
      'Your payment of ₦{{amount}} for {{purpose}} has failed. Please try again or contact support.',
    category: 'payment',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'escrow-created',
    title: 'Escrow Created',
    message:
      'An escrow of ₦{{amount}} has been created for your case. Funds are held securely until work completion.',
    category: 'payment',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'escrow-released',
    title: 'Escrow Released',
    message:
      'Escrow funds of ₦{{amount}} have been released to your lawyer. Case milestone completed successfully.',
    category: 'payment',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'document-generated',
    title: 'Document Generated',
    message:
      'Your {{documentTitle}} has been generated successfully. Download and review the document.',
    category: 'document',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'document-ready',
    title: 'Document Ready',
    message:
      'Your {{documentTitle}} is ready for download. Access it from your documents dashboard.',
    category: 'document',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'task-assigned',
    title: 'New Task Assigned',
    message:
      'You have been assigned a new task: "{{taskTitle}}" for case "{{caseTitle}}". Complete it to progress.',
    category: 'task',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'task-completed',
    title: 'Task Completed',
    message:
      'Task "{{taskTitle}}" has been completed successfully. Great work on progressing the case!',
    category: 'task',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'task-overdue',
    title: 'Task Overdue',
    message:
      'Task "{{taskTitle}}" is overdue. Please complete it as soon as possible to avoid delays.',
    category: 'task',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'task-reminder',
    title: 'Task Reminder',
    message:
      'Reminder: Task "{{taskTitle}}" is due soon. Please complete it to maintain case progress.',
    category: 'task',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'appointment-scheduled',
    title: 'Appointment Scheduled',
    message:
      'Your appointment has been scheduled for {{scheduledAt}}. Type: {{type}}. Prepare your questions.',
    category: 'appointment',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'appointment-confirmed',
    title: 'Appointment Confirmed',
    message:
      'Your appointment has been confirmed. We look forward to meeting you at the scheduled time.',
    category: 'appointment',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'appointment-cancelled',
    title: 'Appointment Cancelled',
    message:
      'Your appointment has been cancelled. Please reschedule at your convenience.',
    category: 'appointment',
    priority: 'medium',
    language: 'en',
  },
  {
    slug: 'appointment-reminder',
    title: 'Appointment Reminder',
    message:
      "Reminder: You have an appointment scheduled for {{scheduledAt}}. Don't forget to prepare.",
    category: 'appointment',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'rating-received',
    title: 'New Rating Received',
    message:
      'You have received a {{overallRating}}-star rating from a client. Thank you for your excellent service!',
    category: 'rating',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'complaint-submitted',
    title: 'Complaint Submitted',
    message:
      'Your complaint "{{complaintTitle}}" has been submitted successfully. Our team will review and respond.',
    category: 'complaint',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'complaint-resolved',
    title: 'Complaint Resolved',
    message:
      'Your complaint "{{complaintTitle}}" has been resolved. Thank you for your patience.',
    category: 'complaint',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'appeal-submitted',
    title: 'Appeal Submitted',
    message:
      'Your appeal "{{appealTitle}}" has been submitted successfully. We will review and respond within 7 days.',
    category: 'appeal',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'appeal-decision',
    title: 'Appeal Decision',
    message:
      'A decision has been made on your appeal "{{appealTitle}}". Check your dashboard for details.',
    category: 'appeal',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'subscription-activated',
    title: 'Subscription Activated',
    message:
      'Your Sulhu subscription has been activated successfully. You can now provide legal services on our platform.',
    category: 'subscription',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'subscription-expired',
    title: 'Subscription Expired',
    message:
      'Your Sulhu subscription has expired. Renew to continue providing legal services on our platform.',
    category: 'subscription',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'brief-published',
    title: 'Client Brief Published',
    message:
      'A new client brief "{{briefTitle}}" has been published in your jurisdiction. Submit your proposal now!',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'brief-assigned',
    title: 'Brief Assigned',
    message:
      'Client brief "{{briefTitle}}" has been assigned to you. Contact the client to begin work.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'mediation-requested',
    title: 'Mediation Requested',
    message:
      'A mediation request has been submitted for your case. This may help resolve the dispute faster.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },
  {
    slug: 'mediation-scheduled',
    title: 'Mediation Scheduled',
    message:
      'Mediation has been scheduled for your case. Prepare your arguments and evidence.',
    category: 'case',
    priority: 'high',
    language: 'en',
  },

  {
    slug: 'new-message',
    title: 'New Message',
    message:
      'You have received a new message from {{senderName}}. Check your chat inbox to respond.',
    category: 'chat',
    priority: 'medium',
    language: 'en',
  },

  {
    slug: 'maintenance-notice',
    title: 'System Maintenance',
    message:
      'Sulhu will be undergoing scheduled maintenance. Some features may be temporarily unavailable.',
    category: 'system',
    priority: 'low',
    language: 'en',
  },
  {
    slug: 'security-alert',
    title: 'Security Alert',
    message:
      'We detected unusual activity on your account. Please verify your login and change your password if needed.',
    category: 'system',
    priority: 'urgent',
    language: 'en',
  },
];
