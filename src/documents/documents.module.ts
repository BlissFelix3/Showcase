import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentRepository } from './repositories/document.repository';
import { PaymentsModule } from '../payments/payments.module';
import { DocumentGenerationService } from './document-generation.service';

@Module({
  imports: [PaymentsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentRepository, DocumentGenerationService],
  exports: [DocumentsService, DocumentGenerationService],
})
export class DocumentsModule {}
