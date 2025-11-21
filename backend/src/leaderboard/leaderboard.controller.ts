import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get leaderboard' })
  async getLeaderboard(
    @Query('period') period?: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard(period, limit);
  }
}

