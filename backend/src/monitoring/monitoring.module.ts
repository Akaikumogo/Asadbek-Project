import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { UsageRecord, UsageRecordSchema } from '../schemas/usage-record.schema';
import { Pump, PumpSchema } from '../schemas/pump.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsageRecord.name, schema: UsageRecordSchema },
      { name: Pump.name, schema: PumpSchema },
    ]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}

