import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface AuthenticatedRequest {
  user: {
    userId: string;
    role: string;
  };
}

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.LAWYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get current user tasks' })
  @ApiResponse({
    status: 200,
    description: 'User tasks retrieved successfully',
  })
  async findMyTasks(@Req() req: AuthenticatedRequest) {
    return this.tasksService.findByUser(req.user.userId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get tasks for a specific case' })
  @ApiResponse({
    status: 200,
    description: 'Case tasks retrieved successfully',
  })
  async findByCase(@Param('caseId') caseId: string) {
    return this.tasksService.findByCase(caseId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiResponse({
    status: 200,
    description: 'Overdue tasks retrieved successfully',
  })
  async getOverdueTasks() {
    return this.tasksService.getOverdueTasks();
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Get tasks by priority' })
  @ApiResponse({
    status: 200,
    description: 'Priority tasks retrieved successfully',
  })
  async getTasksByPriority(@Param('priority') priority: string) {
    return this.tasksService.getTasksByPriority(priority as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.tasksService.updateStatus(id, body.status as any);
  }

  @Put(':id/progress-notes')
  @ApiOperation({ summary: 'Add progress notes to task' })
  @ApiResponse({
    status: 200,
    description: 'Progress notes added successfully',
  })
  async addProgressNotes(
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    return this.tasksService.addProgressNotes(id, body.notes);
  }

  @Put(':id/time-tracking')
  @ApiOperation({ summary: 'Update task time tracking' })
  @ApiResponse({
    status: 200,
    description: 'Time tracking updated successfully',
  })
  async updateTimeTracking(
    @Param('id') id: string,
    @Body() body: { actualHours: number },
  ) {
    return this.tasksService.updateTimeTracking(id, body.actualHours);
  }

  @Delete(':id')
  @Roles(UserRole.LAWYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  async delete(@Param('id') id: string) {
    await this.tasksService.delete(id);
    return { message: 'Task deleted successfully' };
  }
}
