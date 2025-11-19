import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.event.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  async joinEvent(eventId: string, userId: string) {
    // Check if already joined
    const existing = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existing) {
      throw new Error('Already joined this event');
    }

    // Join event
    await this.prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
      },
    });

    // Update participant count
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        currentParticipants: { increment: 1 },
      },
    });

    return { success: true };
  }
}

