import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class PumpCommandDto {
  @IsString()
  @IsOptional()
  motor?: 'ON' | 'OFF';

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number; // cm

  @IsNumber()
  @IsOptional()
  @Min(1)
  timer?: number; // seconds
}

