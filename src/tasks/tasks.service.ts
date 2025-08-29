import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LessThan, In } from 'typeorm';
import { TaskRepository } from './repositories/task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, TaskPriority } from './entities/task.entity';
import { LocalEvents } from '../utils/constants';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createTaskDto: CreateTaskDto, assignedToId: string) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      assignedTo: { id: assignedToId },
      caseEntity: { id: createTaskDto.caseId },
      milestone: createTaskDto.milestoneId
        ? { id: createTaskDto.milestoneId }
        : null,
      status: 'PENDING',
      priority: createTaskDto.priority || 'MEDIUM',
    });

    const savedTask = await this.taskRepository.save(task);

    this.eventEmitter.emit(LocalEvents.TASK_ASSIGNED, {
      userId: assignedToId,
      slug: 'task-assigned',
      task: savedTask,
    });

    return savedTask;
  }

  async findAll() {
    return this.taskRepository.find({
      relations: ['assignedTo', 'caseEntity', 'milestone'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'caseEntity', 'milestone'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findByUser(userId: string) {
    return this.taskRepository.find({
      where: { assignedTo: { id: userId } },
      relations: ['caseEntity', 'milestone'],
      order: { dueDate: 'ASC', priority: 'DESC' },
    });
  }

  async findByCase(caseId: string) {
    return this.taskRepository.find({
      where: { caseEntity: { id: caseId } },
      relations: ['assignedTo', 'milestone'],
      order: { dueDate: 'ASC', priority: 'DESC' },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);

    Object.assign(task, updateTaskDto);

    if (updateTaskDto.status === 'COMPLETED') {
      task.completedDate = new Date();
    }

    return this.taskRepository.save(task);
  }

  async updateStatus(id: string, status: TaskStatus) {
    const task = await this.findOne(id);
    task.status = status;

    if (status === 'COMPLETED') {
      task.completedDate = new Date();
    }

    const savedTask = await this.taskRepository.save(task);

    if (status === 'COMPLETED') {
      this.eventEmitter.emit(LocalEvents.TASK_COMPLETED, {
        userId: task.assignedTo.id,
        slug: 'task-completed',
        task: savedTask,
      });
    }

    return savedTask;
  }

  async addProgressNotes(id: string, notes: string) {
    const task = await this.findOne(id);
    task.progressNotes = notes;
    return this.taskRepository.save(task);
  }

  async updateTimeTracking(id: string, actualHours: number) {
    const task = await this.findOne(id);
    task.actualHours = actualHours;
    return this.taskRepository.save(task);
  }

  async getOverdueTasks() {
    const now = new Date();
    return this.taskRepository.find({
      where: {
        dueDate: LessThan(now),
        status: In(['PENDING', 'IN_PROGRESS']),
      },
      relations: ['assignedTo', 'caseEntity'],
      order: { dueDate: 'ASC' },
    });
  }

  async getTasksByPriority(priority: TaskPriority) {
    return this.taskRepository.find({
      where: { priority },
      relations: ['assignedTo', 'caseEntity'],
      order: { dueDate: 'ASC' },
    });
  }

  async delete(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
