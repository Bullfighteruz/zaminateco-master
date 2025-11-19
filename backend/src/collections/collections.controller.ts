import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log a material drop-off' })
  async createCollection(@Body() body: {
    collectionPointId: string;
    materialType: string;
    weightKg: number;
    photoUrl?: string;
  }, @Request() req) {
    return this.collectionsService.createCollection(body, req.user.userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user collection history' })
  async getUserCollections(@Param('userId') userId: string, @Request() req) {
    // Users can only view their own collections unless admin
    if (req.user.userId !== userId && req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.collectionsService.getUserCollections(userId);
  }
}

