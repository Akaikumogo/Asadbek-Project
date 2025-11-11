import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<User, UserMethods>;

@Schema({
  timestamps: true,
})
export class User {
  _id: Types.ObjectId;
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    select: false,
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({
    type: [{ type: 'ObjectId', ref: 'Device' }],
    default: [],
  })
  devices: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

