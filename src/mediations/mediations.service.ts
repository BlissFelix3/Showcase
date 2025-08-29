import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocalEvents } from '../utils/constants';
import type { Mediation } from '../common/interfaces';

@Injectable()
export class MediationsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private mediations = new Map<string, Mediation>();
  private reminders = new Map<
    string,
    { mediationId: string; dueDate: Date; message: string }
  >();

  initiate(
    caseId: string,
    mediatorId: string,
    reason: string,
    initiatorId: string,
  ): Mediation {
    const mediation: Mediation = {
      id: `mediation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      mediatorId,
      initiatorId,
      reason,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mediations.set(mediation.id, mediation);

    this.eventEmitter.emit(LocalEvents.MEDIATION_REQUESTED, {
      userId: mediatorId,
      slug: 'mediation-requested',
      mediation,
    });

    return mediation;
  }

  getByCase(caseId: string): Mediation | null {
    for (const mediation of this.mediations.values()) {
      if (mediation.caseId === caseId) {
        return mediation;
      }
    }
    return null;
  }

  updateStatus(mediationId: string, status: string, notes?: string): Mediation {
    const mediation = this.mediations.get(mediationId);
    if (!mediation) {
      throw new NotFoundException('Mediation not found');
    }

    mediation.status = status as Mediation['status'];
    mediation.notes = notes;
    mediation.updatedAt = new Date();

    this.mediations.set(mediationId, mediation);
    return mediation;
  }

  scheduleSession(
    mediationId: string,
    scheduledDate: string,
    location: string,
    notes?: string,
  ): Mediation {
    const mediation = this.mediations.get(mediationId);
    if (!mediation) {
      throw new NotFoundException('Mediation not found');
    }

    mediation.scheduledDate = new Date(scheduledDate);
    mediation.location = location;
    mediation.sessionNotes = notes;
    mediation.status = 'SCHEDULED';
    mediation.updatedAt = new Date();

    const reminderDate = new Date(mediation.scheduledDate);
    reminderDate.setHours(reminderDate.getHours() - 24);

    this.schedule(mediationId, reminderDate, 'Mediation session reminder');

    this.mediations.set(mediationId, mediation);

    this.eventEmitter.emit(LocalEvents.MEDIATION_SCHEDULED, {
      userId: mediation.initiatorId,
      slug: 'mediation-scheduled',
      mediation,
    });

    return mediation;
  }

  getUserMediations(userId: string, status?: string): Mediation[] {
    const userMediations: Mediation[] = [];

    for (const mediation of this.mediations.values()) {
      if (
        (mediation.initiatorId === userId || mediation.mediatorId === userId) &&
        (!status || mediation.status === status)
      ) {
        userMediations.push(mediation);
      }
    }

    return userMediations;
  }

  getMediationById(mediationId: string): Mediation | null {
    return this.mediations.get(mediationId) || null;
  }

  getAllMediations(): Mediation[] {
    return Array.from(this.mediations.values());
  }

  schedule(mediationId: string, dueDate: Date, message: string): void {
    const reminderId = `reminder_${mediationId}_${Date.now()}`;
    this.reminders.set(reminderId, {
      mediationId,
      dueDate,
      message,
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  sendReminders(): void {
    const now = new Date();

    for (const [reminderId, reminder] of this.reminders.entries()) {
      if (reminder.dueDate <= now) {
        this.sendMediationReminder(reminder.mediationId, reminder.message);
        this.reminders.delete(reminderId);
      }
    }
  }

  private sendMediationReminder(mediationId: string, message: string): void {
    try {
      const mediation = this.mediations.get(mediationId);
      if (!mediation) {
        return;
      }

      console.log(`Mediation reminder for ${mediationId}: ${message}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send mediation reminder: ${errorMessage}`);
    }
  }
}
