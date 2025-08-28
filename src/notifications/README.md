# Sulhu Notification System

A comprehensive notification system for the Sulhu AI-powered legal platform, supporting multiple notification channels and event-driven architecture.

## 🚀 Features

### **Multi-Channel Notifications**

- ✅ **Email** - Mailgun integration with templated emails
- ✅ **SMS** - Configurable SMS provider support
- ✅ **WhatsApp** - WhatsApp Business API integration
- ✅ **Push Notifications** - Firebase Cloud Messaging (FCM)
- ✅ **In-App Notifications** - Persistent notification storage

### **Event-Driven Architecture**

- ✅ **Automatic Notifications** - Triggered by system events
- ✅ **Template-Based** - Reusable notification templates
- ✅ **Multi-Language Support** - Localized notifications
- ✅ **Priority System** - Urgent, High, Medium, Low priorities
- ✅ **Category Organization** - Organized by business function

### **Advanced Features**

- ✅ **Device Token Management** - Cross-platform push notifications
- ✅ **Topic Subscriptions** - Broadcast notifications to user groups
- ✅ **Bulk Notifications** - Send to multiple users simultaneously
- ✅ **Notification Statistics** - Track delivery and engagement
- ✅ **Template Variables** - Dynamic content replacement

## 🏗️ Architecture

### **Core Components**

```
src/notifications/
├── entities/                    # Database entities
│   ├── notification.entity.ts           # In-app notifications
│   ├── device-token.entity.ts          # Push notification tokens
│   └── notification-template.entity.ts # Reusable templates
├── repositories/               # Data access layer
│   ├── notification.repository.ts
│   ├── device-token.repository.ts
│   └── notification-template.repository.ts
├── services/                   # Business logic
│   ├── notification.service.ts         # Main notification service
│   ├── notifications.service.ts        # Legacy email service
│   └── push.service.ts                 # FCM push notifications
├── events/                     # Event handlers
│   └── notification.events.ts          # Sulhu-specific events
├── dto/                        # Data transfer objects
│   ├── create-notification.dto.ts
│   ├── update-notification.dto.ts
│   ├── device-token.dto.ts
│   ├── create-notification-template.dto.ts
│   ├── send-topic-notification.dto.ts
│   └── topic-subscription.dto.ts
├── interfaces/                 # TypeScript interfaces
│   └── notification.interface.ts
├── seeds/                      # Template data
│   └── notification-templates.seed.ts
└── notifications.module.ts     # Module configuration
```

### **Data Flow**

```
Event Trigger → Event Emitter → Event Handler → Notification Service → Channel Service → User Device
     ↓              ↓              ↓              ↓              ↓              ↓
Case Created → LocalEvents → handleCaseCreated → sendNotification → PushService → FCM → Mobile App
```

## 📱 Notification Channels

### **1. Email Notifications**

- **Provider**: Mailgun
- **Features**: HTML templates, dynamic content, attachments
- **Use Cases**: Payment confirmations, case updates, system alerts

### **2. SMS Notifications**

