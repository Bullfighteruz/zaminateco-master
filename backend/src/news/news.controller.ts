import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORG')
  create(@Body() createDto: CreateNewsDto) {
    return this.newsService.create(createDto);
  }

  @Get()
  findAll(@Query() filters: { limit?: number; offset?: number; search?: string }) {
    return this.newsService.findAll(filters);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.newsService.findOne(slug);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORG')
  update(@Param('slug') slug: string, @Body() updateDto: UpdateNewsDto) {
    return this.newsService.update(slug, updateDto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORG')
  remove(@Param('slug') slug: string) {
    return this.newsService.delete(slug);
  }
}

