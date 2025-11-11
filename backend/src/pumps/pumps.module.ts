import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PumpsService } from './pumps.service';
import { PumpsController } from './pumps.controller';
import { Pump, PumpSchema } from '../schemas/pump.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pump.name, schema: PumpSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MqttModule,
  ],
  controllers: [PumpsController],
  providers: [PumpsService],
  exports: [PumpsService],
})
export class PumpsModule {}

