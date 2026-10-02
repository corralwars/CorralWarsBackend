import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWorldObjectInstance {
  @IsNotEmpty()
  @IsString()
  access_token!: string;

  @IsNotEmpty()
  @IsString()
  worldObjectId!: string;

  @IsNotEmpty()
  @IsNumber()
  x!: number;

  @IsNotEmpty()
  @IsNumber()
  y!: number;

  @IsNotEmpty()
  @IsNumber()
  inventoryHeigh!: number;

  @IsNotEmpty()
  @IsNumber()
  inventoryWidth!: number;
}
