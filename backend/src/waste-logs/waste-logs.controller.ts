import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WasteLogsService } from './waste-logs.service';
import { CreateWasteLogDto, UpdateWasteLogStatusDto, WasteLogFiltersDto } from './dto/waste-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';

@Controller('waste-logs')
export class WasteLogsController {
  constructor(private readonly wasteLogsService: WasteLogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDto: CreateWasteLogDto) {
    return this.wasteLogsService.create(req.user.userId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req, @Query() filters: WasteLogFiltersDto) {
    // If user is not admin, only show their own logs
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.userId;
    return this.wasteLogsService.findAll(userId, filters);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyLogs(@Request() req, @Query() filters: WasteLogFiltersDto) {
    return this.wasteLogsService.findAll(req.user.userId, filters);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req) {
    // If user is not admin, only show their own stats
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.userId;
    return this.wasteLogsService.getStats(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.wasteLogsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateWasteLogStatusDto,
    @Request() req,
  ) {
    return this.wasteLogsService.updateStatus(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.wasteLogsService.delete(id, req.user.userId);
  }
}

