import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findAll(status?: string, sortBy?: string) {
    const where: any = status ? { status: status as any } : { status: 'ACTIVE' };
    
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'votes') {
      orderBy = { votes: { _count: 'desc' } };
    } else if (sortBy === 'deadline') {
      orderBy = { endDate: 'asc' };
    }

    return this.prisma.project.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            votes: true,
            donations: true,
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            votes: true,
            donations: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Increment views
    await this.prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return project;
  }

  async vote(projectId: string, userId: string, voteData?: { location?: string; impactArea?: string }) {
    // Check if already voted
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted for this project');
    }

    // Get project to determine impact area if not provided
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Map category to impact area
    const impactAreaMap: Record<string, string> = {
      school: 'SCHOOL',
      park: 'PARK',
      mahalla: 'MAHALLA',
      kindergarten: 'KINDERGARTEN',
      hospital: 'HOSPITAL',
      street: 'STREET',
    };

    const impactArea = voteData?.impactArea || impactAreaMap[project.category.toLowerCase()] || 'OTHER';

    // Create vote with location and impact area
    await this.prisma.vote.create({
      data: {
        userId,
        projectId,
        location: voteData?.location || project.district,
        impactArea: impactArea as any,
        voteDate: new Date(),
      },
    });

    // Award points to user
    await this.usersService.addEcoPoints(userId, 10);

    return project;
  }

  async donate(projectId: string, userId: string, amount: number, currency: string, paymentProvider?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Create donation
    const donation = await this.prisma.donation.create({
      data: {
        userId,
        projectId,
        amount,
        currency,
        paymentProvider: paymentProvider as any,
        paymentStatus: 'PENDING', // Will be updated by payment gateway webhook
      },
    });

    // TODO: Integrate with payment gateway (Payme/Click/Stripe)
    // For now, mark as success
    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { paymentStatus: 'SUCCESS' },
    });

    // Update project donation amount
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        donationRaised: {
          increment: amount,
        },
      },
    });

    // Award points (1 point per 1000 UZS or equivalent)
    const points = Math.floor(Number(amount) / 1000);
    await this.usersService.addEcoPoints(userId, points);

    return donation;
  }

  async getResults(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            votes: true,
            donations: true,
          },
        },
        donations: {
          where: {
            status: 'SUCCESS',
          },
          select: {
            amount: true,
            currency: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const totalDonations = project.donations.reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      },
      votes: {
        total: project._count.votes,
        needed: project.totalVotesNeeded || 1000,
      },
      funds: {
        raised: totalDonations,
        target: project.budgetRequired ? Number(project.budgetRequired) : 0,
        currency: 'UZS',
      },
      materials: {
        required: project.materialsRequiredKg || 0,
        collected: 0, // TODO: Calculate from collections
      },
      updates: await this.prisma.projectUpdate.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      }),
    };
  }
}