- **Provider**: Configurable (Twilio, Africa's Talking, etc.)
- **Features**: Short message delivery, delivery confirmations
- **Use Cases**: Appointment reminders, urgent alerts, OTP codes

### **3. WhatsApp Notifications**

- **Provider**: WhatsApp Business API
- **Features**: Rich media support, interactive messages
- **Use Cases**: Case updates, appointment confirmations, client communication

### **4. Push Notifications**

- **Provider**: Firebase Cloud Messaging (FCM)
- **Features**: Cross-platform, rich notifications, topic subscriptions
- **Use Cases**: Real-time updates, task assignments, milestone completions

### **5. In-App Notifications**

- **Storage**: Database persistence
- **Features**: Read/unread status, action URLs, metadata
- **Use Cases**: User dashboard, notification center, activity feed

## 🎯 Business Events

### **User Management**

- `USER_REGISTRATION_SUCCESSFUL` - Welcome notifications
- `USER_VERIFICATION_SUCCESSFUL` - Account activation
- `LAWYER_PROFILE_VERIFIED` - Profile approval

### **AI Consultation**

- `AI_CONSULTATION_CREATED` - Consultation initiated
- `AI_CONSULTATION_PROCESSED` - Analysis complete
- `AI_CONSULTATION_PAYMENT_CONFIRMED` - Payment successful

### **Case Management**

- `CASE_CREATED` - New case notification
- `CASE_ASSIGNED` - Lawyer assignment
- `CASE_COMPLETED` - Case completion
- `CASE_SUSPENDED` - Case suspension

### **Proposals & Hiring**

- `PROPOSAL_SUBMITTED` - New proposal received
- `PROPOSAL_ACCEPTED` - Proposal accepted
- `PROPOSAL_REJECTED` - Proposal not selected

### **Milestones & Payments**

- `MILESTONE_CREATED` - New milestone
- `MILESTONE_COMPLETED` - Milestone completion
- `ESCROW_CREATED` - Escrow setup
- `ESCROW_RELEASED` - Payment release

### **Documents & Tasks**

- `DOCUMENT_GENERATED` - Document ready
- `TASK_ASSIGNED` - New task assignment
- `TASK_OVERDUE` - Task deadline passed

### **Appointments & Communication**

- `APPOINTMENT_SCHEDULED` - Meeting scheduled
- `CHAT_MESSAGE_RECEIVED` - New message
- `APPOINTMENT_REMINDER` - Meeting reminder

## 🔧 Usage Examples

### **1. Send Notification Using Template**

```typescript
// In your service
@Inject(NotificationService)
private notificationService: NotificationService;

async handleCaseCreated(caseData: any) {
  await this.notificationService.sendNotificationWithTemplate({
    userId: caseData.clientId,
    templateSlug: 'case-created',
    data: {
      caseTitle: caseData.title,
      imageUrl: '/images/case-created.png'
    }
  });
}
```

### **2. Emit Event for Automatic Notification**

```typescript
// In your service
@Inject(EventEmitter2)
private eventEmitter: EventEmitter2;

async createCase(caseData: any) {
  const case = await this.caseRepository.save(caseData);

  // Emit event for automatic notification
  this.eventEmitter.emit(LocalEvents.CASE_CREATED, {
    userId: caseData.clientId,
    slug: 'case-created',
    caseData: case
  });

  return case;
}
```

### **3. Add Device Token for Push Notifications**

```typescript
// In your mobile app integration
await this.notificationService.addDeviceToken({
  userId: 'user-123',
  deviceToken: 'fcm-token-here',
  deviceType: 'android',
  appVersion: '1.0.0',
});
```

### **4. Subscribe to Topics**

```typescript
// Subscribe to jurisdiction-based notifications
await this.notificationService.subscribeToTopic({
  userId: 'lawyer-123',
  deviceToken: 'fcm-token-here',
  topic: 'jurisdiction-lagos',
});
```

## 📊 Template System

### **Template Variables**

Templates support dynamic content using `{{variableName}}` syntax:

```typescript
// Template
{
  slug: 'case-assigned',
  title: 'Case Assigned to Lawyer',
  message: 'Your case "{{caseTitle}}" has been assigned to a qualified lawyer.'
}

// Usage
await this.notificationService.sendNotificationWithTemplate({
  userId: 'client-123',
  templateSlug: 'case-assigned',
  data: {
    caseTitle: 'Contract Dispute Case'
  }
});

// Result: "Your case "Contract Dispute Case" has been assigned to a qualified lawyer."
```

### **Available Variables by Category**

#### **Case Notifications**

- `{{caseTitle}}` - Case title
- `{{caseId}}` - Case identifier
- `{{status}}` - Case status
- `{{lawyerName}}` - Assigned lawyer name

#### **Payment Notifications**

- `{{amount}}` - Payment amount
- `{{purpose}}` - Payment purpose
- `{{reference}}` - Payment reference
- `{{date}}` - Payment date

#### **Task Notifications**

- `{{taskTitle}}` - Task title
- `{{dueDate}}` - Task due date
- `{{priority}}` - Task priority
- `{{assignedTo}}` - Task assignee

## 🚀 Setup & Configuration

### **1. Environment Variables**

```env
# Firebase Configuration
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FCM_PROJECT_ID=your-firebase-project-id

# Mailgun Configuration
MAILGUN_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM=noreply@your-domain.com

# SMS Provider (example: Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# WhatsApp Business API
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### **2. Firebase Setup**

1. Create Firebase project
2. Download service account key
3. Enable Cloud Messaging
4. Configure Android/iOS apps

### **3. Template Seeding**

```typescript
// Seed notification templates
const templates = await this.notificationTemplateRepository.save(
  notificationTemplates,
);
```

## 📈 Monitoring & Analytics

### **Notification Statistics**

```typescript
// Get user notification stats
const stats = await this.notificationService.getNotificationStats(userId);
// Returns: { total: 50, unread: 12, read: 38, readPercentage: 76 }

// Get delivery statistics
const deliveryStats = await this.notificationService.getDeliveryStats();
```

### **Performance Metrics**

- **Delivery Rate**: Percentage of successful deliveries
- **Open Rate**: User engagement with notifications
- **Response Time**: Time from event to notification delivery
- **Channel Performance**: Comparison across notification channels

## 🔒 Security & Privacy

### **Data Protection**

- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based notification permissions
- **Audit Trail**: Complete notification history logging
- **GDPR Compliance**: User consent and data deletion

### **Rate Limiting**

- **Per User**: Maximum notifications per user per hour
- **Per Channel**: Channel-specific rate limits
- **Bulk Operations**: Controlled bulk notification sending

## 🧪 Testing

### **Unit Tests**

```bash
# Run notification tests
npm run test notifications

# Run specific test file
npm run test notification.service.spec.ts
```

### **Integration Tests**

```bash
# Test notification delivery
npm run test:e2e notifications
```

### **Manual Testing**

```bash
# Test push notifications
curl -X POST http://localhost:3000/notifications/send-template \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "templateSlug": "test-notification",
    "data": {"testVar": "test value"}
  }'
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Push Notifications Not Working**

