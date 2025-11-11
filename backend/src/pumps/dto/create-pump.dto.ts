import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreatePumpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mqttTopic: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  priority?: number;
}

