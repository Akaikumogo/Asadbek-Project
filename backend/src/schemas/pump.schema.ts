import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PumpDocument = Pump & Document;

@Schema({
  timestamps: true,
})
export class Pump {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  mqttTopic: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  waterLevel: number; // cm

  @Prop({
    type: Boolean,
    default: false,
  })
  wifiConnected: boolean;

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
    default: null,
  })
  lastActiveAt: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  priority: number; // for failover

  // Hardware specific fields
  @Prop({
    type: Number,
    default: 0,
  })
  height: number; // cm - belgilangan balandlik

  @Prop({
    type: Number,
    default: 0,
  })
  waterDepth: number; // cm - o'lchangan suv chuqurligi

  @Prop({
    type: Boolean,
    default: false,
  })
  timerActive: boolean; // Timer faolmi

  @Prop({
    type: Date,
    default: null,
  })
  timerEndTime: Date; // Timer tugash vaqti

  @Prop({
    type: Number,
    default: 0,
  })
  timerDuration: number; // Timer davomiyligi (milliseconds)

  @Prop({
    type: Boolean,
    default: false,
  })
  motorFault: boolean; // Motor nosoz bo'lsa

  @Prop({
    type: Number,
    default: 1,
  })
  activeMotor: number; // Qaysi motor faol (1 yoki 2)

  @Prop({
    type: Number,
    default: 0,
  })
  totalLitres: number; // Jami suv sarfi (litr)

  @Prop({
    type: Number,
    default: 0,
  })
  totalElectricity: number; // Jami elektr sarfi (kW)
}

export const PumpSchema = SchemaFactory.createForClass(Pump);

// Indexes
PumpSchema.index({ userId: 1 });
PumpSchema.index({ name: 1 });
PumpSchema.index({ isActive: 1 });

