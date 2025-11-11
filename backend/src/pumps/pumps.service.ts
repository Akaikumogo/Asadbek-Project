import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pump, PumpDocument } from '../schemas/pump.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreatePumpDto } from './dto/create-pump.dto';
import { SwapPumpsDto } from './dto/swap-pumps.dto';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class PumpsService {
  constructor(
    @InjectModel(Pump.name) private pumpModel: Model<PumpDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mqttService: MqttService
  ) {}

  async create(userId: string, createPumpDto: CreatePumpDto) {
    const pump = new this.pumpModel({
      ...createPumpDto,
      userId
    });
    await pump.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { devices: pump._id }
    });

    return pump;
  }

  async findAll(userId: string, isAdmin: boolean = false) {
    if (isAdmin) {
      return this.pumpModel.find().populate('userId', 'name email');
    }
    return this.pumpModel
      .find({ userId })
      .sort({ priority: -1, createdAt: -1 });
  }

  async findOne(pumpId: string, userId: string, isAdmin: boolean = false) {
    const pump = await this.pumpModel.findById(pumpId);
    if (!pump) {
      throw new NotFoundException('Pump not found');
    }

    if (!isAdmin && pump.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this pump');
    }

    return pump;
  }

  async togglePump(pumpId: string, userId: string, isAdmin: boolean = false) {
    const pump = await this.findOne(pumpId, userId, isAdmin);

    const newStatus = !pump.isActive;
    pump.isActive = newStatus;
    pump.lastActiveAt = newStatus ? new Date() : pump.lastActiveAt;
    await pump.save();

    // Send MQTT command
    const command = newStatus ? 'pump on' : 'pump off';
    await this.mqttService.publish(pump.mqttTopic, command);

    return pump;
  }

  async swapPumps(swapPumpsDto: SwapPumpsDto, userId: string) {
    const { pump1Id, pump2Id } = swapPumpsDto;

    if (pump1Id === pump2Id) {
      throw new BadRequestException('Cannot swap pump with itself');
    }

    const pump1 = await this.pumpModel.findById(pump1Id);
    const pump2 = await this.pumpModel.findById(pump2Id);

    if (!pump1 || !pump2) {
      throw new NotFoundException('One or both pumps not found');
    }

    if (
      pump1.userId.toString() !== userId ||
      pump2.userId.toString() !== userId
    ) {
      throw new ForbiddenException(
        'You do not have access to one or both pumps'
      );
    }

    // Swap priorities
    const tempPriority = pump1.priority;
    pump1.priority = pump2.priority;
    pump2.priority = tempPriority;

    await pump1.save();
    await pump2.save();

    return { pump1, pump2 };
  }

  async updateStatus(
    pumpId: string,
    updates: {
      waterLevel?: number;
      wifiConnected?: boolean;
      waterUsage?: number;
      electricityUsage?: number;
    }
  ) {
    const pump = await this.pumpModel.findByIdAndUpdate(
      pumpId,
      { ...updates, lastActiveAt: new Date() },
      { new: true }
    );

    if (!pump) {
      throw new NotFoundException('Pump not found');
    }

    return pump;
  }

  async remove(pumpId: string, userId: string, isAdmin: boolean = false) {
    const pump = await this.findOne(pumpId, userId, isAdmin);

    await this.userModel.findByIdAndUpdate(pump.userId, {
      $pull: { devices: pump._id }
    });

    await this.pumpModel.findByIdAndDelete(pumpId);
    return { message: 'Pump deleted successfully' };
  }

  // Auto failover: if active pump fails, activate backup
  async handleFailover(userId: string) {
    const pumps = await this.pumpModel
      .find({ userId, isActive: false })
      .sort({ priority: -1 })
      .limit(1);

    if (pumps.length > 0) {
      const backupPump = pumps[0];
      backupPump.isActive = true;
      backupPump.lastActiveAt = new Date();
      await backupPump.save();

      await this.mqttService.publish(backupPump.mqttTopic, 'pump on');
      return backupPump;
    }

    return null;
  }

  // Send command to pump (motor, height, timer)
  async sendCommand(
    pumpId: string,
    userId: string,
    command: { motor?: 'ON' | 'OFF'; height?: number; timer?: number },
    isAdmin: boolean = false
  ) {
    const pump = await this.findOne(pumpId, userId, isAdmin);

    // Motor command
    if (command.motor) {
      pump.isActive = command.motor === 'ON';
      pump.lastActiveAt =
        command.motor === 'ON' ? new Date() : pump.lastActiveAt;

      if (command.motor === 'ON') {
        pump.timerActive = false; // Manual buyruq kelsa timerni bekor qilamiz
      }

      await this.mqttService.publish(pump.mqttTopic, `motor ${command.motor}`);
    }

    // Height command
    if (command.height !== undefined) {
      pump.height = command.height;
      await this.mqttService.publish(
        pump.mqttTopic,
        `height ${command.height}`
      );
    }

    // Timer command
    if (command.timer !== undefined && command.timer > 0) {
      pump.timerDuration = command.timer * 1000; // milliseconds
      pump.timerEndTime = new Date(Date.now() + pump.timerDuration);
      pump.timerActive = true;
      pump.isActive = true; // Timer davomida motorni yoqib qo'yamiz
      pump.lastActiveAt = new Date();

      await this.mqttService.publish(pump.mqttTopic, `timer ${command.timer}`);
    }

    await pump.save();
    return pump;
  }

  // Get pump real-time data
  async getPumpData(pumpId: string, userId: string, isAdmin: boolean = false) {
    const pump = await this.findOne(pumpId, userId, isAdmin);

    // Calculate timer remaining
    let timerRemaining = '00:00';
    if (pump.timerActive && pump.timerEndTime) {
      const now = new Date();
      const endTime = new Date(pump.timerEndTime);
      if (now < endTime) {
        const remSec = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        const minutes = Math.floor(remSec / 60);
        const seconds = remSec % 60;
        timerRemaining = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } else {
        // Timer tugadi
        pump.timerActive = false;
        pump.isActive = false;
        await pump.save();
      }
    }

    return {
      waterDepth: pump.waterDepth,
      height: pump.height,
      totalLitres: pump.totalLitres,
      totalElectricity: pump.totalElectricity,
      motorState: pump.isActive ? 'ON' : 'OFF',
      timerRemaining,
      timerActive: pump.timerActive,
      motorFault: pump.motorFault,
      activeMotor: pump.activeMotor
    };
  }
}
