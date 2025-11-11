import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsageRecord, UsageRecordDocument } from '../schemas/usage-record.schema';
import { Pump, PumpDocument } from '../schemas/pump.schema';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectModel(UsageRecord.name)
    private usageRecordModel: Model<UsageRecordDocument>,
    @InjectModel(Pump.name) private pumpModel: Model<PumpDocument>,
  ) {}

  async recordUsage(
    pumpId: string,
    userId: string,
    waterUsage: number,
    electricityUsage: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's record
    let record = await this.usageRecordModel.findOne({
      pumpId,
      userId,
      recordDate: today,
      recordType: 'daily',
    });

    if (record) {
      record.waterUsage += waterUsage;
      record.electricityUsage += electricityUsage;
      await record.save();
    } else {
      record = new this.usageRecordModel({
        pumpId,
        userId,
        waterUsage,
        electricityUsage,
        recordDate: today,
        recordType: 'daily',
      });
      await record.save();
    }

    // Update monthly record
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    let monthlyRecord = await this.usageRecordModel.findOne({
      pumpId,
      userId,
      recordDate: monthStart,
      recordType: 'monthly',
    });

    if (monthlyRecord) {
      monthlyRecord.waterUsage += waterUsage;
      monthlyRecord.electricityUsage += electricityUsage;
      await monthlyRecord.save();
    } else {
      monthlyRecord = new this.usageRecordModel({
        pumpId,
        userId,
        waterUsage,
        electricityUsage,
        recordDate: monthStart,
        recordType: 'monthly',
      });
      await monthlyRecord.save();
    }

    return record;
  }

  async getDailyUsage(pumpId: string, userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.usageRecordModel
      .find({
        pumpId,
        userId,
        recordDate: { $gte: startDate },
        recordType: 'daily',
      })
      .sort({ recordDate: -1 });
  }

  async getMonthlyUsage(pumpId: string, userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return this.usageRecordModel
      .find({
        pumpId,
        userId,
        recordDate: { $gte: startDate },
        recordType: 'monthly',
      })
      .sort({ recordDate: -1 });
  }

  async getTotalUsage(userId: string) {
    const records = await this.usageRecordModel.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalWater: { $sum: '$waterUsage' },
          totalElectricity: { $sum: '$electricityUsage' },
        },
      },
    ]);

    return records[0] || { totalWater: 0, totalElectricity: 0 };
  }
}

