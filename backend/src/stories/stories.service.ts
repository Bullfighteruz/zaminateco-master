import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.story.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
    });

    if (story) {
      // Increment views
      await this.prisma.story.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return story;
  }
}

