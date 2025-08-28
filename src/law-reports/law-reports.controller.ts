import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { LawReportsService } from './law-reports.service';
import type {
  ReportCategory,
  ReportJurisdiction,
} from './entities/law-report.entity';

@ApiTags('law-reports')
@Controller('law-reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LawReportsController {
  constructor(private readonly lawReportsService: LawReportsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search law reports' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'category',
    required: false,
    schema: {
      type: 'string',
      enum: [
        'CONTRACT_LAW',
        'PROPERTY_LAW',
        'EMPLOYMENT_LAW',
        'CRIMINAL_LAW',
        'FAMILY_LAW',
        'COMMERCIAL_LAW',
        'CONSTITUTIONAL_LAW',
        'ADMINISTRATIVE_LAW',
      ],
    },
  })
  @ApiQuery({
    name: 'jurisdiction',
    required: false,
    schema: {
      type: 'string',
      enum: ['NIGERIA', 'LAGOS', 'ABUJA', 'KANO', 'RIVERS', 'OTHER'],
    },
  })
  @ApiQuery({ name: 'court', required: false, description: 'Court name' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'language', required: false, description: 'Language code' })
  async searchReports(
    @Query('q') query?: string,
    @Query('category') category?: ReportCategory,
    @Query('jurisdiction') jurisdiction?: ReportJurisdiction,
    @Query('court') court?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('language') language?: string,
  ) {
    const filters: {
      category?: ReportCategory;
      jurisdiction?: ReportJurisdiction;
      court?: string;
      startDate?: Date;
      endDate?: Date;
      language?: string;
    } = {};

    if (category) filters.category = category;
    if (jurisdiction) filters.jurisdiction = jurisdiction;
    if (court) filters.court = court;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (language) filters.language = language;

    return this.lawReportsService.searchReports(query || '', filters);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent law reports' })
  @ApiResponse({
    status: 200,
    description: 'Recent reports retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of reports to return',
  })
  async getRecentReports(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.lawReportsService.getRecentReports(limitNum);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get reports by category' })
  @ApiResponse({
    status: 200,
    description: 'Category reports retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of reports to return',
  })
  async getReportsByCategory(
    @Param('category') category: ReportCategory,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.lawReportsService.getReportsByCategory(category, limitNum);
  }

  @Get('jurisdiction/:jurisdiction')
  @ApiOperation({ summary: 'Get reports by jurisdiction' })
  @ApiResponse({
    status: 200,
    description: 'Jurisdiction reports retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of reports to return',
  })
  async getReportsByJurisdiction(
    @Param('jurisdiction') jurisdiction: ReportJurisdiction,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.lawReportsService.getReportsByJurisdiction(
      jurisdiction,
      limitNum,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get law report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Law report retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Law report not found' })
  async getReport(@Param('id') id: string) {
    return this.lawReportsService.getReportById(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related law reports' })
  @ApiResponse({
    status: 200,
    description: 'Related reports retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of reports to return',
  })
  async getRelatedReports(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.lawReportsService.getRelatedReports(id, limitNum);
  }

  @Get('tags/popular')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiResponse({
    status: 200,
    description: 'Popular tags retrieved successfully',
  })
  async getPopularTags() {
    return this.lawReportsService.getPopularTags();
  }
}
