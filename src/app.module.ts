import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { typeOrmConfig } from './config/data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { PaymentsModule } from './payments/payments.module';
import { ProposalsModule } from './proposals/proposals.module';
import { MilestonesModule } from './milestones/milestones.module';
import { DocumentsModule } from './documents/documents.module';
import { AIConsultationModule } from './ai-consultation/ai-consultation.module';
import { RatingsModule } from './ratings/ratings.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { VerificationModule } from './verification/verification.module';
import { MediationsModule } from './mediations/mediations.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { NotificationsModule } from './notifications/notification.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { LawReportsModule } from './law-reports/law-reports.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PracticeAreasModule } from './practice-areas/practice-areas.module';
import { ClientBriefsModule } from './client-briefs/client-briefs.module';
import { AppealsModule } from './appeals/appeals.module';
import { JurisdictionsModule } from './jurisdictions/jurisdictions.module';
import { LanguagePreferencesModule } from './language-preferences/language-preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    CasesModule,
    PaymentsModule,
    ProposalsModule,
    MilestonesModule,
    DocumentsModule,
    AIConsultationModule,
    RatingsModule,
    SubscriptionsModule,
    VerificationModule,
    MediationsModule,
    GeolocationModule,
    NotificationsModule,
    ConsultationsModule,
    LawReportsModule,
    TasksModule,
    ChatModule,
    ComplaintsModule,
    AppointmentsModule,
    PracticeAreasModule,
    ClientBriefsModule,
    AppealsModule,
    JurisdictionsModule,
    LanguagePreferencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
