import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShopService } from './shop.service';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async findAll(@Query('category') category?: string) {
    return this.shopService.findAll(category);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.shopService.findOne(id);
  }
}

