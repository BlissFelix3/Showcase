import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import config from 'src/config';
import { PushMessage } from './interfaces/notification.interface';
import { DeviceTokenRepository } from './repositories/device-token.repository';

@Injectable()
export class PushService {
  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.fcm.projectId,
          clientEmail: config.fcm.clientEmail,
          privateKey: config.fcm.privateKey?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendToToken(deviceTokens: string[], message: PushMessage) {
    const validTokens: string[] = [];

    for (const token of deviceTokens) {
      try {
        const payload = {
          notification: {
            title: message.notification.title,
            body: message.notification.body,
            imageUrl: message.notification.imageUrl,
          },
          data: message.data,
          token,
        };

        await admin.messaging().send(payload);
        validTokens.push(token);
      } catch (error) {
        console.error(
          `Error sending push notification to token ${token}:`,
          error.message,
        );

        if (
          error.errorInfo?.code ===
          'messaging/registration-token-not-registered'
        ) {
          await this.deviceTokenRepository.delete({ deviceToken: token });
        } else {
          throw new InternalServerErrorException(
            'Error sending push notification',
            error.message,
          );
        }
      }
    }

    return validTokens.length;
  }

  async sendToTopic(topics: string[], message: PushMessage) {
    topics.forEach(async (topic) => {
      try {
        await admin.messaging().send({
          notification: {
            title: message.notification.title,
            body: message.notification.body,
            imageUrl: message.notification.imageUrl,
          },
          data: message.data,
          topic,
        });
      } catch (error) {
        throw new InternalServerErrorException(
          'Error sending push notification',
          error.message,
        );
      }
    });
  }

  async subscribeToTopic(topics: string[], deviceTokens: string[]) {
    topics.forEach(async (topic) => {
      try {
        await admin.messaging().subscribeToTopic(deviceTokens, topic);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error subscribing to topic',
          error.message,
        );
      }
    });
  }

  async unSubscribeToTopic(topics: string[], deviceTokens: string[]) {
    topics.forEach(async (topic) => {
      try {
        await admin.messaging().unsubscribeFromTopic(deviceTokens, topic);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error unsubscribing from topic',
          error.message,
        );
      }
    });
  }
}
