import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNewsDto) {
    const slug = this.generateSlug(createDto.title);
    
    return this.prisma.newsContent.create({
      data: {
        title: createDto.title,
        slug,
        content: createDto.content,
        mediaURL: createDto.mediaURL,
        date: createDto.date ? new Date(createDto.date) : new Date(),
      },
    });
  }

  async findAll(filters?: { limit?: number; offset?: number; search?: string }) {
    const where: any = {};
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.newsContent.findMany({
        where,
        orderBy: { date: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.newsContent.count({ where }),
    ]);

    return {
      data,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async findOne(slug: string) {
    const news = await this.prisma.newsContent.findUnique({
      where: { slug },
    });

    if (!news) {
      throw new NotFoundException('News content not found');
    }

    return news;
  }

  async update(slug: string, updateDto: UpdateNewsDto) {
    const existing = await this.prisma.newsContent.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException('News content not found');
    }

    const data: any = {};
    if (updateDto.title) {
      data.title = updateDto.title;
      data.slug = this.generateSlug(updateDto.title);
    }
    if (updateDto.content !== undefined) data.content = updateDto.content;
    if (updateDto.mediaURL !== undefined) data.mediaURL = updateDto.mediaURL;
    if (updateDto.date) data.date = new Date(updateDto.date);

    return this.prisma.newsContent.update({
      where: { slug },
      data,
    });
  }

  async delete(slug: string) {
    const news = await this.prisma.newsContent.findUnique({
      where: { slug },
    });

    if (!news) {
      throw new NotFoundException('News content not found');
    }

    await this.prisma.newsContent.delete({
      where: { slug },
    });

    return { success: true };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

