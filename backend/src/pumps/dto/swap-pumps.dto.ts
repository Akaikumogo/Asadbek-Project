import { IsString, IsNotEmpty } from 'class-validator';

export class SwapPumpsDto {
  @IsString()
  @IsNotEmpty()
  pump1Id: string;

  @IsString()
  @IsNotEmpty()
  pump2Id: string;
}

