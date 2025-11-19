import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StoriesService } from './stories.service';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published stories' })
  async findAll(@Query('category') category?: string) {
    return this.storiesService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story by ID' })
  async findOne(@Param('id') id: string) {
    return this.storiesService.findOne(id);
  }
}

