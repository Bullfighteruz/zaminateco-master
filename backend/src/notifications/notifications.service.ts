import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export enum NotificationType {
  VOTE_RESULT = 'VOTE_RESULT',
  EVENT_REMINDER = 'EVENT_REMINDER',
  NEW_STORY = 'NEW_STORY',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  POINTS_EARNED = 'POINTS_EARNED',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  ORDER_STATUS = 'ORDER_STATUS',
}

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Send notification (creates DB record and sends push/email if enabled)
   */
  async sendNotification(payload: NotificationPayload) {
    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type as any,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        metadata: payload.data,
      },
    });

    // Get user settings
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (!user) return notification;

    const settings = user.settings || {
      emailNotifications: true,
      pushNotifications: true,
    };

    // Send push notification if enabled
    if (settings.pushNotifications) {
      await this.sendPushNotification(payload.userId, payload);
    }

    // Send email notification if enabled
    if (settings.emailNotifications && user.email) {
      await this.sendEmailNotification(user.email, payload);
    }

    return notification;
  }

  /**
   * Send push notification via FCM
   */
  private async sendPushNotification(
    userId: string,
    payload: NotificationPayload,
  ) {
    // Get user's FCM tokens (stored in user settings or separate table)
    // For now, we'll use a placeholder
    const fcmToken = await this.getFCMToken(userId);
    if (!fcmToken) return;

    const fcmServerKey = this.configService.get<string>('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.warn('FCM_SERVER_KEY not configured, skipping push notification');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          'https://fcm.googleapis.com/fcm/send',
          {
            to: fcmToken,
            notification: {
              title: payload.title,
              body: payload.message,
            },
            data: {
              type: payload.type,
              link: payload.link || '',
              ...payload.data,
            },
          },
          {
            headers: {
              Authorization: `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    email: string,
    payload: NotificationPayload,
  ) {
    const emailService = this.configService.get<string>('EMAIL_SERVICE', 'console');
    
    if (emailService === 'console') {
      // Development: log to console
      console.log(`Email to ${email}:`, {
        subject: payload.title,
        body: payload.message,
        link: payload.link,
      });
      return;
    }

    // Use SendGrid, Mailgun, or other email service
    const emailApiKey = this.configService.get<string>('EMAIL_API_KEY');
    if (!emailApiKey) {
      console.warn('EMAIL_API_KEY not configured, skipping email notification');
      return;
    }

    try {
      // Example with SendGrid
      await firstValueFrom(
        this.httpService.post(
          'https://api.sendgrid.com/v3/mail/send',
          {
            personalizations: [
              {
                to: [{ email }],
                subject: payload.title,
              },
            ],
            from: {
              email: this.configService.get<string>('EMAIL_FROM', 'noreply@zaminat.uz'),
              name: 'Zaminat',
            },
            content: [
              {
                type: 'text/html',
                value: this.generateEmailTemplate(payload),
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${emailApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Schedule event reminder notifications
   */
  async scheduleEventReminders(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event || !event.startTime) return;

    // Schedule reminders 24 hours and 1 hour before event
    const reminders = [
      { hours: 24, label: '24 hours' },
      { hours: 1, label: '1 hour' },
    ];

    for (const reminder of reminders) {
      const reminderTime = new Date(event.startTime);
      reminderTime.setHours(reminderTime.getHours() - reminder.hours);

      // In production, use a job queue (Bull, Agenda, etc.)
      // For now, we'll create notifications scheduled for later
      for (const participant of event.participants) {
        if (participant.status === 'REGISTERED') {
          await this.prisma.notification.create({
            data: {
              userId: participant.userId,
              type: 'EVENT_REMINDER',
              title: 'Event Reminder',
              message: `Don't forget! "${event.title}" starts in ${reminder.label}`,
              link: `/events/${eventId}`,
              metadata: {
                eventId,
                scheduledFor: reminderTime,
              },
            },
          });
        }
      }
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    unreadOnly: boolean = false,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  private async getFCMToken(userId: string): Promise<string | null> {
    // In production, store FCM tokens in a separate table or user settings
    // For now, return null
    return null;
  }

  private generateEmailTemplate(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Zaminat</h1>
            </div>
            <div class="content">
              <h2>${payload.title}</h2>
              <p>${payload.message}</p>
              ${payload.link ? `<a href="${payload.link}" class="button">View Details</a>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

