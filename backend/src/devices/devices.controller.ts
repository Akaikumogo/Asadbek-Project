import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceCommandDto } from './dto/device-command.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async create(
    @Body() createDeviceDto: CreateDeviceDto,
    @CurrentUser() user: any
  ) {
    return this.devicesService.create(user.userId, createDeviceDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.devicesService.findAll(user.userId, isAdmin);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.devicesService.findOne(id, user.userId, isAdmin);
  }

  @Put(':id')
  async updateDevice(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Req() req: any
  ) {
    // req.user id va role bilan
    const userId = req.user?.userId || req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    return this.devicesService.update(id, userId, updateDeviceDto, isAdmin);
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.devicesService.remove(id, user.userId, isAdmin);
  }

  @Post('command')
  async sendCommand(@Body() deviceCommandDto: DeviceCommandDto) {
    return this.devicesService.sendCommand(deviceCommandDto);
  }
}
