# Sulhu - AI-Powered Legal Platform

Sulhu is an innovative artificial intelligence (AI) powered technology that speeds up justice delivery process, provides legal consultations and advice, and encourages mediation and out-of-court settlement.

## 🚀 Features

### Core AI Functionality

- **AI Legal Consultation**: Virtual legal consultations with AI analysis and recommendations
- **Multi-language Support**: AI responds in client's chosen language
- **Legal Document Generation**: Automated generation of legal documents (agreements, notices, contracts, etc.)
- **Law Reports**: Access to recent and relevant legal case reports
- **Smart Recommendations**: AI suggests mediation, out-of-court settlement, or litigation

### Legal Services Management

- **Case Management**: Complete case lifecycle management
- **Proposal System**: Lawyers submit proposals with confidential fee quotes
- **Milestone Tracking**: Project progress with milestone-based payments
- **Escrow System**: Secure payment holding until project completion
- **Task Management**: Progress tracking and reminder system

### User Management

- **Lawyer Verification**: Comprehensive verification system with document uploads
- **Client Management**: Client profile and case history
- **Rating System**: Lawyer performance ratings and reviews
- **Complaint Resolution**: Dispute mediation and resolution system

### Payment & Financial

- **Consultation Payments**: Paystack integration for AI consultation fees
- **Escrow Payments**: Secure escrow for lawyer fees
- **Milestone Payments**: Tranche-based payment system
- **Commission System**: 10% platform commission on lawyer fees

## 🏗️ Architecture

### Technology Stack

- **Backend**: NestJS with TypeScript
- **Database**: TypeORM with MySQL 8.0+ (primary) / PostgreSQL (alternative)
- **Authentication**: JWT with Passport
- **Payment**: Paystack integration + Custom escrow system
- **Documentation**: Swagger/OpenAPI

### Module Structure

```
src/
├── auth/                 # Authentication & authorization
├── users/                # User management (lawyers, clients)
├── ai-consultation/      # AI legal consultation system
├── documents/            # Legal document generation
├── law-reports/          # Legal case reports and search
├── cases/                # Case management
├── proposals/            # Lawyer proposals and hiring
├── milestones/           # Project milestones and progress
├── payments/             # Payment processing and escrow
├── tasks/                # Task management and tracking
├── ratings/              # Lawyer rating and review system
├── complaints/           # Dispute resolution and mediation
├── notifications/        # Email, SMS, WhatsApp notifications
└── verification/         # Lawyer verification system
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8.0+ (recommended) or PostgreSQL

### Installation

````bash
# Clone the repository
git clone <repository-url>
cd Lawent-Showcase

# Install dependencies
npm install

# Set up MySQL database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lawent_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Set up environment variables
cp .env.example .env
# Edit .env with your MySQL configuration

# Build the project
npm run build

# Start development server
npm run start:dev

### Database Setup

The application uses MySQL as the primary database. Make sure you have MySQL installed and running:

```bash
# Install MySQL (macOS)
brew install mysql

# Start MySQL service
brew services start mysql

# Secure MySQL installation
mysql_secure_installation

# Create database and user
mysql -u root -p
CREATE DATABASE lawent_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lawent_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lawent_showcase.* TO 'lawent_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
````

Update your `.env` file with the database credentials you created.

````

### Environment Variables

```env
# Database (MySQL)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lawent_showcase

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public

# Frontend URL
FRONTEND_URL=http://localhost:3000
````

## 📚 API Documentation

Once the server is running, visit `/api` for interactive Swagger documentation.

### Key Endpoints

#### AI Consultation

- `POST /ai-consultations` - Create new consultation
- `POST /ai-consultations/:id/process` - Process AI consultation
- `GET /ai-consultations/client/me` - Get client consultations

#### Document Generation

- `POST /documents` - Create new document
- `POST /documents/:id/generate` - Generate document after payment
- `GET /documents/client/me` - Get client documents

#### Law Reports

- `GET /law-reports/search` - Search law reports
- `GET /law-reports/recent` - Get recent reports
- `GET /law-reports/category/:category` - Get reports by category

#### Cases & Proposals

- `POST /cases` - Create new case
- `POST /proposals` - Submit lawyer proposal
- `POST /proposals/:id/accept` - Accept lawyer proposal

#### Payments

- `POST /payments/escrow` - Create escrow payment
- `POST /payments/escrow/:id/release` - Release escrow funds
- `POST /payments/verify` - Verify payment

## 🔐 Authentication

The platform uses JWT-based authentication with role-based access control:

- **CLIENT**: Can create cases, hire lawyers, make payments
- **LAWYER**: Can submit proposals, manage cases, track milestones
- **ADMIN**: Can manage platform, resolve disputes, verify lawyers

## 💰 Payment Flow

### AI Consultation

1. Client creates consultation request
2. System generates payment link via Paystack
3. Client completes payment
4. AI processes consultation and provides recommendations

### Legal Services

1. Client hires lawyer through proposal system
2. Payment held in escrow
3. Lawyer works on milestones
4. Client approves milestones
5. Escrow released to lawyer

## 🌍 Multi-language Support

The platform supports multiple languages through the i18n module. Language can be specified via:

- Query parameter: `?lang=fr`
- Header: `x-lang: fr`
- Accept-Language header

## 🔧 Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting
- No circular dependencies allowed

### Database

- TypeORM entities with proper relationships
- Repository pattern for data access
- Migrations for schema changes

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Production Deployment

### Database

- Use PostgreSQL or MySQL for production
- Configure connection pooling
- Set up proper indexes

### Security

- Use strong JWT secrets
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting

### Monitoring

- Health check endpoints
- Logging and error tracking
- Performance monitoring

## 📋 Roadmap

### Phase 1 (Current)

- ✅ Core AI consultation system
- ✅ Document generation
- ✅ Basic case management
- ✅ Payment integration

### Phase 2 (Next)

- 🔄 Advanced AI features
- 🔄 Mobile app development
- 🔄 Advanced analytics
- 🔄 Multi-currency support

### Phase 3 (Future)

- 📋 Blockchain integration
- 📋 Advanced mediation tools
- 📋 International expansion
- 📋 AI-powered dispute resolution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions, please contact the development team.

---

**Sulhu** - Revolutionizing legal services through AI and technology.
