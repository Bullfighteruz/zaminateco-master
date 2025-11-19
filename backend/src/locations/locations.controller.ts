import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all action locations' })
  async findAll(
    @Query('type') type?: string,
    @Query('eventType') eventType?: string,
    @Query('district') district?: string,
  ) {
    return this.locationsService.findAll({ type, eventType, district });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find locations near coordinates' })
  async findByCoordinates(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.locationsService.findByCoordinates(lat, lng, radius);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }
}

