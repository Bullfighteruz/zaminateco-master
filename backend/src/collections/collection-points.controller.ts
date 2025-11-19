import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('collection-points')
@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List collection points' })
  async getCollectionPoints(
    @Query('materialType') materialType?: string,
    @Query('district') district?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.collectionsService.getCollectionPoints({
      materialType,
      district,
      status,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection point details' })
  async getCollectionPointById(@Param('id') id: string) {
    return this.collectionsService.getCollectionPointById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add new collection point (admin/moderator)' })
  async createCollectionPoint(@Body() body: any, @Request() req) {
    // Check if user is admin or moderator
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
      throw new Error('Unauthorized');
    }
    return this.collectionsService.createCollectionPoint(body, req.user.userId);
  }
}

