import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoteDto } from './dto/vote.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List active projects' })
  async findAll(
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string, // votes, deadline
  ) {
    return this.projectsService.findAll(status, sortBy);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get project results (votes, funds, materials)' })
  async getResults(@Param('id') id: string) {
    return this.projectsService.getResults(id);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cast or change vote for a project' })
  async vote(@Param('id') id: string, @Request() req, @Body() voteDto?: VoteDto) {
    return this.projectsService.vote(id, req.user.userId, voteDto);
  }

  @Post(':id/donate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Donate to a project' })
  async donate(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { amount: number; currency: string; paymentProvider?: string },
  ) {
    return this.projectsService.donate(id, req.user.userId, body.amount, body.currency, body.paymentProvider);
  }
}

