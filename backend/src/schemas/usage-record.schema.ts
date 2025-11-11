import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UsageRecordDocument = UsageRecord & Document;

@Schema({
  timestamps: true,
})
export class UsageRecord {
  @Prop({
    type: Types.ObjectId,
    ref: 'Pump',
    required: true,
  })
  pumpId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  waterUsage: number; // liters

  @Prop({
    type: Number,
    default: 0,
  })
  electricityUsage: number; // kWh

  @Prop({
    type: Date,
    default: Date.now,
  })
  recordDate: Date;

  @Prop({
    type: String,
    enum: ['daily', 'monthly'],
    default: 'daily',
  })
  recordType: string;
}

export const UsageRecordSchema = SchemaFactory.createForClass(UsageRecord);

// Indexes for efficient queries
UsageRecordSchema.index({ pumpId: 1, recordDate: -1 });
UsageRecordSchema.index({ userId: 1, recordDate: -1 });
UsageRecordSchema.index({ recordType: 1 });

