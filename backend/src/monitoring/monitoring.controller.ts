import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('usage')
  @ApiOperation({ summary: 'Record usage data' })
  async recordUsage(
    @Body()
    data: {
      pumpId: string;
      waterUsage: number;
      electricityUsage: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.monitoringService.recordUsage(
      data.pumpId,
      user.userId,
      data.waterUsage,
      data.electricityUsage,
    );
  }

  @Get('usage/daily/:pumpId')
  @ApiOperation({ summary: 'Get daily usage records' })
  async getDailyUsage(
    @Param('pumpId') pumpId: string,
    @Query('days') days: string,
    @CurrentUser() user: any,
  ) {
    return this.monitoringService.getDailyUsage(pumpId, user.userId, Number(days) || 30);
  }

  @Get('usage/monthly/:pumpId')
  @ApiOperation({ summary: 'Get monthly usage records' })
  async getMonthlyUsage(
    @Param('pumpId') pumpId: string,
    @Query('months') months: string,
    @CurrentUser() user: any,
  ) {
    return this.monitoringService.getMonthlyUsage(pumpId, user.userId, Number(months) || 12);
  }

  @Get('usage/total')
  @ApiOperation({ summary: 'Get total usage for user' })
  async getTotalUsage(@CurrentUser() user: any) {
    return this.monitoringService.getTotalUsage(user.userId);
  }
}

