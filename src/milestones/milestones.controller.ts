import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('milestones')
@Controller('milestones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post(':caseId')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Create a milestone for a case' })
  @ApiResponse({ status: 201, description: 'Milestone created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(dto, caseId);
  }

  @Post(':caseId/:milestoneId/fund')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Fund a milestone' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { amountMinor: { type: 'number', example: 100000 } },
    },
  })
  @ApiResponse({ status: 200, description: 'Milestone funded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  fund(
    @Param('caseId') caseId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: { amountMinor: number },
  ) {
    return this.milestonesService.fund(caseId, milestoneId, body.amountMinor);
  }

  @Post(':milestoneId/complete')
  @Roles(UserRole.LAWYER)
  @ApiOperation({ summary: 'Mark a milestone as completed' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  complete(@Param('milestoneId') milestoneId: string) {
    return this.milestonesService.complete(milestoneId);
  }
}
