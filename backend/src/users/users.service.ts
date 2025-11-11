import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Return lean objects without Mongoose methods to avoid typing conflicts
  async findAll(): Promise<
    (Omit<User, 'password'> & { _id: Types.ObjectId })[]
  > {
    return this.userModel.find().select('-password').lean();
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('devices')
      .select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
