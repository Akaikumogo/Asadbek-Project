import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { SwapPumpsDto } from './dto/swap-pumps.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Pumps')
@Controller('pumps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pump' })
  async create(
    @Body() createPumpDto: CreatePumpDto,
    @CurrentUser() user: any,
  ) {
    return this.pumpsService.create(user.userId, createPumpDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pumps' })
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.findAll(user.userId, isAdmin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pump by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.findOne(id, user.userId, isAdmin);
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'Toggle pump on/off' })
  async togglePump(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.togglePump(id, user.userId, isAdmin);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap two pumps' })
  async swapPumps(@Body() swapPumpsDto: SwapPumpsDto, @CurrentUser() user: any) {
    return this.pumpsService.swapPumps(swapPumpsDto, user.userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update pump status (water level, wifi, etc.)' })
  async updateStatus(
    @Param('id') id: string,
    @Body()
    updates: {
      waterLevel?: number;
      wifiConnected?: boolean;
      waterUsage?: number;
      electricityUsage?: number;
    },
  ) {
    return this.pumpsService.updateStatus(id, updates);
  }

  @Post('failover')
  @ApiOperation({ summary: 'Trigger failover (activate backup pump)' })
  async handleFailover(@CurrentUser() user: any) {
    return this.pumpsService.handleFailover(user.userId);
  }

  @Post(':id/command')
  @ApiOperation({ summary: 'Send command to pump (motor, height, timer)' })
  async sendCommand(
    @Param('id') id: string,
    @Body() command: { motor?: 'ON' | 'OFF'; height?: number; timer?: number },
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.sendCommand(id, user.userId, command, isAdmin);
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get pump real-time data' })
  async getPumpData(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.getPumpData(id, user.userId, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pump' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.pumpsService.remove(id, user.userId, isAdmin);
  }
}

