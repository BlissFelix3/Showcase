import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProposalsService } from './proposals.service';
import { SubmitProposalDto } from './dto/submit-proposal.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { GetSession } from '../common/decorators/get-session.decorator';
import type { SessionData } from '../common/decorators/get-session.decorator';

@ApiTags('proposals')
@Controller('proposals')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post(':caseId')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Submit a proposal for a case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 201, description: 'Proposal submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  submit(
    @Param('caseId') caseId: string,
    @GetSession() session: SessionData,
    @Body() dto: SubmitProposalDto,
  ) {
    return this.proposalsService.submit(caseId, session.userId, dto);
  }

  @Post('accept/:proposalId')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Accept a proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiResponse({ status: 200, description: 'Proposal accepted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  accept(@Param('proposalId') proposalId: string) {
    return this.proposalsService.accept(proposalId);
  }

  @Get()
  @ApiOperation({ summary: 'Get proposals for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Proposals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(@GetSession() session: SessionData) {
    return this.proposalsService.listForUser(session.userId);
  }
}
