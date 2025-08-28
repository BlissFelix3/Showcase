import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { DocumentsService } from './documents.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';
import type { DocumentStatus } from './entities/document.entity';

@ApiTags('documents')
@Controller('documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDocument(
    @GetSession() session: SessionData,
    @Body() dto: GenerateDocumentDto,
  ) {
    return this.documentsService.createDocument(session.userId, dto);
  }

  @Post(':id/generate')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Generate document after payment' })
  @ApiResponse({ status: 200, description: 'Document generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async generateDocument(@Param('id') id: string) {
    return this.documentsService.generateDocument(id);
  }

  @Put(':id/status')
  @Roles(UserRole.CLIENT, UserRole.LAWYER)
  @ApiOperation({ summary: 'Update document status' })
  @ApiResponse({ status: 200, description: 'Document status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocumentStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.documentsService.updateDocumentStatus(
      id,
      body.status as DocumentStatus,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Get('client/me')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Get current client documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyDocuments(@GetSession() session: SessionData) {
    return this.documentsService.getClientDocuments(session.userId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get documents by case ID' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocumentsByCase(@Param('caseId') caseId: string) {
    return this.documentsService.getClientDocuments(caseId);
  }
}
