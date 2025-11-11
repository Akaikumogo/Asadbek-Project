import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeviceCommandDto {
  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsNotEmpty()
  command: string;
}

