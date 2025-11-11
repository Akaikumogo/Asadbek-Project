import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({
  timestamps: true,
})
export class Device {
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
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Indexes for better performance
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ name: 1 });

