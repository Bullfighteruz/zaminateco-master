import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { ScanDto } from './dto/scan.dto';
import { ChatDto } from './dto/chat.dto';
import { PlannerDto } from './dto/planner.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async scanWaste(@Body() dto: ScanDto) {
    return this.aiService.scanWaste(dto);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async chatCoach(@Body() dto: ChatDto) {
    return this.aiService.chatCoach(dto);
  }

  @Post('planner')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async optimizePlanner(@Body() dto: PlannerDto) {
    return this.aiService.optimizePlanner(dto);
  }
}
