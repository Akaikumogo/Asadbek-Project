import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceCommandDto } from './dto/device-command.dto';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mqttService: MqttService,
  ) {}

  async create(userId: string, createDeviceDto: CreateDeviceDto) {
    const device = new this.deviceModel({
      ...createDeviceDto,
      userId,
    });
    await device.save();

    // Add device to user's devices array
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { devices: device._id },
    });

    return device;
  }

  async findAll(userId: string, isAdmin: boolean = false) {
    if (isAdmin) {
      return this.deviceModel.find().populate('userId', 'name email');
    }
    return this.deviceModel.find({ userId });
  }

  async findOne(deviceId: string, userId: string, isAdmin: boolean = false) {
    const device = await this.deviceModel.findById(deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check if user owns the device or is admin
    if (!isAdmin && device.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this device');
    }

    return device;
  }
 async update(
    deviceId: string,
    userId: string,
    updateDeviceDto: UpdateDeviceDto,
    isAdmin: boolean = false,
  ) {
    const device = await this.findOne(deviceId, userId, isAdmin);

    // Update allowed fields
    Object.assign(device, updateDeviceDto);

    await device.save();
    return device;
  }
  async findByDeviceIdOrName(
    deviceId?: string,
    deviceName?: string,
  ): Promise<DeviceDocument | null> {
    if (deviceId) {
      return this.deviceModel.findById(deviceId);
    }
    if (deviceName) {
      return this.deviceModel.findOne({ name: deviceName });
    }
    return null;
  }

  async remove(deviceId: string, userId: string, isAdmin: boolean = false) {
    const device = await this.findOne(deviceId, userId, isAdmin);

    // Remove device from user's devices array
    await this.userModel.findByIdAndUpdate(device.userId, {
      $pull: { devices: device._id },
    });

    await this.deviceModel.findByIdAndDelete(deviceId);
    return { message: 'Device deleted successfully' };
  }

  async sendCommand(deviceCommandDto: DeviceCommandDto) {
    const { deviceId, deviceName, command } = deviceCommandDto;

    const device = await this.findByDeviceIdOrName(deviceId, deviceName);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Send command to MQTT
    await this.mqttService.publish(device.mqttTopic, command);

    return {
      message: 'Command sent successfully',
      device: device.name,
      topic: device.mqttTopic,
      command,
    };
  }
}