1. Check Firebase configuration
2. Verify device token registration
3. Check FCM project settings
4. Validate app bundle ID

#### **Email Delivery Issues**

1. Verify Mailgun configuration
2. Check domain verification
3. Review email templates
4. Check spam filters

#### **Template Variables Not Replaced**

1. Ensure variable names match exactly
2. Check data object structure
3. Verify template slug exists
4. Review template syntax

### **Debug Mode**

```typescript
// Enable debug logging
this.logger.debug('Notification payload:', payload);
this.logger.debug('Template data:', templateData);
```

## 📚 API Reference

### **Endpoints**

- `POST /notifications` - Create notification
- `POST /notifications/template` - Create template
- `POST /notifications/send-template` - Send using template
- `GET /notifications/user/:userId` - Get user notifications
- `PUT /notifications/mark-as-read/:id` - Mark as read
- `POST /notifications/device-token` - Add device token
- `POST /notifications/send-topic` - Send topic notification

### **Webhooks**

- **Delivery Confirmation**: Track notification delivery status
- **User Engagement**: Monitor notification interactions
- **Error Reporting**: Handle delivery failures

## 🤝 Contributing

### **Adding New Notification Types**

1. **Define Event**: Add to `LocalEvents` in constants
2. **Create Template**: Add to notification templates seed
3. **Implement Handler**: Add event handler in `NotificationEvents`
4. **Update Documentation**: Document new notification type

### **Adding New Channels**

1. **Create Service**: Implement channel-specific service
2. **Add Interface**: Define channel interface
3. **Update Module**: Register in notifications module
4. **Add Configuration**: Environment variables and config

## 📄 License

This notification system is part of the Sulhu platform and follows the same licensing terms.

---

**Built with ❤️ for the Sulhu Legal Platform**
